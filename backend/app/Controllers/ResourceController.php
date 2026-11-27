<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\Database;
use App\Core\Response;
use App\Core\Router;
use App\Repositories\ResourceRepository;
use RuntimeException;
use DateTimeImmutable;
use DateTimeZone;

final class ResourceController
{
    public static function register(Router $router): void
    {
        foreach (['/api/spaces' => 'room', '/api/equipment' => 'equipment'] as $path => $kind) {
            $router->add('GET', $path, static fn () => self::catalog($kind));
            $router->add('GET', $path . '/{id}', static fn (string $id) => self::catalog($kind, $id));
            $router->add('GET', $path . '/{id}/availability', static fn (string $id) => self::availability($kind, $id));
        }
        $router->add('GET', '/api/spaces/{id}/calendar.ics', static fn (string $id) => self::availability('room', $id, true));
        $router->add('GET', '/api/resource-images/{filename}', self::image(...));
    }

    private static function image(string $filename): void
    {
        $directory = getenv('RESOURCE_IMAGE_DIRECTORY');
        if ($directory && preg_match('/^[a-f0-9]{32}\.(jpg|png|webp)$/D', $filename)) {
            try {
                $query = Database::fromEnvironment()->prepare('SELECT i.media_type FROM resource_images i
                    JOIN resources r ON r.id = i.resource_id WHERE i.filename = ? AND r.archived_at IS NULL');
                $query->execute([$filename]);
                $type = $query->fetchColumn();
                $path = $directory . DIRECTORY_SEPARATOR . $filename;
                if (in_array($type, ['image/jpeg', 'image/png', 'image/webp'], true) && is_readable($path)) {
                    header('Content-Type: ' . $type);
                    header('X-Content-Type-Options: nosniff');
                    readfile($path);
                    return;
                }
            } catch (RuntimeException) {
                Response::error('CATALOG_UNAVAILABLE', 'Obrázok je dočasne nedostupný.', 503);
                return;
            }
        }
        Response::error('IMAGE_NOT_FOUND', 'Obrázok sa nenašiel.', 404);
    }

    private static function availability(string $kind, string $id, bool $calendar = false): void
    {
        if (!preg_match('/^[1-9][0-9]{0,19}$/D', $id)) {
            Response::error('INVALID_RESOURCE_ID', 'Neplatný identifikátor zdroja.', 400);
            return;
        }

        $utc = new DateTimeZone('UTC');
        if ($calendar) {
            $from = new DateTimeImmutable('today', $utc);
            $to = $from->modify('+1 year');
        } else {
            $date = $_GET['date'] ?? null;
            $local = new DateTimeZone('Europe/Bratislava');
            $day = is_string($date) && preg_match('/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/D', $date)
                ? DateTimeImmutable::createFromFormat('!Y-m-d', $date, $local)
                : false;
            if (!$day || $day->format('Y-m-d') !== $date) {
                Response::error('INVALID_DATE', 'Zadajte platný dátum.', 400);
                return;
            }
            $from = $day->setTimezone($utc);
            $to = $day->modify('+1 day')->setTimezone($utc);
        }

        try {
            $resources = new ResourceRepository(Database::fromEnvironment());
            if ($resources->find($kind, $id) === null) {
                Response::error('RESOURCE_NOT_FOUND', 'Zdroj sa nenašiel.', 404);
                return;
            }
            $rows = $resources->occupied($id, $from->format('Y-m-d H:i:s'), $to->format('Y-m-d H:i:s'));
        } catch (RuntimeException) {
            Response::error('CATALOG_UNAVAILABLE', 'Katalóg je dočasne nedostupný.', 503);
            return;
        }

        if ($calendar) {
            self::calendar($id, $rows, $utc);
            return;
        }
        Response::json(['data' => array_map(static fn (array $row): array => [
            'start' => (new DateTimeImmutable($row['starts_at'], $utc))->format(DATE_ATOM),
            'end' => (new DateTimeImmutable($row['ends_at'], $utc))->format(DATE_ATOM),
            'status' => $row['status'],
        ], $rows)]);
    }

    private static function calendar(string $resourceId, array $rows, DateTimeZone $utc): void
    {
        $format = 'Ymd\\THis\\Z';
        $stamp = (new DateTimeImmutable('now', $utc))->format($format);
        $lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//SmartLab//Obsadenost//SK'];
        foreach ($rows as $row) {
            array_push($lines, 'BEGIN:VEVENT', "UID:{$row['id']}-{$resourceId}@smartlab",
                "DTSTAMP:$stamp",
                'DTSTART:' . (new DateTimeImmutable($row['starts_at'], $utc))->format($format),
                'DTEND:' . (new DateTimeImmutable($row['ends_at'], $utc))->format($format),
                'SUMMARY:Obsadene', 'END:VEVENT');
        }
        $lines[] = 'END:VCALENDAR';
        header('Content-Type: text/calendar; charset=utf-8');
        echo implode("\r\n", $lines) . "\r\n";
    }

    private static function catalog(string $kind, ?string $id = null): void
    {
        if ($id !== null && !preg_match('/^[1-9][0-9]{0,19}$/D', $id)) {
            Response::error('INVALID_RESOURCE_ID', 'Neplatný identifikátor zdroja.', 400);
            return;
        }

        try {
            $resources = new ResourceRepository(Database::fromEnvironment());
            $data = $id === null ? $resources->list($kind) : $resources->find($kind, $id);
        } catch (RuntimeException) {
            Response::error('CATALOG_UNAVAILABLE', 'Katalóg je dočasne nedostupný.', 503);
            return;
        }

        if ($data === null) {
            Response::error('RESOURCE_NOT_FOUND', 'Zdroj sa nenašiel.', 404);
            return;
        }

        Response::json(['data' => $data]);
    }
}
