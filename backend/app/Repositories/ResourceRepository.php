<?php
declare(strict_types=1);

namespace App\Repositories;

use PDO;

final class ResourceRepository
{
    private const CATALOG = 'SELECT id, kind, name, description, capacity, quantity,
        (SELECT filename FROM resource_images WHERE resource_id = resources.id ORDER BY id DESC LIMIT 1) AS filename
        FROM resources WHERE kind = :kind AND archived_at IS NULL';

    public function __construct(private readonly PDO $db)
    {
    }

    public function list(string $kind): array
    {
        $query = $this->db->prepare(self::CATALOG . ' ORDER BY name, id');
        $query->execute(['kind' => $kind]);

        return array_map(self::resource(...), $query->fetchAll());
    }

    public function find(string $kind, string $id): ?array
    {
        $query = $this->db->prepare(self::CATALOG . ' AND id = :id');
        $query->execute(['kind' => $kind, 'id' => $id]);
        $row = $query->fetch();

        return $row === false ? null : self::resource($row);
    }

    public function occupied(string $id, string $from, string $to): array
    {
        $query = $this->db->prepare(
            "SELECT id, starts_at, ends_at, status FROM reservations
             WHERE resource_id = ? AND starts_at < ? AND ends_at > ?
             AND status IN ('pending', 'approved') ORDER BY starts_at, id"
        );
        $query->execute([$id, $to, $from]);
        return $query->fetchAll();
    }

    private static function resource(array $row): array
    {
        $resource = [
            'id' => (string) $row['id'],
            'type' => $row['kind'],
            'name' => $row['name'],
            'description' => $row['description'],
        ];

        if ($row['kind'] === 'room') {
            $resource['capacity'] = (int) $row['capacity'];
        } else {
            $resource['quantity'] = (int) $row['quantity'];
        }
        if ($row['filename'] !== null) {
            $resource['imageUrl'] = '/api/resource-images/' . $row['filename'];
        }

        return $resource;
    }
}
