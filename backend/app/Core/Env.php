<?php

declare(strict_types=1);

namespace App\Core;

use RuntimeException;

final class Env
{
    public static function load(string $path): void
    {
        if (!is_readable($path)) {
            throw new RuntimeException(
                "Konfiguračný súbor .env sa nepodarilo načítať."
            );
        }

        $values = parse_ini_file(
            $path,
            false,
            INI_SCANNER_RAW
        );

        if ($values === false) {
            throw new RuntimeException(
                "Neplatný konfiguračný súbor .env."
            );
        }

        foreach ($values as $key => $value) {
            if (!is_string($value)) {
                continue;
            }

            $_ENV[$key] = $value;
        }
    }
}
