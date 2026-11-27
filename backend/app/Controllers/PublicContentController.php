<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\Database;
use App\Core\Response;
use App\Core\Router;
use PDO;
use RuntimeException;

final class PublicContentController
{
    private const KINDS = ['news', 'projects', 'events', 'partners', 'student-opportunities'];
    private const PAGE_SIZE = 50;

    public static function register(Router $router): void
    {
        foreach (self::KINDS as $kind) {
            $path = '/api/public/' . $kind;
            $router->add('GET', $path, static fn () => self::respond($kind));
            $router->add('GET', $path . '/{slug}', static fn (string $slug) => self::respond($kind, rawurldecode($slug)));
        }
    }

    private static function respond(string $kind, ?string $slug = null): void
    {
        $page = filter_var($_GET['page'] ?? '1', FILTER_VALIDATE_INT, [
            'options' => ['min_range' => 1, 'max_range' => 1000000],
        ]);
        if ($page === false) {
            Response::error('INVALID_PAGE', 'Neplatná strana zoznamu.', 400);
            return;
        }

        try {
            $db = Database::fromEnvironment();
            $select = 'SELECT id, slug, title, summary, body, metadata FROM public_content
                       WHERE kind = :kind AND published_at <= UTC_TIMESTAMP()';
            if ($slug !== null) {
                $query = $db->prepare($select . ' AND slug = :slug');
                $query->execute(['kind' => $kind, 'slug' => $slug]);
                $row = $query->fetch();
                if (!$row) {
                    Response::error('CONTENT_NOT_FOUND', 'Záznam sa nenašiel.', 404);
                    return;
                }
                Response::json(['data' => self::entry($row)]);
                return;
            }
            $query = $db->prepare($select . ' ORDER BY published_at DESC, id DESC LIMIT :size OFFSET :offset');
            $query->bindValue(':kind', $kind);
            $query->bindValue(':size', self::PAGE_SIZE + 1, PDO::PARAM_INT);
            $query->bindValue(':offset', ($page - 1) * self::PAGE_SIZE, PDO::PARAM_INT);
            $query->execute();
            $rows = $query->fetchAll();
            Response::json([
                'data' => array_map(self::entry(...), array_slice($rows, 0, self::PAGE_SIZE)),
                'nextPage' => count($rows) > self::PAGE_SIZE ? $page + 1 : null,
            ]);
        } catch (RuntimeException) {
            Response::error('CONTENT_UNAVAILABLE', 'Verejný obsah je dočasne nedostupný.', 503);
        }
    }

    private static function entry(array $row): array
    {
        $metadata = json_decode($row['metadata'] ?? 'null', true);
        $result = [
            'id' => (string) $row['id'],
            'slug' => $row['slug'],
            'title' => $row['title'],
            'summary' => $row['summary'],
            'body' => $row['body'],
        ];
        foreach (['category', 'date', 'end', 'author', 'url', 'form', 'audience', 'partner'] as $key) {
            if (is_string($metadata[$key] ?? null)) {
                $result[$key] = $metadata[$key];
            }
        }
        return $result;
    }
}
