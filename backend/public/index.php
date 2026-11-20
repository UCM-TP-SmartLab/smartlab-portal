<?php
declare(strict_types=1);

// Načítanie triedy Router.
require_once __DIR__ . '/../app/Core/Router.php';
require_once __DIR__ . '/../app/Core/Response.php';
require_once __DIR__ . '/../app/Controllers/SpaceController.php';

use App\Core\Router;
use App\Core\Response;
use App\Controllers\SpaceController;

// Povolená adresa frontendovej aplikácie.
$allowedOrigin = 'http://localhost:4200';

// Kontrola pôvodu HTTP požiadavky.
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if ($origin === $allowedOrigin) {
    header('Access-Control-Allow-Origin: ' . $allowedOrigin);
    header('Vary: Origin');
}

// Povolené HTTP metódy a hlavičky.
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');


// Spracovanie predbežnej CORS požiadavky.
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    if ($origin !== $allowedOrigin) {
        Response::error(
            'FORBIDDEN_ORIGIN',
            'Nepovolený pôvod požiadavky.',
            403
        );
        exit;
    }

    http_response_code(204);
    exit;
}


// Vytvorenie inštancie routera.
$router = new Router();

// Zoznam všetkých priestorov.
$router->add('GET', '/api/spaces', function(): void {
    $controller = new SpaceController();
    $controller->index();
});

// Detail konkrétneho priestoru.
$router->add('GET', '/api/spaces/{id}', function(string $id): void {
    $controller = new SpaceController();
    $controller->show($id);
});

// Spracovanie prichádzajúcej HTTP požiadavky.
$router->dispatch(
    $_SERVER['REQUEST_METHOD'],
    $_SERVER['REQUEST_URI']
);