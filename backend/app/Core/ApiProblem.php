<?php
declare(strict_types=1);

namespace App\Core;

use RuntimeException;

final class ApiProblem extends RuntimeException
{
    public function __construct(public readonly string $errorCode, string $message, public readonly int $status)
    {
        parent::__construct($message);
    }
}
