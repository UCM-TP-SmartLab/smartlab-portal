# Rozhranie SmartLab API

Cesty sa začínajú /api. Úspešný JSON má obal `{"data": ...}` a chyba má
obal `{"error":{"code":"...","message":"..."}}`. Identifikátory sú reťazce.
HTTP 400 označuje neplatný vstup, 401 chýbajúce prihlásenie alebo zamietnuté
prihlasovacie údaje, 403 chýbajúce oprávnenie alebo CSRF, 404 chýbajúci
záznam, 409 konflikt a 503 nedostupnú službu.

## Autentifikácia

| Metóda a cesta | Vstup a výsledok |
| --- | --- |
| POST /auth/login | `{email,password}`. Vráti `{session:{id,name,role},csrfToken}`. |
| GET /auth/me | Rovnaký tvar. Bez platnej relácie sú session aj csrfToken null. |
| POST /auth/logout | Ukončí reláciu a vráti session aj csrfToken ako null. |

Na chránenom zápise posielajte X-CSRF-Token z prihlásenia alebo obnovy
relácie. PHP overí rolu v MySQL. Pri viacerých rolách má prednosť admin,
potom manager a student. Neúspešné prihlásenie má kód LOGIN_FAILED.

## Verejné dáta

| Metóda a cesta | Výsledok |
| --- | --- |
| GET /public/{kind}?page=1 | Najviac 50 publikovaných záznamov. Pole nextPage vedľa data odkazuje na ďalšiu stranu alebo je null. |
| GET /public/{kind}/{slug} | Publikovaný záznam podľa slugu. |
| GET /spaces, /equipment | Zoznam aktívnych zdrojov. |
| GET /spaces/{id}, /equipment/{id} | Detail aktívneho zdroja. |
| GET /spaces/{id}/availability?date=YYYY-MM-DD, obdobne pre /equipment | Blokované intervaly dňa v Europe/Bratislava. Položka obsahuje start, end a status. |
| GET /spaces/{id}/calendar.ics | Kalendár obsadenosti na jeden rok od dnešného dátumu UTC. |
| GET /resource-images/{filename} | Obrázok aktívneho zdroja. |

Hodnoty kind sú news, projects, events, partners a student-opportunities.
Záznam má id, slug, title, summary, body a voliteľné textové metadáta
category, date, end, author, url, form, audience a partner. Zdroj má id,
type, name, description, capacity pre priestor alebo quantity pre
vybavenie a prípadne imageUrl. Dostupnosť a ICS obsahujú iba obsadenosť.

## Rezervácie a žiadosti

| Metóda a cesta | Oprávnenie a zápis |
| --- | --- |
| GET /me/reservations, /me/access-requests | Študent, vlastné záznamy. |
| GET /reservations/{id}, /access-requests/{id} | Vlastník, správca alebo administrátor. |
| POST /reservations | Študent. `{resourceId,startUtc,endUtc,quantity,purpose}`. |
| POST /reservations/{id}/cancel | Vlastník. Zruší čakajúcu alebo schválenú rezerváciu. |
| POST /access-requests | Študent. `{purpose}`. |
| GET /management/reservations, /management/access-requests | Správca alebo administrátor. |
| POST /management/reservations/{id}/decision, obdobne pre /access-requests | Správca alebo administrátor. `{status,reason}`. Stav je approved alebo rejected. Dôvod je pri zamietnutí povinný. |

Záznam má id, ownerId, purpose, status, history a prípadne reason.
Položka histórie má status, at a prípadne reason. Rezervácia má tiež
resourceId, startUtc, endUtc, date, start, end a quantity. Zdroj má číselné
ID pre priestor a predponu equipment- pre vybavenie. Vstupné UTC časy majú
tvar YYYY-MM-DDTHH:mm:ss.000Z. Polia date, start a end sú v Europe/Bratislava.
Stavy pending a approved blokujú kapacitu. RESERVATION_CONFLICT označuje
kolíziu kapacity a STATUS_CONFLICT zmenu už rozhodnutého stavu.

## Administrácia a oznámenia

| Metóda a cesta | Výsledok |
| --- | --- |
| GET /admin/resources | Zoznam vrátane archivovaných zdrojov. |
| POST /admin/resources | Vytvorí zdroj z `{type,name,description,capacity?,quantity?,location?,openingHours?}`. |
| PATCH /admin/resources/{id} | Upraví uvedené polia aktívneho zdroja. Typ zostáva rovnaký. |
| DELETE /admin/resources/{id} | Archivuje zdroj a vráti aktualizovaný záznam. |
| POST /admin/resources/{id}/images | Multipart pole image, JPEG, PNG alebo WebP do 5 MB. Vráti `{id,url}`. |
| GET /admin/users, /admin/roles | Účty `{id,name,email,active,roles}` alebo zoznam rolí. |
| PUT /admin/users/{id}/roles | Nahradí roly z `{roles:[...]}` a vráti aktualizovaný účet. |
| GET /me/notifications | Vlastné oznámenia, položka má id, message, createdAt a readAt. |
| PATCH /me/notifications/{id} | Označí vlastné oznámenie ako prečítané a vráti jeho aktuálnu hodnotu. |

Administrátorské trasy vyžadujú rolu admin. Otváracie hodiny sú objekt
s kľúčmi 1 až 7 od pondelka do nedele. Hodnota je zoznam intervalov
`{start:"09:00",end:"17:00"}`. Chýbajúci deň v nastavenom rozvrhu znamená
zatvorené. Hodnota null ponechá rezervácie bez časového rozvrhu.
