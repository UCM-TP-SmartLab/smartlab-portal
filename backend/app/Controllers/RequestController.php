<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\ApiProblem;
use App\Core\ProtectedApi;
use App\Core\Router;
use App\Services\RequestService;
use PDO;

final class RequestController
{
    private const STUDENT = ['student'];
    private const MANAGEMENT = ['manager', 'admin'];

    public static function register(Router $router): void
    {
        foreach (['reservations' => true, 'access-requests' => false] as $path => $reservation) {
            $router->add('GET', "/api/me/$path", static fn () => ProtectedApi::run(
                self::STUDENT, false, static fn (PDO $db, array $identity) =>
                    (new RequestService($db, $reservation))->list($identity['id'])
            ));
            $router->add('GET', "/api/management/$path", static fn () => ProtectedApi::run(
                self::MANAGEMENT, false, static fn (PDO $db) => (new RequestService($db, $reservation))->list(null)
            ));
            $router->add('GET', "/api/$path/{id}", static fn (string $id) => ProtectedApi::run(
                [...self::STUDENT, ...self::MANAGEMENT], false, static fn (PDO $db, array $identity) =>
                    (new RequestService($db, $reservation))->detail(
                        $id, $identity['role'] === 'student' ? $identity['id'] : null
                    )
            ));
            $router->add('POST', "/api/$path", static fn () => ProtectedApi::run(
                self::STUDENT, true, static fn (PDO $db, array $identity) =>
                    (new RequestService($db, $reservation))->create(ProtectedApi::body(), $identity['id']), 201
            ));
            $router->add('POST', "/api/management/$path/{id}/decision", static fn (string $id) => ProtectedApi::run(
                self::MANAGEMENT, true, static fn (PDO $db, array $identity) => self::decide($db, $reservation, $id, $identity['id'])
            ));
        }
        $router->add('POST', '/api/reservations/{id}/cancel', static fn (string $id) => ProtectedApi::run(
            self::STUDENT, true, static fn (PDO $db, array $identity) =>
                (new RequestService($db, true))->transition($id, $identity['id'], 'cancelled', null, true)
        ));
    }

    private static function decide(PDO $db, bool $reservation, string $id, string $actor): array
    {
        $body = ProtectedApi::body();
        $status = $body['status'] ?? null;
        if (!in_array($status, ['approved', 'rejected'], true)) {
            throw new ApiProblem('INVALID_DECISION', 'Vyberte schválenie alebo zamietnutie.', 400);
        }
        $reason = ProtectedApi::text($body['reason'] ?? '', 1000, $status === 'rejected');
        return (new RequestService($db, $reservation))->transition(
            $id, $actor, $status, $reason === '' ? null : $reason, false
        );
    }
}
