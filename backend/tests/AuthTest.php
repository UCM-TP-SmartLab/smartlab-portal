<?php
declare(strict_types=1);

require_once __DIR__ . '/../app/Core/Session.php';

use App\Core\Session;

Session::start();
$before = session_id();
$token = Session::authenticate('42');
if ($before === session_id() || Session::personId() !== '42' || !Session::matchesToken($token)) {
    throw new RuntimeException('Prihlásenie neobnovilo reláciu.');
}
if (Session::matchesToken('') || Session::matchesToken('nesprávny')) {
    throw new RuntimeException('Relácia prijala neplatný CSRF token.');
}
Session::destroy();
if (session_status() !== PHP_SESSION_NONE || $_SESSION !== []) {
    throw new RuntimeException('Odhlásenie neukončilo reláciu.');
}
echo "Overenie PHP relácie prešlo.\n";
