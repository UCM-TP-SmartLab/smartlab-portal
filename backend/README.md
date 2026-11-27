# SmartLab PHP API

Použite PHP 8.3 alebo novší s rozšírením pdo_mysql a MySQL 8.4. Vytvorte
prázdnu databázu a importujte [schému MySQL](../database/schema.sql).
Prevádzkové údaje a účty vložte podľa schválených podkladov. Pri importe zo
staršieho Oracle modelu treba namapovať údaje do novej schémy.

## Konfigurácia

| Premenná | Význam |
| --- | --- |
| DB_HOST | Hostiteľ MySQL |
| DB_PORT | Port MySQL, predvolene 3306 |
| DB_NAME | Názov databázy |
| DB_USER, DB_PASSWORD | Účet aplikácie s oprávneniami na čítanie a zápis v jej databáze |
| APP_ORIGIN | Pôvod webu, vo vývoji predvolene http://localhost:4200 |
| SESSION_SECURE | V produkcii za HTTPS proxy nastavte hodnotu 1 |
| RESOURCE_IMAGE_DIRECTORY | Zapisovateľný priečinok pre obrázky mimo verejného koreňa |

PHP číta premenné z prostredia procesu. Pre fotky povoľte nahrávanie súborov
a nastavte upload_max_filesize aspoň na 5 MB a post_max_size nad tento limit.
Prihlásenie počíta pokusy podľa e-mailu a IP v 15-minútovom okne.

## Účty a spustenie

Prvý administrátorský účet vytvorí príkaz nižšie. Heslo načíta zo štandardného
vstupu a uloží jeho hash. Použite 12 až 72 bajtov.

    php backend/bin/create-admin.php admin@example.com Meno Priezvisko
    npm run start:backend

Pre ďalšie účty pridajte osobu a aktívny účet do tabuliek people a accounts.
Použite hash vytvorený PHP cez password_hash. Rolu nastavte cez administráciu
alebo pri založení účtu cez account_roles.

V druhom termináli spustite npm start. Angular proxy odovzdáva požiadavky na
/api backendu na 127.0.0.1:8000. V produkcii doručujte Angular a API na
rovnakom HTTPS pôvode a smerujte /api do backend/public/index.php.
Formát požiadaviek a odpovedí opisuje [API kontrakt](../docs/backend-api.md).

## Overenie

Na čistom MySQL vytvorte vyhradenú databázu s príponou _test, importujte
schému a nasmerujte na ňu premenné DB_*. Rozšírenie pdo_mysql povoľte
v konfigurácii PHP aj pre podprocesy. Test vytvorí a odstráni vlastné záznamy.

    php backend/tests/AuthTest.php
    php backend/tests/integration.php
