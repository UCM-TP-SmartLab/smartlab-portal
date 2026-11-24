<?php
declare(strict_types=1);

use App\Core\Response;
use App\Core\Router;

return static function (Router $router): void {

    // TODO: Pri implementácii chránených trás overiť session a oprávnenia na serveri.
    // Tieto kostry zámerne nečítajú ani nemenia používateľské dáta.
    $notImplemented = static function (...$parameters): void {
        Response::error('NOT_IMPLEMENTED', 'Táto operácia ešte nie je implementovaná.', 501);
    };

    // TODO: Doplniť autentifikáciu, používateľa/roly v session a odhlásenie.
    // Existujúce riešenie z feature/auth integrovať namiesto paralelnej implementácie.
    $router->add('POST', '/api/auth/login', $notImplemented);
    $router->add('GET', '/api/auth/me', $notImplemented);
    $router->add('POST', '/api/auth/logout', $notImplemented);

    // TODO: Verejný obsah; dohodnúť schémy, stránkovanie a prístup podľa slug.
    foreach (['news', 'projects', 'events', 'partners', 'student-opportunities'] as $kind) {
        $router->add('GET', '/api/public/' . $kind, $notImplemented);
        $router->add('GET', '/api/public/' . $kind . '/{slug}', $notImplemented);
    }

    // TODO: Vybavenie, dostupnosť a ICS bez osobných údajov. Spaces trasy sú v index.php.
    $router->add('GET', '/api/equipment', $notImplemented);
    $router->add('GET', '/api/equipment/{id}', $notImplemented);
    $router->add('GET', '/api/spaces/{id}/availability', $notImplemented);
    $router->add('GET', '/api/equipment/{id}/availability', $notImplemented);
    $router->add('GET', '/api/spaces/{id}/calendar.ics', $notImplemented);

    // TODO: Vlastníka určiť zo session, overiť pravidlá, UTC interval a kolízie atomicky.
    $router->add('GET', '/api/me/reservations', $notImplemented);
    $router->add('POST', '/api/reservations', $notImplemented);
    $router->add('GET', '/api/reservations/{id}', $notImplemented);
    $router->add('POST', '/api/reservations/{id}/cancel', $notImplemented);

    // TODO: Dohodnúť význam a povinné údaje prístupu; implementovať vlastné žiadosti.
    $router->add('GET', '/api/me/access-requests', $notImplemented);
    $router->add('POST', '/api/access-requests', $notImplemented);
    $router->add('GET', '/api/access-requests/{id}', $notImplemented);

    // TODO: Správcovská fronta, rozhodnutia, povinný dôvod zamietnutia a kontrola stavu.
    $router->add('GET', '/api/management/reservations', $notImplemented);
    $router->add('GET', '/api/management/access-requests', $notImplemented);
    $router->add('POST', '/api/management/reservations/{id}/decision', $notImplemented);
    $router->add('POST', '/api/management/access-requests/{id}/decision', $notImplemented);

    // TODO: Správa priestorov/vybavenia; resources je pracovné spoločné označenie.
    $router->add('GET', '/api/admin/resources', $notImplemented);
    $router->add('POST', '/api/admin/resources', $notImplemented);
    $router->add('PATCH', '/api/admin/resources/{id}', $notImplemented);
    $router->add('DELETE', '/api/admin/resources/{id}', $notImplemented);
    $router->add('POST', '/api/admin/resources/{id}/images', $notImplemented);

    // TODO: Administrátorské oprávnenia a priraďovanie skutočných serverových rolí.
    $router->add('GET', '/api/admin/users', $notImplemented);
    $router->add('GET', '/api/admin/roles', $notImplemented);
    $router->add('PUT', '/api/admin/users/{id}/roles', $notImplemented);

    // TODO: Voliteľné in-app notifikácie; odosielanie emailov patrí backendu.
    $router->add('GET', '/api/me/notifications', $notImplemented);
    $router->add('PATCH', '/api/me/notifications/{id}', $notImplemented);
};
