<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\ApiProblem;
use App\Core\ProtectedApi;
use App\Core\Router;
use PDO;
use Throwable;

final class AdminController
{
    private const ADMIN = ['admin'];
    private const ROLES = ['student', 'manager', 'admin'];
    private const SELECT = 'SELECT CAST(id AS CHAR) AS id, kind AS type, name, description,
        capacity, quantity, location, opening_hours AS openingHours, archived_at AS archivedAt FROM resources';

    public static function register(Router $router): void
    {
        $router->add('GET', '/api/admin/resources', static fn () => ProtectedApi::run(
            self::ADMIN, false, static fn (PDO $db) => array_map(self::resource(...),
                $db->query(self::SELECT . ' ORDER BY name, id')->fetchAll())
        ));
        $router->add('POST', '/api/admin/resources', static fn () => ProtectedApi::run(
            self::ADMIN, true, static fn (PDO $db) => self::save($db, null), 201
        ));
        $router->add('PATCH', '/api/admin/resources/{id}', static fn (string $id) => ProtectedApi::run(
            self::ADMIN, true, static fn (PDO $db) => self::save($db, ProtectedApi::id($id))
        ));
        $router->add('DELETE', '/api/admin/resources/{id}', static fn (string $id) => ProtectedApi::run(
            self::ADMIN, true, static function (PDO $db) use ($id): array {
                $id = ProtectedApi::id($id);
                $query = $db->prepare('UPDATE resources SET archived_at = COALESCE(archived_at, UTC_TIMESTAMP()) WHERE id = ?');
                $query->execute([$id]);
                return self::find($db, $id);
            }
        ));
        $router->add('POST', '/api/admin/resources/{id}/images', static fn (string $id) => ProtectedApi::run(
            self::ADMIN, true, static fn (PDO $db) => self::upload($db, ProtectedApi::id($id)), 201
        ));
        $router->add('GET', '/api/admin/users', static fn () => ProtectedApi::run(
            self::ADMIN, false, static fn (PDO $db) => self::users($db)
        ));
        $router->add('GET', '/api/admin/roles', static fn () => ProtectedApi::run(
            self::ADMIN, false, static fn () => self::ROLES
        ));
        $router->add('PUT', '/api/admin/users/{id}/roles', static fn (string $id) => ProtectedApi::run(
            self::ADMIN, true, static fn (PDO $db) => self::setRoles($db, ProtectedApi::id($id))
        ));
    }

    private static function save(PDO $db, ?string $id): array
    {
        $body = ProtectedApi::body();
        $db->beginTransaction();
        try {
            $old = $id === null ? [] : self::find($db, $id, true);
            if ($old && (isset($body['type']) && $body['type'] !== $old['type'] || $old['archivedAt'] !== null)) {
                throw new ApiProblem('RESOURCE_CONFLICT', 'Typ existujúceho zdroja alebo archivovaný zdroj sa nedá zmeniť.', 409);
            }
            $data = $body + $old;
            $kind = $data['type'] ?? null;
            $amount = $kind === 'room' ? ($data['capacity'] ?? null) : ($data['quantity'] ?? null);
            if (!in_array($kind, ['room', 'equipment'], true) || !is_int($amount) || $amount < 1 || $amount > 1000000) {
                throw new ApiProblem('INVALID_RESOURCE', 'Zadajte typ a platnú kapacitu alebo množstvo.', 400);
            }
            if ($kind === 'equipment' && $old && $amount < $old['quantity']) {
                $busy = $db->prepare("SELECT 1 FROM reservations WHERE resource_id = ? AND ends_at > UTC_TIMESTAMP()
                    AND status IN ('pending', 'approved') LIMIT 1");
                $busy->execute([$id]);
                if ($busy->fetch()) {
                    throw new ApiProblem('RESOURCE_CONFLICT', 'Zdroj má aktívne rezervácie.', 409);
                }
            }
            $hours = self::hours($data['openingHours'] ?? null);
            $params = [
                $kind,
                ProtectedApi::text($data['name'] ?? null, 100),
                ProtectedApi::text($data['description'] ?? null, 500),
                $kind === 'room' ? $amount : null,
                $kind === 'equipment' ? $amount : null,
                ProtectedApi::text($data['location'] ?? '', 100, false),
                $hours,
            ];
            if ($id === null) {
                $write = $db->prepare('INSERT INTO resources
                    (kind, name, description, capacity, quantity, location, opening_hours) VALUES (?, ?, ?, ?, ?, ?, ?)');
                $write->execute($params);
                $id = $db->lastInsertId();
            } else {
                $write = $db->prepare('UPDATE resources SET kind = ?, name = ?, description = ?,
                    capacity = ?, quantity = ?, location = ?, opening_hours = ? WHERE id = ?');
                $write->execute([...$params, $id]);
            }
            $result = self::find($db, $id);
            $db->commit();
            return $result;
        } catch (Throwable $error) {
            $db->rollBack();
            throw $error;
        }
    }

    private static function hours(mixed $value): ?string
    {
        if ($value === null) {
            return null;
        }
        if (!is_array($value)) {
            throw new ApiProblem('INVALID_HOURS', 'Neplatné otváracie hodiny.', 400);
        }
        foreach ($value as $day => $periods) {
            if (!is_int($day) || $day < 1 || $day > 7 || !is_array($periods) || !array_is_list($periods)) {
                throw new ApiProblem('INVALID_HOURS', 'Neplatný deň otváracích hodín.', 400);
            }
            foreach ($periods as $period) {
                $start = $period['start'] ?? null;
                $end = $period['end'] ?? null;
                $pattern = '/^(?:[01][0-9]|2[0-3]):[0-5][0-9]$/D';
                if (!is_string($start) || !is_string($end) || !preg_match($pattern, $start) ||
                    !preg_match($pattern, $end) || $start >= $end) {
                    throw new ApiProblem('INVALID_HOURS', 'Neplatný interval otváracích hodín.', 400);
                }
            }
        }
        return json_encode((object) $value, JSON_THROW_ON_ERROR);
    }

    private static function find(PDO $db, string $id, bool $lock = false): array
    {
        $query = $db->prepare(self::SELECT . ' WHERE id = ?' . ($lock ? ' FOR UPDATE' : ''));
        $query->execute([$id]);
        $row = $query->fetch();
        if (!$row) {
            throw new ApiProblem('RESOURCE_NOT_FOUND', 'Zdroj sa nenašiel.', 404);
        }
        return self::resource($row);
    }

    private static function resource(array $row): array
    {
        $row['openingHours'] = json_decode($row['openingHours'] ?? 'null', true);
        return $row;
    }

    private static function users(PDO $db, ?string $id = null): array
    {
        $sql = "SELECT CAST(p.id AS CHAR) AS id, CONCAT_WS(' ', p.first_name, p.last_name) AS name,
            p.email, a.active, GROUP_CONCAT(r.role ORDER BY r.role) AS roleList
            FROM people p JOIN accounts a ON a.person_id = p.id LEFT JOIN account_roles r ON r.person_id = p.id";
        $query = $db->prepare($sql . ($id === null ? '' : ' WHERE p.id = ?') .
            ' GROUP BY p.id, a.active ORDER BY name, p.id');
        $query->execute($id === null ? [] : [$id]);
        $rows = array_map(static function (array $row): array {
            $row['active'] = (bool) $row['active'];
            $row['roles'] = $row['roleList'] ? explode(',', $row['roleList']) : [];
            unset($row['roleList']);
            return $row;
        }, $query->fetchAll());
        return $id === null ? $rows : ($rows[0] ?? throw new ApiProblem('USER_NOT_FOUND', 'Účet sa nenašiel.', 404));
    }

    private static function setRoles(PDO $db, string $id): array
    {
        $roles = ProtectedApi::body()['roles'] ?? null;
        if (!is_array($roles) || !array_is_list($roles) || count($roles) > count(self::ROLES)) {
            throw new ApiProblem('INVALID_ROLES', 'Neplatné roly.', 400);
        }
        foreach ($roles as $role) {
            if (!in_array($role, self::ROLES, true)) {
                throw new ApiProblem('INVALID_ROLES', 'Neplatné roly.', 400);
            }
        }
        $db->beginTransaction();
        try {
            $admins = $db->query("SELECT r.person_id FROM account_roles r JOIN accounts a ON a.person_id = r.person_id
                WHERE r.role = 'admin' AND a.active = 1 ORDER BY r.person_id FOR UPDATE")->fetchAll(PDO::FETCH_COLUMN);
            $user = self::users($db, $id);
            if ($user['active'] && in_array('admin', $user['roles'], true) &&
                !in_array('admin', $roles, true) && count($admins) <= 1
            ) {
                throw new ApiProblem('LAST_ADMIN', 'Poslednému aktívnemu administrátorovi nemožno odobrať rolu.', 409);
            }
            $delete = $db->prepare('DELETE FROM account_roles WHERE person_id = ?');
            $delete->execute([$id]);
            $insert = $db->prepare('INSERT INTO account_roles (person_id, role) VALUES (?, ?)');
            foreach (array_unique($roles) as $role) {
                $insert->execute([$id, $role]);
            }
            $result = self::users($db, $id);
            $db->commit();
            return $result;
        } catch (Throwable $error) {
            $db->rollBack();
            throw $error;
        }
    }

    private static function upload(PDO $db, string $id): array
    {
        self::find($db, $id);
        $image = $_FILES['image'] ?? [];
        if (($image['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK ||
            !is_string($image['tmp_name'] ?? null) || !is_int($image['size'] ?? null) ||
            !is_uploaded_file($image['tmp_name']) || $image['size'] > 5 * 1024 * 1024
        ) {
            throw new ApiProblem('INVALID_IMAGE', 'Nahrajte obrázok do 5 MB.', 400);
        }
        $info = @getimagesize($image['tmp_name']);
        $mime = $info['mime'] ?? '';
        $extension = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'][$mime] ?? null;
        if ($extension === null) {
            throw new ApiProblem('INVALID_IMAGE', 'Nahrajte obrázok JPEG, PNG alebo WebP.', 400);
        }
        $directory = getenv('RESOURCE_IMAGE_DIRECTORY');
        if (!$directory || !is_dir($directory) || !is_writable($directory)) {
            throw new ApiProblem('UPLOAD_UNAVAILABLE', 'Úložisko obrázkov nie je dostupné.', 503);
        }
        $filename = bin2hex(random_bytes(16)) . '.' . $extension;
        $path = $directory . DIRECTORY_SEPARATOR . $filename;
        if (!move_uploaded_file($image['tmp_name'], $path)) {
            throw new ApiProblem('UPLOAD_UNAVAILABLE', 'Obrázok sa nepodarilo uložiť.', 503);
        }
        try {
            $write = $db->prepare('INSERT INTO resource_images (resource_id, filename, media_type) VALUES (?, ?, ?)');
            $write->execute([$id, $filename, $mime]);
        } catch (Throwable $error) {
            unlink($path);
            throw $error;
        }
        return ['id' => $db->lastInsertId(), 'url' => '/api/resource-images/' . $filename];
    }
}
