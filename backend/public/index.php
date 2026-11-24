<?php
declare(strict_types=1);

// Načítanie triedy Router.
require_once __DIR__ . '/../app/Core/Router.php';
require_once __DIR__ . '/../app/Core/Response.php';

use App\Core\Router;
use App\Core\Response;

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

// Registrácia testovacej API trasy.

$router->add('GET', '/api/spaces', function(): void {
    // TODO: Nahradiť testovaciu správu reálnym zoznamom priestorov z databázy a dohodnúť dátový kontrakt.
    Response::json([
        'data' => [
            'message' => 'Zoznam priestorov SmartLab'
        ]
    ]);
});

$router->add('GET', '/api/spaces/{id}', function(string $id): void {
    // TODO: Validovať ID a vrátiť reálny priestor alebo 404; samotné ID s message nie je detail.
    Response::json([
        'data' => [
            'id' => $id,
            'message' => 'Detail priestoru SmartLab'
        ]
    ]);
});

// Kostry chýbajúcich operácií s explicitným HTTP 501.
$registerTodoRoutes = require __DIR__ . '/../app/routes-todo.php';
$registerTodoRoutes($router);

// Spracovanie prichádzajúcej HTTP požiadavky.
$router->dispatch(
    $_SERVER['REQUEST_METHOD'],
    $_SERVER['REQUEST_URI']
);
