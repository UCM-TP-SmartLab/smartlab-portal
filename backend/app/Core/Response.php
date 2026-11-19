<?php
declare(strict_types=1);

namespace App\Core;

/**
 * Trieda Response zabezpečuje jednotné JSON odpovede API.
 */
class Response
{
    /**
     * Odošle JSON odpoveď s požadovaným HTTP statusom.
     */
    public static function json(array $data, int $status = 200): void
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');

        echo json_encode(
            $data,
            JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR
        );
    }

    /**
     * Odošle chybovú JSON odpoveď.
     */
    public static function error(
        string $code,
        string $message,
        int $status
    ): void {
        self::json([
            'error' => [
                'code' => $code,
                'message' => $message
            ]
        ], $status);
    }
}