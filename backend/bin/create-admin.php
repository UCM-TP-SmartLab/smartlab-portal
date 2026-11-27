<?php
declare(strict_types=1);

require_once __DIR__ . '/../app/Core/Database.php';

use App\Core\Database;

if ($argc !== 4 || !filter_var($argv[1], FILTER_VALIDATE_EMAIL) || strlen($argv[1]) > 254 ||
    trim($argv[2]) === '' || trim($argv[3]) === ''
) {
    fwrite(STDERR, "Použitie: php backend/bin/create-admin.php <e-mail> <meno> <priezvisko>\nHeslo číta zo štandardného vstupu.\n");
    exit(1);
}

$password = rtrim((string) fgets(STDIN), "\r\n");
if (strlen($password) < 12 || strlen($password) > 72 || str_contains($password, "\0")) {
    fwrite(STDERR, "Heslo musí mať 12 až 72 bajtov a nesmie obsahovať nulový znak.\n");
    exit(1);
}

try {
    $db = Database::fromEnvironment();
    $db->beginTransaction();
    $person = $db->prepare('INSERT INTO people (email, first_name, last_name) VALUES (?, ?, ?)');
    $person->execute([$argv[1], trim($argv[2]), trim($argv[3])]);
    $id = $db->lastInsertId();
    $account = $db->prepare('INSERT INTO accounts (person_id, password_hash) VALUES (?, ?)');
    $account->execute([$id, password_hash($password, PASSWORD_DEFAULT)]);
    $role = $db->prepare("INSERT INTO account_roles (person_id, role) VALUES (?, 'admin')");
    $role->execute([$id]);
    $db->commit();
    echo "Administrátorský účet bol vytvorený.\n";
} catch (Throwable) {
    if (isset($db) && $db->inTransaction()) {
        $db->rollBack();
    }
    fwrite(STDERR, "Účet sa nepodarilo vytvoriť. Overte konfiguráciu a jedinečnosť e-mailu.\n");
    exit(1);
}
