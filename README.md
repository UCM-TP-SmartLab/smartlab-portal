# SmartLab UCM & Trnava

Úvodná stránka Angular portálu s dizajnom Eukalyptus, NgModule architektúrou
a statickým HTML generovaným pri builde. Fonty a obrázky sú lokálne,
aplikácia neposiela runtime API požiadavky.

## Spustenie

Node 24.x a npm:

```sh
npm ci
npm start
```

## Build a overenie

```sh
npm run lint
npm test -- --watch=false
npm run build
npm run check:static
npm run preview
```

Na hosting patrí iba `dist/smartlab/browser`. Náhľad je na
http://127.0.0.1:4300. Produkcia nevyžaduje Node server. Hosting má pre
`/domov` doručiť `/domov/index.html` a pre neznáme cesty `404.html`.

Tento commit obsahuje iba úvodnú stránku, spoločný shell a potrebný základ.
Odkazy na pripravované sekcie zatiaľ skončia na obrazovke 404; príslušné
feature moduly budú v nasledujúcich commitoch. Schválené podujatia neboli
dodané, preto úvod zobrazuje pravdivý prázdny stav.

Skutočný HTTPS pôvod možno doplniť do `site.config.json` pred buildom.
Bez domény sa canonical URL ani sitemap nevymýšľajú.
