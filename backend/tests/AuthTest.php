<?php
declare(strict_types=1);

// Načítanie testovaných tried.
require_once __DIR__ . '/../app/Core/Session.php';
require_once __DIR__ . '/../app/Core/Auth.php';

use App\Core\Session;
use App\Core\Auth;

// Spustíme session.
Session::start();

// Stav pred prihlásením.
$beforeCheck = Auth::check();
$beforeId = Auth::id();

// Simulujeme úspešné prihlásenie.
Auth::login(12);

// Stav po prihlásení.
$afterCheck = Auth::check();
$afterId = Auth::id();

// Simulujeme odhlásenie používateľa.
Auth::logout();

// Stav po odhlásení.
$logoutCheck = Auth::check();
$logoutId = Auth::id();

// Výsledky vypíšeme až po práci so session.
echo "Pred prihlásením:" . PHP_EOL;
var_export($beforeCheck);
echo " | ID: ";
var_export($beforeId);

echo PHP_EOL . PHP_EOL;

echo "Po prihlásení:" . PHP_EOL;
var_export($afterCheck);
echo " | ID: ";
var_export($afterId);

echo PHP_EOL;


echo PHP_EOL;
echo "Po odhlásení:" . PHP_EOL;

var_export($logoutCheck);
echo " | ID: ";
var_export($logoutId);

echo PHP_EOL;

