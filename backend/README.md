# PHP API – stav integrácie

Spustenie (PHP musí byť v PATH):

```sh
npm run start:backend
```

V druhom termináli `npm start`. Angular `/api` proxy smeruje na
`http://127.0.0.1:8000`; adresu vývoja mení `proxy.conf.json`.
Produkčný web musí smerovať `/api` na `backend/public/index.php` a ostatné
cesty na statické Angular súbory. Lokálny `npm run preview` API nehostuje.

## Existujúce trasy

- `GET /api/spaces`
- `GET /api/spaces/{id}`

Frontend volá obe cez `SpacesApi`, cez NgRx effects. Backend zatiaľ vracia
iba `{data: {message, id?}}`. Adaptér tento tvar rozpozná a zobrazí vysvetlenie,
nie vymyslený alebo prázdny úspešný katalóg. Po implementácii reálnych dát
treba dohodnúť typy a dokončiť `SpacesApi.decode` označené `// TODO`.
Budúca ľubovoľná odpoveď sa zámerne neprijíma bez kontroly schémy.

## Kostry

`app/routes-todo.php` obsahuje všetky chýbajúce navrhované trasy s `// TODO`.
Vracajú HTTP **501**, JSON `error.code = NOT_IMPLEMENTED` a nič neukladajú.
Pri implementácii treba danú registráciu nahradiť, nie vytvoriť duplicitnú
trasu za ňou. Presné payloady a enumy ešte nie sú potvrdené.

Chýba: autentifikácia a roly, verejný obsah, reálne priestory, vybavenie,
obsadenosť, rezervácie/vlastníctvo/kolízie, prístupové žiadosti, správcovské
rozhodnutia, admin CRUD zdrojov, upload, používatelia/roly, ICS a notifikácie.
Auth z oddelenej feature vetvy sa tu automaticky nezlučuje.

Frontendové kostry existujúcich metód sú v `ProductionPortalProvider`;
chýbajúce operácie zostávajú explicitne nedostupné a nevolajú fiktívny úspech.
Verejný obsah zatiaľ zostáva lokálny. Demo režim zostáva izolovaný.

Statický build nevykonáva API požiadavky počas prerenderu. Katalóg ich robí
až v prehliadači. Pôvodné tvrdenie o nulových runtime API požiadavkách už
pre aktuálnu integráciu neplatí.

## Overenie integrácie

Lint, statický produkčný build a kontrola HTML prešli. Prešlo 32 unit testov
a 14 prehliadačových testov vrátane volania zoznamu/detailu a spracovania
testovacích odpovedí. Automatická E2E sada používa simulované odpovede.

Po inštalácii PHP 8.6.0 s načítaným `php.ini` bolo 24. 11. 2026 doplnené
živé overenie: všetkých 6 PHP súborov prešlo `php -l`, prešlo 45 HTTP kontrol
(2 existujúce trasy, 39 TODO trás s HTTP 501, neznáma trasa 404, nesprávna
metóda 405 a 2 CORS preflight scenáre). V Chromium bolo overené aj skutočné
Angular → dev proxy → PHP volanie zoznamu a detailu priestoru: HTTP 200,
rozpoznaná testovacia odpoveď, vysvetľujúci stav UI a žiadne JavaScript chyby.
Pri tejto kontrole sa použil absolútny WinGet interpreter, PHP port 18080
a Angular port 14200; po kontrole boli oba pomocné servery ukončené.
