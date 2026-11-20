<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Response;

/**
 * Spracovanie HTTP požiadaviek súvisiacich s autentifikáciou.
 */
class AuthController
{
    /**
     * Vráti informáciu o aktuálnom prihlásení.
     */
    public function me(): void
    {
        $this->disableCache();

        Response::json([
            'authenticated' => Auth::check(),
            'person_id' => Auth::id()
        ]);
    }

    /**
     * Odhlási aktuálne prihlásenie používateľa.
     */
    public function logout(): void
    {
        Auth::logout();

        $this->disableCache();

        Response::json([
            'message' => 'Používateľ bol odhlásený.'
        ]);
    }

    /**
     * Zakáže ukladanie HTTP odpovede do cache.
     */
    private function disableCache(): void
    {
        header('Cache-Control: no-store');
        header('Pragma: no-cache');
    }
}