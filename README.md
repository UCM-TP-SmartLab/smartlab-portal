# SmartLab UCM & Trnava

Staticky generovaný Angular portál s dizajnom Eukalyptus a PHP backendom.
Verejné stránky obsahujú HTML aj bez JavaScriptu. Katalóg v prehliadači volá
`/api/spaces` a `/api/spaces/{id}`; pri prerenderovaní sa API nevolá.
Backend zatiaľ vracia testovacie správy, ktoré UI označuje ako nedokončené.
Stav všetkých endpointov a kostier s `// TODO`: [backend/README.md](backend/README.md).

## Spustenie

Potrebný je Node **24.x** a npm. Verzie závislostí zaznamenáva `package-lock.json`.

```sh
npm ci
npm start
```

Verejný statický režim počas vývoja: `http://localhost:4200`.

Pre napojenie API spustite v druhom termináli `npm run start:backend`
(PHP musí byť v PATH). Vývojové proxy je v `proxy.conf.json`.
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
Neexistujúca cesta má dostať HTTP 404 a obsah `404.html`; JavaScript potom
zobrazí aj konkrétny stav chýbajúceho záznamu. Pre priame vstupy na chránené
produkčné cesty možno použiť `index.csr.html` ako statický fallback, ktorý
presmeruje na obrazovku nedostupného prihlásenia. Nevytvárajte runtime SSR.
Aktuálna konfigurácia predpokladá hosting v koreni domény (`base href="/"`).

Skutočnú doménu nastavte do `site.config.json`, napr. ako čistý HTTPS pôvod
v poli `origin`, a znovu vykonajte build. Dovtedy sa absolútne canonical URL
a sitemap nevytvárajú. Po nastavení sa `sitemap.xml` generuje zo skutočne
prerenderovaných verejných ciest; súkromné cesty a 404 sú vylúčené.

## Obsah a architektúra

- Schválený verejný obsah: `src/app/data/public-content.ts`. Nové záznamy
  sa publikujú novým buildom, detaily sa automaticky prerenderujú.
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
Pôvodné verejné API sa podľa požiadavky na statický web nevolá.

## Hotové obrazovky a hranice

Domov, O SmartLabe, kontakt, aktuality/projekty/podujatia/partneri/študentské
príležitosti so zoznamom a detailom; katalóg a detail zdroja; samostatná
obsadenosť; verejný kalendár podujatí; študentské a správcovské prihlásenie;
demo rezervácia, vlastné rezervácie a história, zrušenie, žiadosti o prístup,
správcovská fronta a rozhodnutie; administrátorské prehľady zdrojov a rolí.

Produkčné rezervácie, živá dostupnosť, autentifikácia, správa zdrojov/rolí,
ICS a notifikácie sú **nedostupné**, kým neexistujú schválené integrácie a
nie sú dokončené PHP operácie označené `// TODO`. Demo sa nesmie nasadiť
ako skutočný rezervačný systém. Server musí pri budúcej integrácii vynucovať
oprávnenia, kolízie a business pravidlá; frontendové guardy ich nenahrádzajú.

Otvorené operácie a aktuálny postup integrácie sú v [backend/README.md](backend/README.md).

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
guardy, verejné HTML bez JS, mobilné menu, šírky 375/800/1440 px a nulové
volania existujúcich API trás a absenciu externých assetov v produkcii. API
odpovede sú v prehliadačových testoch simulované podľa aktuálneho PHP kódu.
Všetky časy sa zobrazujú
v Europe/Bratislava. Neexistujúca a dvojznačná hodina pri zmene času je
odmietnutá s vysvetlením namiesto tichej konverzie.
