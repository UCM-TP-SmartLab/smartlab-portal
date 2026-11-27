<?php
declare(strict_types=1);

// Načítanie triedy Router.
require_once __DIR__ . '/../app/Core/Router.php';
require_once __DIR__ . '/../app/Core/Response.php';
require_once __DIR__ . '/../app/Core/Database.php';
require_once __DIR__ . '/../app/Repositories/ResourceRepository.php';
require_once __DIR__ . '/../app/Controllers/ResourceController.php';
require_once __DIR__ . '/../app/Core/Session.php';
require_once __DIR__ . '/../app/Repositories/AccountRepository.php';
require_once __DIR__ . '/../app/Controllers/AuthController.php';
require_once __DIR__ . '/../app/Controllers/PublicContentController.php';
require_once __DIR__ . '/../app/Core/ApiProblem.php';
require_once __DIR__ . '/../app/Core/ProtectedApi.php';
require_once __DIR__ . '/../app/Services/RequestService.php';
require_once __DIR__ . '/../app/Controllers/RequestController.php';
require_once __DIR__ . '/../app/Controllers/AdminController.php';
require_once __DIR__ . '/../app/Controllers/NotificationController.php';

use App\Controllers\AuthController;
use App\Controllers\PublicContentController;
use App\Controllers\RequestController;
use App\Controllers\AdminController;
use App\Controllers\NotificationController;
use App\Controllers\ResourceController;
use App\Core\Router;
use App\Core\Response;

// Povolená adresa frontendovej aplikácie.
$allowedOrigin = getenv('APP_ORIGIN') ?: 'http://localhost:4200';

// Kontrola pôvodu HTTP požiadavky.
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if ($origin === $allowedOrigin) {
    header('Access-Control-Allow-Origin: ' . $allowedOrigin);
    header('Vary: Origin');
}

// Povolené HTTP metódy a hlavičky.
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-CSRF-Token');
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

ResourceController::register($router);
AuthController::register($router);
PublicContentController::register($router);
RequestController::register($router);
AdminController::register($router);
NotificationController::register($router);

// Spracovanie prichádzajúcej HTTP požiadavky.
$router->dispatch(
    $_SERVER['REQUEST_METHOD'],
    $_SERVER['REQUEST_URI']
);
