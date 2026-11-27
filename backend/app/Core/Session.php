<?php
declare(strict_types=1);

namespace App\Core;

use RuntimeException;

final class Session
{
    public static function start(): void
    {
        if (session_status() === PHP_SESSION_ACTIVE) {
            return;
        }
        $secure = getenv('SESSION_SECURE') === '1' ||
            (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');
        session_set_cookie_params([
            'lifetime' => 0,
            'path' => '/',
            'secure' => $secure,
            'httponly' => true,
            'samesite' => 'Lax',
        ]);
        if (!session_start(['use_strict_mode' => 1, 'use_only_cookies' => 1])) {
            throw new RuntimeException('Reláciu sa nepodarilo spustiť.');
        }
    }

    public static function authenticate(string $personId): string
    {
        self::start();
        if (!session_regenerate_id(true)) {
            throw new RuntimeException('Reláciu sa nepodarilo obnoviť.');
        }
        $token = bin2hex(random_bytes(32));
        $_SESSION = ['person_id' => $personId, 'csrf_token' => $token];

        return $token;
    }

    public static function personId(): ?string
    {
        self::start();
        return $_SESSION['person_id'] ?? null;
    }

    public static function token(): ?string
    {
        self::start();
        return $_SESSION['csrf_token'] ?? null;
    }

    public static function matchesToken(string $token): bool
    {
        $expected = self::token();
        return $expected !== null && hash_equals($expected, $token);
    }

    public static function destroy(): void
    {
        self::start();
        $_SESSION = [];
        $params = session_get_cookie_params();
        setcookie(session_name(), '', [
            'expires' => time() - 3600,
            'path' => $params['path'],
            'domain' => $params['domain'],
            'secure' => $params['secure'],
            'httponly' => $params['httponly'],
            'samesite' => $params['samesite'],
        ]);
        session_destroy();
    }
}
