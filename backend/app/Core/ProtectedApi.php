<?php
declare(strict_types=1);

namespace App\Core;

use App\Controllers\AuthController;
use App\Repositories\AccountRepository;
use RuntimeException;

final class ProtectedApi
{
    public static function run(array $roles, bool $write, callable $operation, int $status = 200): void
    {
        header('Cache-Control: no-store');
        if ($write && !AuthController::acceptsOrigin()) {
            return;
        }

        try {
            $id = isset($_COOKIE[session_name()]) ? Session::personId() : null;
            if ($id === null) {
                throw new ApiProblem('UNAUTHENTICATED', 'Prihláste sa.', 401);
            }
            if ($write && !Session::matchesToken($_SERVER['HTTP_X_CSRF_TOKEN'] ?? '')) {
                throw new ApiProblem('INVALID_CSRF_TOKEN', 'Neplatný token relácie.', 403);
            }
            session_write_close();
            $db = Database::fromEnvironment();
            $identity = (new AccountRepository($db))->identity($id);
            if ($identity === null || !in_array($identity['role'], $roles, true)) {
                throw new ApiProblem('FORBIDDEN', 'Na operáciu nemáte oprávnenie.', 403);
            }
            Response::json(['data' => $operation($db, $identity)], $status);
        } catch (ApiProblem $error) {
            Response::error($error->errorCode, $error->getMessage(), $error->status);
        } catch (RuntimeException) {
            Response::error('SERVICE_UNAVAILABLE', 'Operácia je dočasne nedostupná.', 503);
        }
    }

    public static function body(): array
    {
        $type = strtolower(trim(explode(';', $_SERVER['CONTENT_TYPE'] ?? '')[0]));
        $raw = (string) file_get_contents('php://input', false, null, 0, 65537);
        $body = $type === 'application/json' && strlen($raw) <= 65536 ? json_decode($raw, true) : null;
        if (!is_array($body) || array_is_list($body)) {
            throw new ApiProblem('INVALID_BODY', 'Očakáva sa objekt JSON.', 400);
        }
        return $body;
    }

    public static function id(string $id): string
    {
        if (!preg_match('/^[1-9][0-9]{0,19}$/D', $id)) {
            throw new ApiProblem('INVALID_ID', 'Neplatný identifikátor.', 400);
        }
        return $id;
    }

    public static function text(mixed $value, int $max, bool $required = true): string
    {
        if (!is_string($value) || ($required && trim($value) === '') ||
            preg_match_all('/./us', $value) > $max
        ) {
            throw new ApiProblem('INVALID_TEXT', 'Skontrolujte povinné polia a dĺžku textu.', 400);
        }
        return trim($value);
    }
}
