<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\Database;
use App\Core\Response;
use App\Core\Router;
use App\Core\Session;
use App\Repositories\AccountRepository;
use RuntimeException;

final class AuthController
{
    public static function register(Router $router): void
    {
        $router->add('POST', '/api/auth/login', self::login(...));
        $router->add('GET', '/api/auth/me', self::me(...));
        $router->add('POST', '/api/auth/logout', self::logout(...));
    }

    private static function login(): void
    {
        header('Cache-Control: no-store');
        if (!self::acceptsOrigin()) {
            return;
        }
        $type = strtolower(trim(explode(';', $_SERVER['CONTENT_TYPE'] ?? '')[0]));
        $body = $type === 'application/json'
            ? json_decode((string) file_get_contents('php://input', false, null, 0, 8192), true)
            : null;
        $email = $body['email'] ?? null;
        $password = $body['password'] ?? null;
        if (!is_string($email) || strlen($email) > 254 || !filter_var($email, FILTER_VALIDATE_EMAIL) ||
            !is_string($password) || $password === '' || strlen($password) > 72 || str_contains($password, "\0")
        ) {
            Response::error('INVALID_CREDENTIALS', 'Zadajte platný e-mail a heslo.', 400);
            return;
        }

        try {
            $accounts = new AccountRepository(Database::fromEnvironment());
            $identity = $accounts->authenticate($email, $password, $_SERVER['REMOTE_ADDR'] ?? '');
            if ($identity === null) {
                Response::error('LOGIN_FAILED', 'Prihlásenie sa nepodarilo. Skontrolujte údaje alebo skúste neskôr.', 401);
                return;
            }
            self::respond($identity, Session::authenticate($identity['id']));
        } catch (RuntimeException) {
            self::unavailable();
        }
    }

    private static function me(): void
    {
        header('Cache-Control: no-store');
        try {
            $id = isset($_COOKIE[session_name()]) ? Session::personId() : null;
            $identity = $id === null ? null : (new AccountRepository(Database::fromEnvironment()))->identity($id);
            self::respond($identity, $identity === null ? null : Session::token());
        } catch (RuntimeException) {
            self::unavailable();
        }
    }

    private static function logout(): void
    {
        header('Cache-Control: no-store');
        if (!self::acceptsOrigin()) {
            return;
        }
        try {
            if (!Session::matchesToken($_SERVER['HTTP_X_CSRF_TOKEN'] ?? '')) {
                Response::error('INVALID_CSRF_TOKEN', 'Neplatný token relácie.', 403);
                return;
            }
            Session::destroy();
            self::respond(null, null);
        } catch (RuntimeException) {
            self::unavailable();
        }
    }

    public static function acceptsOrigin(): bool
    {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? null;
        $host = $_SERVER['HTTP_HOST'] ?? '';
        // Pri vývoji posiela Angular proxy pôvod localhost:4200 na PHP port.
        $allowed = getenv('APP_ORIGIN') ?: 'http://localhost:4200';
        $scheme = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' ? 'https' : 'http';
        if ($origin !== null && $origin !== $allowed && $origin !== "$scheme://$host") {
            Response::error('FORBIDDEN_ORIGIN', 'Nepovolený pôvod požiadavky.', 403);
            return false;
        }
        return true;
    }

    private static function respond(?array $identity, ?string $token): void
    {
        Response::json(['data' => ['session' => $identity, 'csrfToken' => $token]]);
    }

    private static function unavailable(): void
    {
        Response::error('AUTH_UNAVAILABLE', 'Prihlásenie je dočasne nedostupné.', 503);
    }
}
