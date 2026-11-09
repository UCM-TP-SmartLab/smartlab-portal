# SmartLab – návrh statického Angular frontendu

Dátum: 9. 11. 2026

## Zámer a záväzné hranice

Realizovať frontend podľa `SmartLab_Codex_Angular_Zadanie.md` a `AGENTS.md`.
Dodatočná požiadavka používateľa má prednosť: stránky sa vygenerujú pri builde
a za behu nebudú potrebovať aplikačný server ani posielať API požiadavky.
Nasadenie je súbor statických HTML, CSS, JavaScript a lokálnych assetov.
Ich doručovanie zabezpečuje bežný statický hosting. Nejde o otváranie aplikácie
cez protokol `file://`.

Skutočné rezervácie, autentifikácia, prideľovanie rolí a schvaľovanie vyžadujú
backend. Táto verzia ich preto v produkcii označí ako nedostupné. Lokálny vývoj
ponúkne explicitne označené demo používateľských tokov bez sieťových volaní.
Neimplementuje sa backend, OAuth, heslá, CMS ani serverové notifikácie.

## Východiskový stav

Repozitár obsahuje README, zadanie, pravidlá a schválené podklady
`Eukalyptus-design`. Neobsahuje Angular aplikáciu, balíčky, konfiguráciu,
API klienta ani existujúce feature implementácie. Dostupný je Node 24.
Zmeny používateľa v `AGENTS.md` a zadaní sa zachovajú.

## Technická architektúra

- Angular, TypeScript a RxJS s kompatibilnými pevne zaznamenanými závislosťami.
  Konkrétne verzie sa pri implementácii overia v oficiálnej dokumentácii
  a podľa kompatibility s dostupným Node.
- Klasické `NgModule`, komponenty s vlastnými HTML šablónami, žiadne standalone
  komponenty. `CoreModule` pre singletony a `SharedModule` pre spoločné UI,
  formuláre, pipes a moduly jednej UI knižnice.
- Jediná UI knižnica Angular Material, prispôsobená dodanej identite. Formuláre
  používajú jej validačné API a spoločné lokalizované spracovanie chýb.
- Lazy-loaded feature moduly a samostatné routing moduly. Feature store
  registrovaný raz v module, ktorý ho vlastní. Globálny store iba pre demo
  reláciu a skutočne zdieľané údaje.
- Komponenty dispatchujú NgRx actions a vystavujú samostatné selector streams
  cez `async`. Operácie providerov zabezpečujú effects. Žiadne komponentové
  `subscribe()`, priame volania integračných adaptérov ani template gettery.
- Form factories a čisté validátory; policy služby centralizujú povolené akcie.

## Statické generovanie a dáta

Angular prerender sa spúšťa výhradne pri builde. Nasadzuje sa iba výstup pre
prehliadač; nesmie byť potrebný Node proces ani runtime SSR handler.
Build vytvorí HTML pre každú známu verejnú cestu a detail schváleného záznamu.
Produkčné stránky majú čitateľný obsah aj pred spustením JavaScriptu.

Verejný obsah tvorí lokálny typovaný dataset importovaný do aplikácie, bez
runtime `fetch` JSON súborov. Obsah sa aktualizuje úpravou dát a novým buildom.
Rozhrania providerov oddelia verejný obsah, zdroje, dostupnosť, rezervácie,
prístupové žiadosti a správu. Dočasné frontendové typy sa označia ako
predbežné; nepredstavujú schválený backend kontrakt.

Produkčný provider poskytne iba overený lokálny obsah a explicitnú nedostupnosť
nepodporovaných operácií. Bez dodaných článkov, projektov, akcií či zdrojov
budú príslušné sekcie obsahovať pravdivý empty state. Nebudú sa vymýšľať
kapacity, kontakty, fotografie ani partnerstvá. Lokálne demo bude mať odlišný
provider a syntetické záznamy s viditeľným označením. Produkčný build nesmie
umožniť zapnutie dema pomocou URL, prehliadačového úložiska alebo prepínača.

Fonty, ikony, logá a obrázky sa doručujú lokálne. Žiadne Google Fonts,
mapové iframe, analytika, vzdialené obrázky, API polling alebo automatické
požiadavky na externé služby. Používateľom otvorené overené externé odkazy
nie sú automatickou požiadavkou aplikácie. Mapa bude dostupná nanajvýš ako
obyčajný odkaz na adresu, nie automaticky načítaný widget.

## Moduly a cesty

| Modul | Cesty a obsah |
| --- | --- |
| public | `/domov`, `/o-smartlabe`, `/kontakt`, úvodné CTA a štyri piliere |
| news | `/aktuality`, `/aktuality/:slug`, zoznam a detail |
| projects | `/projekty`, `/projekty/:slug`, kategórie a detail |
| events | `/podujatia`, `/podujatia/:slug`, filtre a mesačný kalendár |
| partners | `/partneri`, `/partneri/:slug`, bezpečné externé odkazy |
| student-opportunities | `/prilezitosti-pre-studentov`, detail `/:slug` |
| resources | `/priestory-a-vybavenie`, detail `/:id`, filtre zdrojov |
| availability | `/obsadenost`, zdroj, dátum, intervaly, legenda |
| auth | `/prihlasenie`, `/administracia/prihlasenie`, nedostupnosť alebo demo rola |
| reservations | `/rezervacie`, `/rezervacie/nova`, `/rezervacie/:id` |
| access-requests | `/ziadosti-o-pristup`, formulár a vlastné stavy |
| management | `/administracia`, fronta, detail, zdroje a roly podľa oprávnení |

Koreň presmeruje na `/domov`. Neznáme cesty zobrazia stránku 404, neznáme ID
ani slug nesmú zobraziť nesúvisiaci záznam. Staršie detailné URL nie sú dodané;
ďalšie redirecty sa nebudú vymýšľať. Guardy pri produkčnej nedostupnej relácii
presmerujú na vysvetľujúce prihlásenie; v deme rozlišujú študenta, správcu
a administrátora. Nejde o bezpečnostnú autorizáciu.

## Vzhľad a prístupnosť

Prednosť majú dodané podklady Eukalyptus: grafit `#3d3935`, zelená `#72c593`,
tmavozelená `#3e6b4a`, žltá `#ebd34b`, svetlé neutrálne plochy a Manrope
s lokálnou licenciou. Dodané SVG sa použijú v správnych variantoch, favicon
pre malé rozmery, logo bez deformácie. Nedodané fotografie sa nenahrádzajú
fiktívnymi zábermi skutočného laboratória.

Spoločný shell obsahuje preskočenie na obsah, prístupné mobilné menu,
aktívnu navigáciu a oddelené vstupy do študentskej a správcovskej časti.
Domov má tri hlavné CTA: prístup, rezervovanie a obsadenosť. Layout sa overí
pri 375, 800 a desktopovej šírke. Klávesnica, viditeľný focus, pomenované
ovládacie prvky, správne nadpisy a textové chyby sú súčasťou akceptácie.
Kalendáre majú čitateľnú textovú alternatívu; stav nesmie vyjadrovať iba farba.

## Používateľské toky a pravdivosť stavov

Verejné sekcie podporujú filtre a detaily dostupných dát. Najbližšie podujatia
nezahŕňajú ukončené akcie. Historické akcie nemajú aktívnu registráciu.
Neplatné a nebezpečné odkazy sa nevykreslia ako klikateľné. Slugy správne
prepisujú slovenskú diakritiku. Záznam ponuky s názvom „Test“ sa nezverejní.

V demo režime študent vyberie zdroj, dátum, začiatok, koniec, množstvo
a účel; pred odoslaním vidí zhrnutie. Formulár kontroluje kladné množstvo
a koniec po začiatku, počas operácie blokuje opakované odoslanie a zachováva
údaje pri chybe. Simulovaný konflikt nesmie vytvoriť záznam. Zoznam vlastných
rezervácií obsahuje filtre, detail a potvrdené lokálne zrušenie. Žiadosti
o prístup podporujú podanie a zobrazenie stavu bez predstierania reálnych práv.

Demo správca má frontu rezervácií a prístupových žiadostí, detail a rozhodnutie
s dôvodom zamietnutia. Zmena sa prejaví až po odpovedi demo providera.
Administrácia zdrojov a rolí zostáva v produkcii nedostupná; v deme môže
ukazovať syntetický prehľad. Nevytvorí sa nové CMS. Deštruktívne úkony
vyžadujú potvrdzovací dialóg.

Demo stav je lokálny pre aktuálnu reláciu a nie je zdieľaný medzi zariadeniami.
Obnovenie stránky ho resetuje; rozhranie to vysvetlí. Nie je to záloha,
skutočná rezervácia ani odoslaná žiadosť.

## Časy, chyby a integrácie

Časové okamihy sa zobrazujú v `Europe/Bratislava` v 24-hodinovom formáte.
Date-only hodnoty si zachovajú kalendárny dátum. Konverzia zadanej miestnej
hodiny musí rozpoznať neexistujúce a nejednoznačné časy pri zmene času;
nepoužije sa slepé `toISOString()` pre miestnu polnoc.

Každá dátová obrazovka má podľa kontextu loading, empty, error, unauthorized
a unavailable stav. Verejná obsadenosť neobsahuje osobné údaje. Bez dát
o obsadenosti sa nezobrazuje „voľné“. ICS odber je nedostupný, kým nie je
schválený feed a zmena požiadavky na nulové runtime požiadavky.

`docs/backend-contract-todo.md` zachytí chýbajúce schémy, enumy, autentifikáciu,
roly, dostupnosť, kolízie, časové formáty, business pravidlá, prístupové žiadosti,
administráciu, notifikácie, ICS a budúcu sieťovú konfiguráciu. Terajšia verzia
neintegruje ani staré verejné endpointy, pretože používateľ vyžaduje lokálne dáta.

## SEO a hosting

Prerenderované verejné stránky dostanú samostatné titulky a descriptions.
Canonical, absolútne Open Graph odkazy a sitemap budú používať explicitnú
konfiguráciu skutočného pôvodu; doména sa nebude vymýšľať. Bez nastavenej
produkčnej domény build nesmie publikovať zástupné canonical URL.
Súkromné a demo stránky nepatria do sitemap a dostanú `noindex`.
Dokumentácia vysvetlí statické smerovanie, 404, trailing slash a rozdiel
medzi lokálnym vývojovým serverom a výsledným statickým nasadením.

## Overenie a odovzdanie

Implementácia dodá reprodukovateľné skripty na vývoj, demo, produkčný build,
lint, unit testy a kontrolu statického výstupu. Testy pokryjú časové validátory,
prechody letného/zimného času, normalizáciu odkazov a slugov, reducers,
selectors, permissions a odmietnutie produkčných operácií.

Kritické UI scenáre overia rezerváciu v deme, konflikt so zachovaným formulárom,
správcovské rozhodnutie a neprístupné roly. Kontrola produkčného buildu
preverí HTML verejných ciest bez JavaScriptu a sieťové správanie pri navigácii:
žiadne aplikačné API, fetch/XHR, vzdialené fonty či médiá. Načítanie vlastného
HTML a statických JS/CSS súborov je nevyhnutné doručenie webu.

README uvedie spustenie a nasadenie; `docs/implementation-plan.md` popíše
realizačné kroky. Odovzdanie odlíši hotové obrazovky, demo operácie,
nedostupné integrácie a skutočné výsledky vykonaných overení.
