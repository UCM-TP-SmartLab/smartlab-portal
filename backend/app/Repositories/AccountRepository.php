<?php
declare(strict_types=1);

namespace App\Repositories;

use PDO;
use Throwable;

final class AccountRepository
{
    public function __construct(private readonly PDO $db)
    {
    }

    public function authenticate(string $email, string $password, string $ip): ?array
    {
        $key = hash('sha256', $ip . "\0" . strtolower($email));
        $this->db->beginTransaction();
        try {
            $attempt = $this->db->prepare(
                'INSERT INTO login_attempts (attempt_key, failures, window_start)
                 VALUES (UNHEX(?), 1, UTC_TIMESTAMP())
                 ON DUPLICATE KEY UPDATE
                    failures = IF(window_start <= UTC_TIMESTAMP() - INTERVAL 15 MINUTE, 1, LEAST(failures + 1, 6)),
                    window_start = IF(window_start <= UTC_TIMESTAMP() - INTERVAL 15 MINUTE, UTC_TIMESTAMP(), window_start)'
            );
            $attempt->execute([$key]);
            $count = $this->db->prepare('SELECT failures FROM login_attempts WHERE attempt_key = UNHEX(?)');
            $count->execute([$key]);
            if ((int) $count->fetchColumn() > 5) {
                $this->db->commit();
                return null;
            }

            $query = $this->db->prepare(
                'SELECT a.person_id, a.password_hash, a.active
                 FROM people p JOIN accounts a ON a.person_id = p.id WHERE p.email = ?'
            );
            $query->execute([$email]);
            $account = $query->fetch();
            $hash = $account['password_hash'] ?? '$2y$12$8HIDsVKJq7B8Z6QiFh8Do.7AukYrC4zMNuVtZiJuHQVBs.i7giLA6';
            $verified = password_verify($password, $hash);
            $identity = $verified && $account && $account['active']
                ? $this->identity((string) $account['person_id'])
                : null;
            if ($identity !== null) {
                $clear = $this->db->prepare('DELETE FROM login_attempts WHERE attempt_key = UNHEX(?)');
                $clear->execute([$key]);
            }
            $this->db->commit();
            return $identity;
        } catch (Throwable $error) {
            $this->db->rollBack();
            throw $error;
        }
    }

    public function identity(string $id): ?array
    {
        $query = $this->db->prepare(
            "SELECT p.id, CONCAT_WS(' ', p.first_name, p.last_name) AS name, r.role
             FROM people p JOIN accounts a ON a.person_id = p.id
             JOIN account_roles r ON r.person_id = p.id
             WHERE p.id = ? AND a.active = 1
             ORDER BY FIELD(r.role, 'admin', 'manager', 'student') LIMIT 1"
        );
        $query->execute([$id]);
        $identity = $query->fetch();
        if ($identity === false) {
            return null;
        }
        $identity['id'] = (string) $identity['id'];
        return $identity;
    }
}
