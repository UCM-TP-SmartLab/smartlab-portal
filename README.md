# SmartLab UCM & Trnava

Staticky generovaný Angular portál s dizajnom Eukalyptus a PHP backendom.
Verejné stránky obsahujú HTML aj bez JavaScriptu. Prehliadač načítava
produkčné dáta z PHP API nad MySQL. Pri prerenderovaní sa API nevolá.
Konfiguráciu databázy a prvého účtu opisuje [backend/README.md](backend/README.md).

## Spustenie

Potrebný je Node **24.x** a npm. Verzie závislostí zaznamenáva `package-lock.json`.

```sh
npm ci
npm start
```

Verejný statický režim počas vývoja: `http://localhost:4200`.

Pre plnú prevádzku najprv pripravte MySQL podľa pokynov pre backend.
Potom spustite v druhom termináli `npm run start:backend`. Vývojové proxy je
v `proxy.conf.json`.
Na produkcii treba popri statických súboroch nasadiť aj PHP backend a smerovať
`/api` do `backend/public/index.php`; statický preview PHP neposkytuje.

```sh
npm run start:demo
```

Lokálne demo: `http://localhost:4201`. Žltý banner označuje syntetické údaje.
Vstup študenta je `/prihlasenie`, správcu `/administracia/prihlasenie`.
Demo nevyžaduje heslo, neodosiela žiadosti a pri obnovení stránky vymaže stav.
Na skúšku schválenia vytvorte rezerváciu ako študent, potom v tej istej karte
cez hlavičku prejdite do administrácie a zvoľte správcu. Nepoužite obnovenie
stránky medzi krokmi.

## Produkčný build a hosting

```sh
npm run build
npm run check:static
npm run preview
```

Náhľad je na `http://127.0.0.1:4300`. Nasadzuje sa **iba `dist/smartlab/browser`**.
Skripty prerenderovania bežia pri builde. `src/main.server.ts` je vstup buildu,
nie server na produkčné nasadenie. `scripts/serve-static.mjs` je len lokálna
pomôcka; na hostingu ho netreba spúšťať.

Hosting musí doručovať `/domov` aj `/domov/` zo súboru `/domov/index.html`.
Rovnako postupuje pre ostatné vygenerované cesty. `/` je statický vstup.
Pre chránené cesty a detaily získavané z API použite `index.csr.html`, ak pre
danú cestu neexistuje prerenderovaný súbor. Rozsah fallbacku je rovnaký ako
v `scripts/serve-static.mjs`. PHP overí reláciu a Angular zobrazí
prihlásenie alebo chýbajúci záznam podľa odpovede. Neznáme cesty mimo týchto
skupín majú dostať HTTP 404 a obsah `404.html`.
Aktuálna konfigurácia predpokladá hosting v koreni domény (`base href="/"`).

Skutočnú doménu nastavte do `site.config.json`, napr. ako čistý HTTPS pôvod
v poli `origin`, a znovu vykonajte build. Dovtedy sa absolútne canonical URL
a sitemap nevytvárajú. Po nastavení sa `sitemap.xml` generuje zo skutočne
prerenderovaných verejných ciest; súkromné cesty a 404 sú vylúčené.

## Obsah a architektúra

- Verejný obsah v prehliadači sa načítava z MySQL. Schválené záznamy v
  `src/app/data/public-content.ts` slúžia na prerenderovanie a ako lokálna
  záloha pri nedostupnosti API.
- Demo fixtures: `src/app/core/data/demo-fixtures.ts`. Nie sú importované
  produkčným providerom. Demo nemožno zapnúť URL parametrom ani localStorage.
- NgModule features: `src/app/modules`. Verejný obsah má vlastné feature state;
  katalógový parent vlastní zdroje/obsadenosť a workspace parent jediný store
  pre študentské rezervácie, prístupové žiadosti aj správcovskú frontu.
- Komponenty používajú NgRx a `async`; provider operácie vykonávajú effects.
  Form factories, policy služby a časové utility sú oddelené od šablón.
- Lokálne SVG sú z `Eukalyptus-design`. Font Manrope sa balí z
  `@fontsource/manrope`; SIL OFL licencia je v závislosti a v build licenciách.

Bez dodaných schválených obsahových záznamov sú produkčné zoznamy prázdne.
Fotografie, kapacity, e-mail, telefón ani prevádzkové hodiny sa nevymýšľajú.

## Funkcie

Domov, O SmartLabe, kontakt, aktuality/projekty/podujatia/partneri/študentské
príležitosti so zoznamom a detailom; katalóg a detail zdroja; samostatná
obsadenosť; verejný kalendár podujatí; študentské a správcovské prihlásenie;
rezervácie a ich história, žiadosti o prístup, správcovská fronta a rozhodnutia,
administrácia zdrojov a rolí, odber obsadenosti cez ICS a interné oznámenia.

PHP overuje roly, vlastníctvo, časové pravidlá a kolízie rezervácií. Schválenie
žiadosti zaznamená rozhodnutie správcu. Používateľskú rolu mení administrátor.
Podrobnosti sú v [API kontrakte](docs/backend-api.md).

## Overenie

```sh
npm run lint
npm test -- --watch=false
npm run build
npm run check:static
npm run validate:html  # W3C validácia HTML a CSS po builde, potrebuje Javu
npx playwright install chromium
npm run test:e2e
```

E2E automaticky spustí lokálny statický náhľad a samostatný demo dev server.
Testy overujú rezerváciu, konflikt so zachovaním formulára, rozhodnutie,
guardy, verejné HTML bez JS, mobilné menu, šírky 375/800/1440 px a produkčné
API volania so simulovanými odpoveďami. PHP integračná sada používa skutočný
MySQL. Postup spustenia je v [backend/README.md](backend/README.md).
Všetky časy sa zobrazujú
v Europe/Bratislava. Neexistujúca a dvojznačná hodina pri zmene času je
odmietnutá s vysvetlením namiesto tichej konverzie.
