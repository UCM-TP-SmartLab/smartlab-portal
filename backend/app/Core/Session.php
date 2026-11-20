<?php
declare(strict_types=1);

namespace App\Core;

/**
 * Správa používateľských PHP sessions.
 */
class Session
{
    /**
     * Spustí session, ak ešte nie je aktívna.
     */
    public static function start(): void
    {
        if (session_status() === PHP_SESSION_NONE) {
            // Zistíme, či komunikácia prebieha cez HTTPS.
            $isHttps = !empty($_SERVER['HTTPS'])
                && $_SERVER['HTTPS'] !== 'off';

            // Nastavenie bezpečnostných parametrov session cookie.
            session_set_cookie_params([
                'lifetime' => 0,
                'path' => '/',
                'secure' => $isHttps,
                'httponly' => true,
                'samesite' => 'Lax'
            ]);

            // Session musí používať ID vytvorené serverom.
            ini_set('session.use_strict_mode', '1');
            ini_set('session.use_only_cookies', '1');

            session_start();
        }
    }

    /**
     * Uloží hodnotu do session.
     */
    public static function set(string $key, mixed $value): void
    {
        self::start();
        $_SESSION[$key] = $value;
    }

    /**
     * Získa hodnotu zo session.
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        self::start();
        return $_SESSION[$key] ?? $default;
    }

    /**
     * Odstráni hodnotu zo session.
     */
    public static function remove(string $key): void
    {
        self::start();
        unset($_SESSION[$key]);
    }

    /**
     * Vygeneruje nové session ID po úspešnom prihlásení.
     */
    public static function regenerate(): void
    {
        self::start();

        // Vytvoríme nové session ID a odstránime pôvodné.
        session_regenerate_id(true);
    }

    /**
     * Ukončí session a odstráni jej cookie.
     */
    public static function destroy(): void
    {
        self::start();

        // vymažeme všetky údaje zo session.
        $_SESSION = [];

        // Odstránime session cookie z prehliadača.
        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();

            setcookie(session_name(), '', [
                'expires' => time() -3600,
                'path' => $params['path'],
                'domain' => $params['domain'],
                'secure' => $params['secure'],
                'httponly' => $params['httponly'],
                'samesite' => $params['samesite']
            ]);
        }

        // Zrušíme session na serveri.
        session_destroy();
    }
}