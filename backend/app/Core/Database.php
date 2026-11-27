<?php

declare(strict_types=1);

namespace App\Core;

use PDO;
use PDOException;
use RuntimeException;

final class Database
{
    public static function fromEnvironment(): PDO
    {
        $host = getenv('DB_HOST');
        $name = getenv('DB_NAME');
        $user = getenv('DB_USER');
        $password = getenv('DB_PASSWORD');
        $port = filter_var(getenv('DB_PORT') ?: '3306', FILTER_VALIDATE_INT, [
            'options' => ['min_range' => 1, 'max_range' => 65535],
        ]);

        if (
            !$host || !$name || !$user || $password === false || $port === false ||
            str_contains($host, ';') || str_contains($name, ';')
        ) {
            throw new RuntimeException('Neplatná konfigurácia databázy.');
        }

        return self::connect($host, $name, $user, $password, $port);
    }

    public static function connect(
        string $host,
        string $dbname,
        string $username,
        string $password,
        int $port = 3306
    ): PDO {
        if (!in_array('mysql', PDO::getAvailableDrivers(), true)) {
            throw new RuntimeException('Chýba ovládač PDO pre MySQL.');
        }

        $dsn = "mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4";

        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ];

        try {
            $db = new PDO(
                $dsn,
                $username,
                $password,
                $options
            );
            $db->exec("SET time_zone = '+00:00'");
            return $db;
        } catch (PDOException $e) {
            throw new RuntimeException(
                "Nepodarilo sa pripojiť k databáze.",
                0,
                $e
            );
        }
    }
}
