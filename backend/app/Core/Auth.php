<?php
declare(strict_types=1);

namespace App\Core;

/**
 * Správa autentifikácie používateľov SmartLabu.
 */
class Auth
{
    /**
     * Overí, či je používateľ prihlásený
     */
    public static function check(): bool
    {
        return self::id() !== null;
    }

    /**
     * Vráti ID prihlásenej osoby alebo null.
     */
    public static function id(): ?int
    {
        $personId = Session::get('person_id');

        return is_int($personId) ? $personId : null;
    }

    /**
     * Uloží identitu overenej osoby do session.
     */
    public static function login(int $personId): void
    {
        // Po úspešnom overení používateľa zmeníme session ID.
        Session::regenerate();

        // Uložíme ID prihlásenej osoby.
        Session::set('person_id', $personId);
    }

    /**
     * Odhlási používateľa a ukončí jeho session.
     */
    public static function logout(): void
    {
        Session::destroy();
    }
}