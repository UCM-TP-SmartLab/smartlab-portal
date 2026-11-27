<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\ApiProblem;
use App\Core\ProtectedApi;
use App\Core\Router;
use PDO;

final class NotificationController
{
    private const ROLES = ['student', 'manager', 'admin'];
    private const SELECT = 'SELECT CAST(id AS CHAR) AS id, message,
        DATE_FORMAT(created_at, "%Y-%m-%dT%H:%i:%sZ") AS createdAt,
        DATE_FORMAT(read_at, "%Y-%m-%dT%H:%i:%sZ") AS readAt FROM notifications WHERE owner_id = ?';

    public static function register(Router $router): void
    {
        $router->add('GET', '/api/me/notifications', static fn () => ProtectedApi::run(
            self::ROLES, false, static function (PDO $db, array $identity): array {
                $query = $db->prepare(self::SELECT . ' ORDER BY id DESC');
                $query->execute([$identity['id']]);
                return $query->fetchAll();
            }
        ));
        $router->add('PATCH', '/api/me/notifications/{id}', static fn (string $id) => ProtectedApi::run(
            self::ROLES, true, static function (PDO $db, array $identity) use ($id): array {
                $params = [$identity['id'], ProtectedApi::id($id)];
                $update = $db->prepare('UPDATE notifications SET read_at = COALESCE(read_at, UTC_TIMESTAMP())
                    WHERE owner_id = ? AND id = ?');
                $update->execute($params);
                $query = $db->prepare(self::SELECT . ' AND id = ?');
                $query->execute($params);
                return $query->fetch() ?: throw new ApiProblem('NOTIFICATION_NOT_FOUND', 'Notifikácia sa nenašla.', 404);
            }
        ));
    }
}
