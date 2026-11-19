# SmartLab UCM & Trnava

Staticky generovaný Angular portál s dizajnom Eukalyptus. Produkčný web
nepotrebuje aplikačný server: doručuje iba HTML, JavaScript, CSS, fonty a obrázky.
Za behu nevolá API ani externé služby. Verejné stránky obsahujú HTML aj bez
JavaScriptu; filtre, navigácia aplikácie a demo formuláre používajú JavaScript.

## Spustenie

Potrebný je Node **24.x** a npm. Verzie závislostí zaznamenáva `package-lock.json`.

```sh
npm ci
npm start
```

Verejný statický režim počas vývoja: `http://localhost:4200`.

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
nie je zmenená požiadavka na nulové API požiadavky. Demo sa nesmie nasadiť
ako skutočný rezervačný systém. Server musí pri budúcej integrácii vynucovať
oprávnenia, kolízie a business pravidlá; frontendové guardy ich nenahrádzajú.

Otvorené zmluvy sú v [backend-contract-todo.md](docs/backend-contract-todo.md),
postup v [implementation-plan.md](docs/implementation-plan.md) a výsledky
v [verification.md](docs/verification.md).

## Overenie

```sh
npm run lint
npm test -- --watch=false
npm run build
npm run check:static
npx playwright install chromium
npm run test:e2e
```

E2E automaticky spustí lokálny statický náhľad a samostatný demo dev server.
Testy overujú rezerváciu, konflikt so zachovaním formulára, rozhodnutie,
guardy, verejné HTML bez JS, mobilné menu, šírky 375/800/1440 px a nulové
runtime fetch/XHR alebo externé assety v produkcii. Všetky časy sa zobrazujú
v Europe/Bratislava. Neexistujúca a dvojznačná hodina pri zmene času je
odmietnutá s vysvetlením namiesto tichej konverzie.
