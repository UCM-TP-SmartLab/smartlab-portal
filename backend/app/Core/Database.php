<?php

declare(strict_types=1);

namespace App\Core;

use PDO;
use PDOException;
use RuntimeException;

final class Database
{
    public static function connect(
        string $host,
        string $dbname,
        string $username,
        string $password
    ): PDO {
        $dsn = "mysql:host=$host;dbname=$dbname;charset=utf8mb4";

        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ];

        try {
            return new PDO(
                $dsn,
                $username,
                $password,
                $options
            );
        } catch (PDOException $e) {
            throw new RuntimeException(
                "Nepodarilo sa pripojiť k databáze.",
                0,
                $e
            );
        }
    }
}