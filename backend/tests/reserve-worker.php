<?php
declare(strict_types=1);

require_once __DIR__ . '/../app/Core/Database.php';
require_once __DIR__ . '/../app/Core/ApiProblem.php';
require_once __DIR__ . '/../app/Core/ProtectedApi.php';
require_once __DIR__ . '/../app/Services/RequestService.php';

[$owner, $draft] = json_decode(stream_get_contents(STDIN), true, flags: JSON_THROW_ON_ERROR);
$service = new App\Services\RequestService(App\Core\Database::fromEnvironment(), true);
try {
    $service->create($draft, $owner);
    echo 'CREATED';
} catch (App\Core\ApiProblem $error) {
    echo $error->errorCode;
}
