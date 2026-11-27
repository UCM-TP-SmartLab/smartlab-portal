<?php
declare(strict_types=1);

namespace App\Services;

use App\Core\ApiProblem;
use App\Core\ProtectedApi;
use DateTimeImmutable;
use DateTimeZone;
use PDO;
use Throwable;

final class RequestService
{
    public function __construct(private readonly PDO $db, private readonly bool $reservation)
    {
    }

    public function list(?string $owner): array
    {
        $table = $this->table();
        $sql = "SELECT * FROM $table";
        if ($owner !== null) {
            $sql .= ' WHERE owner_id = ?';
        }
        $query = $this->db->prepare($sql . ' ORDER BY created_at DESC, id DESC');
        $query->execute($owner === null ? [] : [$owner]);
        return array_map($this->serialize(...), $query->fetchAll());
    }

    public function detail(string $id, ?string $owner): array
    {
        return $this->serialize($this->read($id, $owner));
    }

    public function create(array $data, string $owner): array
    {
        $purpose = ProtectedApi::text($data['purpose'] ?? null, 1000);
        $this->db->beginTransaction();
        try {
            $id = $this->reservation
                ? $this->insertReservation($data, $owner, $purpose)
                : $this->insertAccess($owner, $purpose);
            $this->history($id, $owner, 'pending', null);
            $item = $this->detail($id, $owner);
            $this->db->commit();
            return $item;
        } catch (Throwable $error) {
            $this->db->rollBack();
            throw $error;
        }
    }

    public function transition(string $id, string $actor, string $status, ?string $reason, bool $ownerOnly): array
    {
        $this->db->beginTransaction();
        try {
            $record = $this->read($id, $ownerOnly ? $actor : null, true);
            $allowed = $ownerOnly ? ['pending', 'approved'] : ['pending'];
            if (!in_array($record['status'], $allowed, true)) {
                throw new ApiProblem('STATUS_CONFLICT', 'Stav záznamu sa už zmenil.', 409);
            }
            $table = $this->table();
            $update = $this->db->prepare("UPDATE $table SET status = ? WHERE id = ?");
            $update->execute([$status, $id]);
            $this->history($id, $actor, $status, $reason);
            if (!$ownerOnly) {
                $this->notify($record['owner_id'], $id, $status);
            }
            $item = $this->detail($id, null);
            $this->db->commit();
            return $item;
        } catch (Throwable $error) {
            $this->db->rollBack();
            throw $error;
        }
    }

    private function insertAccess(string $owner, string $purpose): string
    {
        $insert = $this->db->prepare('INSERT INTO access_requests (owner_id, purpose) VALUES (?, ?)');
        $insert->execute([$owner, $purpose]);
        return $this->db->lastInsertId();
    }

    private function insertReservation(array $data, string $owner, string $purpose): string
    {
        $resource = ProtectedApi::text($data['resourceId'] ?? null, 30);
        $equipment = str_starts_with($resource, 'equipment-');
        $id = ProtectedApi::id($equipment ? substr($resource, strlen('equipment-')) : $resource);
        $kind = $equipment ? 'equipment' : 'room';
        $from = self::instant($data['startUtc'] ?? null);
        $to = self::instant($data['endUtc'] ?? null);
        $quantity = $data['quantity'] ?? null;
        $local = new DateTimeZone('Europe/Bratislava');
        $start = $from->setTimezone($local);
        $end = $to->setTimezone($local);
        if ($from >= $to || $from <= new DateTimeImmutable() || $start->format('Y-m-d') !== $end->format('Y-m-d') ||
            $start->format('H:i:s') >= $end->format('H:i:s') ||
            !is_int($quantity) || $quantity < 1 || self::ambiguous($start) || self::ambiguous($end)
        ) {
            throw new ApiProblem('INVALID_RESERVATION', 'Skontrolujte dátum, čas a počet kusov.', 400);
        }
        $query = $this->db->prepare('SELECT kind, quantity, opening_hours
            FROM resources WHERE id = ? AND kind = ? AND archived_at IS NULL FOR UPDATE');
        $query->execute([$id, $kind]);
        $row = $query->fetch();
        if (!$row) {
            throw new ApiProblem('RESOURCE_NOT_FOUND', 'Zdroj sa nenašiel.', 404);
        }
        $capacity = $equipment ? (int) $row['quantity'] : 1;
        if ($quantity > $capacity || !self::withinHours($row['opening_hours'], $start, $end)) {
            throw new ApiProblem('INVALID_RESERVATION', 'Skontrolujte otváracie hodiny a počet kusov.', 400);
        }
        $begin = $from->format('Y-m-d H:i:s');
        $finish = $to->format('Y-m-d H:i:s');
        $this->assertCapacity($id, $begin, $finish, $capacity - $quantity);
        $insert = $this->db->prepare('INSERT INTO reservations
            (resource_id, owner_id, starts_at, ends_at, quantity, purpose) VALUES (?, ?, ?, ?, ?, ?)');
        $insert->execute([$id, $owner, $begin, $finish, $quantity, $purpose]);
        return $this->db->lastInsertId();
    }

    private function assertCapacity(string $id, string $from, string $to, int $remaining): void
    {
        $query = $this->db->prepare("SELECT starts_at, ends_at, quantity FROM reservations
             WHERE resource_id = ? AND starts_at < ? AND ends_at > ? AND status IN ('pending', 'approved')");
        $query->execute([$id, $to, $from]);
        $changes = [];
        foreach ($query as $row) {
            $start = max($from, $row['starts_at']);
            $end = min($to, $row['ends_at']);
            $changes[$start] = ($changes[$start] ?? 0) + (int) $row['quantity'];
            $changes[$end] = ($changes[$end] ?? 0) - (int) $row['quantity'];
        }
        ksort($changes);
        $used = 0;
        foreach ($changes as $change) {
            $used += $change;
            if ($used > $remaining) {
                throw new ApiProblem('RESERVATION_CONFLICT', 'Vybraný termín je obsadený.', 409);
            }
        }
    }

    private static function instant(mixed $value): DateTimeImmutable
    {
        $date = is_string($value) && preg_match('/^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.000Z$/D', $value)
            ? DateTimeImmutable::createFromFormat('!Y-m-d\\TH:i:s.000\\Z', $value, new DateTimeZone('UTC'))
            : false;
        if (!$date || $date->format('Y-m-d\\TH:i:s.000\\Z') !== $value) {
            throw new ApiProblem('INVALID_TIME', 'Očakáva sa platný čas UTC.', 400);
        }
        return $date;
    }

    private static function withinHours(?string $hours, DateTimeImmutable $start, DateTimeImmutable $end): bool
    {
        if ($hours === null) {
            return true;
        }
        $periods = json_decode($hours, true)[$start->format('N')] ?? [];
        foreach ($periods as $period) {
            if ($start->format('H:i:s') >= $period['start'] . ':00' && $end->format('H:i:s') <= $period['end'] . ':00') {
                return true;
            }
        }
        return false;
    }

    private static function ambiguous(DateTimeImmutable $local): bool
    {
        $stamp = $local->getTimestamp();
        $zone = $local->getTimezone();
        foreach ($zone->getTransitions($stamp - 86400, $stamp + 86400) as $transition) {
            $difference = $local->getOffset() - $transition['offset'];
            if ($difference !== 0 &&
                $local->setTimestamp($stamp + $difference)->format('Y-m-d H:i:s') === $local->format('Y-m-d H:i:s')
            ) {
                return true;
            }
        }
        return false;
    }

    private function read(string $id, ?string $owner, bool $lock = false): array
    {
        $table = $this->table();
        $sql = "SELECT * FROM $table WHERE id = ?";
        $params = [ProtectedApi::id($id)];
        if ($owner !== null) {
            $sql .= ' AND owner_id = ?';
            $params[] = $owner;
        }
        $query = $this->db->prepare($sql . ($lock ? ' FOR UPDATE' : ''));
        $query->execute($params);
        $row = $query->fetch();
        if (!$row) {
            throw new ApiProblem('REQUEST_NOT_FOUND', 'Záznam sa nenašiel.', 404);
        }
        return $row;
    }

    private function history(string $id, string $actor, string $status, ?string $reason): void
    {
        [$table, $key] = $this->historyTable();
        $query = $this->db->prepare("INSERT INTO $table ($key, actor_id, status, reason) VALUES (?, ?, ?, ?)");
        $query->execute([$id, $actor, $status, $reason]);
    }

    private function notify(string|int $owner, string $id, string $status): void
    {
        $column = $this->reservation ? 'reservation_id' : 'access_request_id';
        $message = $status === 'approved' ? 'Vaša žiadosť bola schválená.' : 'Vaša žiadosť bola zamietnutá.';
        $query = $this->db->prepare("INSERT INTO notifications (owner_id, $column, message) VALUES (?, ?, ?)");
        $query->execute([$owner, $id, $message]);
    }

    private function serialize(array $row): array
    {
        [$table, $key] = $this->historyTable();
        $history = $this->db->prepare("SELECT status, reason, occurred_at FROM $table WHERE $key = ? ORDER BY id");
        $history->execute([$row['id']]);
        $utc = new DateTimeZone('UTC');
        $item = [
            'id' => (string) $row['id'],
            'ownerId' => (string) $row['owner_id'],
            'purpose' => $row['purpose'],
            'status' => $row['status'],
            'history' => array_map(static fn (array $event): array => array_filter([
                'status' => $event['status'],
                'at' => (new DateTimeImmutable($event['occurred_at'], $utc))->format(DATE_ATOM),
                'reason' => $event['reason'],
            ], static fn ($value) => $value !== null), $history->fetchAll()),
        ];
        $last = end($item['history']);
        if (isset($last['reason'])) {
            $item['reason'] = $last['reason'];
        }
        if (!$this->reservation) {
            return $item;
        }
        $query = $this->db->prepare('SELECT kind FROM resources WHERE id = ?');
        $query->execute([$row['resource_id']]);
        $kind = $query->fetchColumn();
        $from = new DateTimeImmutable($row['starts_at'], $utc);
        $to = new DateTimeImmutable($row['ends_at'], $utc);
        $local = new DateTimeZone('Europe/Bratislava');
        return $item + [
            'resourceId' => ($kind === 'equipment' ? 'equipment-' : '') . $row['resource_id'],
            'startUtc' => $from->format(DATE_ATOM),
            'endUtc' => $to->format(DATE_ATOM),
            'date' => $from->setTimezone($local)->format('Y-m-d'),
            'start' => $from->setTimezone($local)->format('H:i'),
            'end' => $to->setTimezone($local)->format('H:i'),
            'quantity' => (int) $row['quantity'],
        ];
    }

    private function table(): string
    {
        return $this->reservation ? 'reservations' : 'access_requests';
    }

    private function historyTable(): array
    {
        return $this->reservation
            ? ['reservation_history', 'reservation_id']
            : ['access_request_history', 'access_request_id'];
    }
}
