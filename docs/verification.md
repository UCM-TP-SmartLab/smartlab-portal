# Overenie implementácie

Overované 9. 11. 2026 na Windows, Node 24.22.1, npm 11.19.1.

| Kontrola | Výsledok |
| --- | --- |
| `npm run lint` | Prešlo: ESLint a TypeScript bez chýb |
| `npm test -- --watch=false` | Prešlo: 29 testov v 7 súboroch |
| `npm run build` | Prešlo: statický produkčný výstup, 14 prerenderovaných ciest vrátane koreňa a 404 |
| `npm run check:static` | Prešlo: 13 explicitných ciest s HTML, nadpisom a titulkom |
| `npm run test:e2e` | Prešlo: 13 testov v Chromium, exit code 0 |
| Vizuálna kontrola | Prezretý celý domov na desktope a pri 375 px; bez horizontálneho scrollu |
| `git diff --check` | Prešlo |

Unit testy pokrývajú Bratislava UTC konverzie v lete a zime, neexistujúcu
a dvojznačnú hodinu pri zmene času, interval/množstvo, form factory, reducer
a selector, policy rolí, produkčné odmietnutie zápisov/dostupnosti, demo
kolíziu, vlastníctvo rezervácie a správcovské rozhodnutie s dôvodom.

Prehliadačové testy overujú statický obsah bez JavaScriptu, slovenské verejné
zoznamy/detaily, neznámy slug, nulové produkčné fetch/XHR a externé assety,
neúčinný pokus zapnúť demo cez query/localStorage, šírky 375/800/1440 px,
mobilné menu klávesnicou, tvorbu demo rezervácie, konflikt so zachovaním
formulára, schválenie správcom, obmedzenie prístupu študenta, reset relácie,
žiadosť o prístup a neodoslanie neplatného formulára.

Pri prvom builde boli odhalené chýbajúce prerender parametre dynamických ciest;
oprava používa parametre zo skutočného lokálneho datasetu a klientské súkromné
routy. Prvý prehliadačový beh zachytil poškodenú diakritiku v generovaných
šablónach; opravené UTF-8 zdroje následne prešli rovnakým scenárom.

Obmedzenia: nejde o audit plnej WCAG zhody ani o test reálnej backendovej
integrácie. Schválené dáta neboli dodané; produkčné zoznamy sú preto prázdne.
Autentifikácia, skutočné rezervácie, správa zdrojov/rolí, ICS a notifikácie
zostávajú nedostupné podľa [integračného zoznamu](backend-contract-todo.md).

Záverečné nezávislé read-only review odhalilo prázdne dokončenie provider
operácie a nesúlad UTC dátumového filtra s bratislavským dňom. Obe chyby boli
opravené po reprodukcii zlyhávajúcimi testami. Doplnené testy overujú aj
null výsledok a dve súčasné odoslania cez skutočný effect. Spoločný dátumový
prevod používajú filter aj kalendár. Zjednotené sú aj verejné prezentačné
šablóny a statická 404 funguje bez JavaScriptu. Neostali odložené nálezy.

Na Windows sandbox blokoval ukončenie pomocných serverov cez `taskkill`;
záverečný E2E beh preto prebehol mimo sandboxu a úspešne skončil s kódom 0.
Jeden priebežný beh zachytil dočasný HMR error overlay počas vytvárania novej
šablóny; po dokončení súborov a reštarte testovacieho servera prešiel celý beh.
