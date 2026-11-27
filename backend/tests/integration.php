<?php
declare(strict_types=1);

require_once __DIR__ . '/../app/Core/Database.php';

use App\Core\Database;

$schema = __DIR__ . '/../../database/schema.sql';
if (!is_file($schema)) {
    throw new RuntimeException('Chýba verzovaná schéma MySQL.');
}

if (in_array('--schema-only', $argv, true)) {
    echo "Verzovaná schéma existuje.\n";
    exit;
}

foreach (['DB_HOST', 'DB_NAME', 'DB_USER'] as $key) {
    if (getenv($key) === false || getenv($key) === '') {
        throw new RuntimeException("Chýba konfigurácia testovacej databázy: $key.");
    }
}
if (!str_ends_with(getenv('DB_NAME'), '_test')) {
    throw new RuntimeException('Integračný test vyžaduje vyhradenú databázu s príponou _test.');
}

$db = Database::fromEnvironment();
foreach ([
    'people', 'accounts', 'account_roles', 'login_attempts', 'resources',
    'resource_images', 'reservations', 'reservation_history', 'access_requests',
    'access_request_history', 'public_content', 'notifications',
] as $table) {
    $db->query("SELECT 1 FROM $table LIMIT 1");
}

echo "MySQL schéma a pripojenie sú funkčné.\n";

require_once __DIR__ . '/../app/Repositories/ResourceRepository.php';

$resources = new App\Repositories\ResourceRepository($db);
$db->beginTransaction();
try {
    $db->exec("INSERT INTO resources (kind, name, description, capacity) VALUES ('room', 'Testovací priestor', 'Testovací popis', 12)");
    $id = $db->lastInsertId();
    $room = $resources->find('room', $id);
    if ($room === null || $room['id'] !== $id || $room['capacity'] !== 12) {
        throw new RuntimeException('Katalóg nevrátil uložený priestor.');
    }
    if ($resources->find('equipment', $id) !== null) {
        throw new RuntimeException('Katalóg zamenil typ zdroja.');
    }
    $db->exec("UPDATE resources SET archived_at = UTC_TIMESTAMP() WHERE id = " . (int) $id);
    if ($resources->find('room', $id) !== null || in_array($id, array_column($resources->list('room'), 'id'), true)) {
        throw new RuntimeException('Katalóg zobrazuje archivovaný priestor.');
    }
} finally {
    $db->rollBack();
}

echo "MySQL katalóg prešiel integračnou kontrolou.\n";

require_once __DIR__ . '/../app/Core/ApiProblem.php';
require_once __DIR__ . '/../app/Core/ProtectedApi.php';
require_once __DIR__ . '/../app/Repositories/AccountRepository.php';
require_once __DIR__ . '/../app/Services/RequestService.php';

function check(bool $condition, string $message): void
{
    if (!$condition) {
        throw new RuntimeException($message);
    }
}

function expectProblem(string $code, callable $operation): void
{
    try {
        $operation();
    } catch (App\Core\ApiProblem $problem) {
        check($problem->errorCode === $code, "Očakávaná chyba $code, vrátená {$problem->errorCode}.");
        return;
    }
    throw new RuntimeException("Očakávaná chyba $code.");
}

function raceReservations(PDO $db, string $resource, string $owner, array $draft): void
{
    $command = [PHP_BINARY];
    if (php_ini_loaded_file()) {
        array_push($command, '-c', php_ini_loaded_file());
    }
    $command[] = __DIR__ . '/reserve-worker.php';
    $workers = [];
    $db->beginTransaction();
    try {
        $lock = $db->prepare('SELECT id FROM resources WHERE id = ? FOR UPDATE');
        $lock->execute([$resource]);
        $lock->closeCursor();
        for ($index = 0; $index < 2; $index++) {
            $worker = proc_open($command, [['pipe', 'r'], ['pipe', 'w'], ['pipe', 'w']], $pipes);
            check(is_resource($worker), 'Nepodarilo sa spustiť proces rezervácie.');
            $workers[] = [$worker, $pipes[1], $pipes[2]];
            fwrite($pipes[0], json_encode([$owner, $draft], JSON_THROW_ON_ERROR));
            fclose($pipes[0]);
        }
    } finally {
        $db->commit();
    }
    $results = [];
    foreach ($workers as [$worker, $stdout, $stderr]) {
        $results[] = stream_get_contents($stdout);
        $errors = stream_get_contents($stderr);
        fclose($stdout);
        fclose($stderr);
        check(proc_close($worker) === 0, 'Proces rezervácie zlyhal: ' . $errors);
    }
    sort($results);
    check($results === ['CREATED', 'RESERVATION_CONFLICT'], 'Pri súbehu nebola dodržaná kapacita.');
}

$suffix = bin2hex(random_bytes(8));
$email = "student-$suffix@example.test";
$managerEmail = "manager-$suffix@example.test";
$password = bin2hex(random_bytes(12));
$person = $db->prepare("INSERT INTO people (first_name, last_name, email) VALUES ('Test', 'SmartLab', ?)");
$account = $db->prepare('INSERT INTO accounts (person_id, password_hash) VALUES (?, ?)');
$role = $db->prepare('INSERT INTO account_roles (person_id, role) VALUES (?, ?)');
$hash = password_hash($password, PASSWORD_DEFAULT);
$student = $manager = $equipment = null;
try {
    $person->execute([$email]);
    $student = $db->lastInsertId();
    $account->execute([$student, $hash]);
    $role->execute([$student, 'student']);
    $person->execute([$managerEmail]);
    $manager = $db->lastInsertId();
    $account->execute([$manager, $hash]);
    $role->execute([$manager, 'manager']);

    $accounts = new App\Repositories\AccountRepository($db);
    $ip = '127.0.0.1';
    check($accounts->authenticate($email, 'nesprávne', $ip) === null, 'Zlé heslo bolo prijaté.');
    check($accounts->authenticate($email, $password, $ip)['id'] === $student, 'Platné prihlásenie zlyhalo.');
    for ($attempt = 0; $attempt < 5; $attempt++) {
        check($accounts->authenticate($email, 'nesprávne', $ip) === null, 'Zlé heslo bolo prijaté.');
    }
    check($accounts->authenticate($email, $password, $ip) === null, 'Opakované pokusy neboli zablokované.');
    $db->prepare('UPDATE accounts SET active = 0 WHERE person_id = ?')->execute([$student]);
    check($accounts->identity($student) === null, 'Neaktívny účet má stále platnú identitu.');
    $db->prepare('UPDATE accounts SET active = 1 WHERE person_id = ?')->execute([$student]);

    $hours = json_encode((object) array_fill(1, 7, [['start' => '09:00', 'end' => '17:00']]), JSON_THROW_ON_ERROR);
    $db->prepare("INSERT INTO resources (kind, name, description, quantity, opening_hours)
        VALUES ('equipment', 'Testovací fotoaparát', 'Testovací popis', 2, ?)")->execute([$hours]);
    $equipment = $db->lastInsertId();
    $bookings = new App\Services\RequestService($db, true);
    $day = (new DateTimeImmutable('tomorrow', new DateTimeZone('Europe/Bratislava')));
    $at = static fn (int $hour): string => $day->setTime($hour, 0)
        ->setTimezone(new DateTimeZone('UTC'))->format('Y-m-d\\TH:i:s.000\\Z');
    $draft = [
        'resourceId' => "equipment-$equipment", 'purpose' => 'Integračný test',
        'startUtc' => $at(10), 'endUtc' => $at(12), 'quantity' => 2,
    ];
    $first = $bookings->create($draft, $student);
    check($first['status'] === 'pending' && $first['ownerId'] === $student, 'Vytvorenie rezervácie nevrátilo správny záznam.');
    expectProblem('RESERVATION_CONFLICT', fn () => $bookings->create(
        array_replace($draft, ['startUtc' => $at(11), 'endUtc' => $at(13), 'quantity' => 1]), $student
    ));
    expectProblem('INVALID_RESERVATION', fn () => $bookings->create(
        array_replace($draft, ['startUtc' => $at(8), 'endUtc' => $at(9)]), $student
    ));
    expectProblem('REQUEST_NOT_FOUND', fn () => $bookings->detail($first['id'], $manager));
    $next = $bookings->create(array_replace($draft, ['startUtc' => $at(12), 'endUtc' => $at(13)]), $student);
    check($next['status'] === 'pending', 'Susediaci interval mal byť voľný.');
    $approved = $bookings->transition($first['id'], $manager, 'approved', null, false);
    check($approved['status'] === 'approved' && count($approved['history']) === 2, 'Schválenie nezapísalo históriu.');
    expectProblem('STATUS_CONFLICT', fn () => $bookings->transition($first['id'], $manager, 'rejected', 'test', false));
    $bookings->transition($first['id'], $student, 'cancelled', null, true);
    check($bookings->create($draft, $student)['status'] === 'pending', 'Zrušenie neuvoľnilo kapacitu.');
    raceReservations($db, $equipment, $student, array_replace($draft, ['startUtc' => $at(14), 'endUtc' => $at(15)]));

    $access = new App\Services\RequestService($db, false);
    $request = $access->create(['purpose' => 'Prístup na test'], $student);
    $result = $access->transition($request['id'], $manager, 'rejected', 'Testovací dôvod', false);
    check($result['reason'] === 'Testovací dôvod', 'Dôvod zamietnutia sa neuložil.');
    $notifications = $db->prepare('SELECT COUNT(*) FROM notifications WHERE owner_id = ?');
    $notifications->execute([$student]);
    check((int) $notifications->fetchColumn() === 2, 'Rozhodnutia nevytvorili dve oznámenia.');
} finally {
    if ($student !== null) {
        $db->prepare('DELETE FROM notifications WHERE owner_id = ?')->execute([$student]);
        $db->prepare('DELETE h FROM reservation_history h JOIN reservations r ON r.id = h.reservation_id
            WHERE r.owner_id = ?')->execute([$student]);
        $db->prepare('DELETE FROM reservations WHERE owner_id = ?')->execute([$student]);
        $db->prepare('DELETE h FROM access_request_history h JOIN access_requests r ON r.id = h.access_request_id
            WHERE r.owner_id = ?')->execute([$student]);
        $db->prepare('DELETE FROM access_requests WHERE owner_id = ?')->execute([$student]);
    }
    if ($equipment !== null) {
        $db->prepare('DELETE FROM resources WHERE id = ?')->execute([$equipment]);
    }
    $db->prepare('DELETE FROM login_attempts WHERE attempt_key = UNHEX(?)')
        ->execute([hash('sha256', '127.0.0.1' . "\0" . $email)]);
    foreach (array_filter([$student, $manager]) as $id) {
        $db->prepare('DELETE FROM account_roles WHERE person_id = ?')->execute([$id]);
        $db->prepare('DELETE FROM accounts WHERE person_id = ?')->execute([$id]);
        $db->prepare('DELETE FROM people WHERE id = ?')->execute([$id]);
    }
}

echo "MySQL prihlásenie, rezervácie, žiadosti a oznámenia prešli integračnou kontrolou.\n";
