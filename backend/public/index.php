<?php
declare(strict_types=1);

// Načítanie potrebných tried.
require_once __DIR__ . '/../app/Core/Router.php';
require_once __DIR__ . '/../app/Core/Response.php';
require_once __DIR__ . '/../app/Core/Session.php';
require_once __DIR__ . '/../app/Core/Auth.php';
require_once __DIR__ . '/../app/Controllers/AuthController.php';

use App\Core\Router;
use App\Core\Response;
use App\Controllers\AuthController;

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
    Response::json([
        'data' => [
            'message' => 'Zoznam priestorov SmartLab'
        ]
    ]);
});

$router->add('GET', '/api/spaces/{id}', function(string $id): void {
    Response::json([
        'data' => [
            'id' => $id,
            'message' => 'Detail priestoru SmartLab'
        ]
    ]);
});

// Informácia o aktuálne prihlásenej osobe.
$router->add('GET', '/api/auth/me', function(): void {
    $controller = new AuthController();
    $controller->me();
});

// Odhlásenie aktuálne prihláseného používateľa.
$router->add('POST', '/api/auth/logout', function(): void {
    $controller = new AuthController();
    $controller->logout();
});

// Spracovanie prichádzajúcej HTTP požiadavky.
$router->dispatch(
    $_SERVER['REQUEST_METHOD'],
    $_SERVER['REQUEST_URI']
);