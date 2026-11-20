<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\Response;

class SpaceController
{
    // Vráti zoznam priestorov.
    public function index(): void
    {
        Response::json([
            'data' => [
                'message' => 'Zoznam priestorov SmartLab'
            ]
        ]);
    }

    // Vráti detail priestoru podľa ID.
    public function show(string $id): void
    {
        // ID musí byť kladné celé číslo.
        if (!ctype_digit($id) || filter_var($id, FILTER_VALIDATE_INT, [
            'options' => [
                'min_range' => 1,
                'max_range' => PHP_INT_MAX
            ]
        ]) === false
        ) {
            Response::error(
                'INVALID_SPACE_ID',
                'ID priestoru musí byť kladné celé číslo.',
                400
            );
            return;
        }

        Response::json([
            'data' => [
                'id' => $id,
                'message' => 'Detail priestoru SmartLab'
            ]
        ]);
    }
}