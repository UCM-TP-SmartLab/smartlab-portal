# SmartLab UCM & Trnava — Zadanie pre Codex agenta (Angular frontend)

> **Úloha:** Implementovať moderný, responzívny Angular frontend portálu SmartLab UCM & Trnava, vrátane používateľských obrazoviek rezervačného systému a administrácie. **Backend implementuje iný člen tímu.**
>
> **Zdroje zadania:** „Analýza súčasného webu SmartLab UCM & Trnava“ (stav k 5. 11. 2026) a dodané „Angular Agent Instructions“ (pripojené v plnom znení v prílohe A tohto súboru).
>
> **Rozsah:** Toto je implementačný brief pre frontend, nie povolenie meniť existujúcu produkčnú službu. Neznáme požiadavky a backendové kontrakty sa nesmú vydávať za potvrdené.

## 1. Pokyny pre agenta a hranice práce

1. **Použi Angular s klasickou architektúrou `NgModule`, nie standalone komponenty.** Dodrž všetky pravidlá v prílohe A. Najprv preskúmaj existujúci repozitár a prispôsob sa jeho Angular/TypeScript/RxJS/NgRx verziám, štýlom, skriptom a UI knižnici.
2. **Implementuj iba frontend.** Nevytváraj backendový server, databázu, migrácie, serverovú autentifikáciu ani serverové API. Nezasahuj do cudzieho backendového repozitára.
3. Vytvor prehľadnú integračnú vrstvu pre API. **Nevymýšľaj záväzné endpointy, payloady ani enum hodnoty** pre nové rezervácie a žiadosti. Keď nie je dostupný OpenAPI kontrakt, použi jednoznačne pomenované dočasné frontendové typy/adaptéry a izolované *mock data providers* **len na lokálny vývoj/testovanie**. Každú otvorenú závislosť zaznamenaj v `docs/backend-contract-todo.md`.
4. Ak repozitár už používa vygenerovaného API klienta, uprednostni jeho typy a metódy. Produkčný režim nesmie potichu zobrazovať falošné úspešné rezervácie ani fiktívne živé údaje; pokiaľ API neexistuje, zobraz informáciu o nedostupnosti funkcie.
5. Zachovaj súčasné funkčné verejné sekcie portálu a zlepši ich používateľskú skúsenosť. **Nekopíruj automaticky existujúce chyby alebo testovacie údaje.**
6. Na konci práce odovzdaj fungujúci projekt, stručný návod na spustenie, zoznam dokončených funkcionalít, neimplementovaných integrácií a výsledky build/lint/test krokov. Neoznačuj mockovaný scenár za plne integrovaný.
7. Pri nejasnostiach, ktoré neblokujú frontend, zvoľ rozumný **konfigurovateľný UI predpoklad**, označ ho v dokumentácii a pokračuj. Pri citlivých alebo serverovo vynucovaných pravidlách sa nespoliehaj na frontend ako zdroj pravdy.

## 2. Produktový cieľ

Vytvoriť jednotné rozhranie pre tieto skupiny používateľov:

- **Návštevník:** číta verejný obsah, vidí miestnosti, vybavenie a obsadenosť bez súkromných údajov.
- **Študent:** po prihlásení podáva žiadosť o prístup do labu, žiada o rezervácie a sleduje ich stavy.
- **Správca:** spracúva rezervácie a žiadosti o prístup, vidí prehľad kolízií a dôvody rozhodnutí.
- **Administrátor:** má UI na správu zdrojov, používateľských rolí a relevantného obsahu (len v rozsahu dostupného API).

**Kľúčové používateľské úlohy:** „Požiadať o prístup“, „Rezervovať miestnosť/vybavenie“, „Pozrieť obsadenosť“, „Schváliť/zamietnuť žiadosť“.

## 3. Technológie a frontend architektúra

- Angular + TypeScript, klasické `NgModule`, samostatné `.html` šablóny, voliteľné komponentové `.scss` súbory.
- Routing rozdelený na lazy-loaded feature moduly. `CoreModule` pre singletony; `SharedModule` pre opakovane použiteľné prvky. Rešpektuj existujúcu štruktúru repo.
- **NgRx pre feature state a serverové operácie**, pokiaľ ho repozitár používa / jeho doplnenie je súčasťou poskytnutých konvencií. Volania API v effects; komponenty dispatchujú actions, čítajú selectors cez `async` pipe. Nepoužívaj `subscribe()` v komponentoch.
- Reactive Forms, oddelené form factories podľa konvencií. Validácie a chybové hlásenia centrálne v existujúcej UI knižnici.
- Dostupná UI knižnica v projekte má prednosť pred inštaláciou novej. **Nevyberaj náhodnú druhú knižnicu.**
- Konfigurovateľný API base URL/proxy a autentifikačný interceptor podľa existujúceho riešenia. Nepoužívaj napevno `localhost` v komponentoch.
- Slovenčina ako primárny jazyk; kód pripravený na budúce preklady, bez povinnosti vytvárať anglický obsah, kým to objednávateľ nepotvrdí.
- Preferuj zrozumiteľnosť, KISS, YAGNI a typovú bezpečnosť. Podrobné pravidlá sú v **prílohe A**.

### Navrhované hranice feature modulov (prispôsobiť repo)

| Feature | Zodpovednosť |
| --- | --- |
| `public` / `home` | Domov, O SmartLabe, Kontakt |
| `news` | Aktuality, detail článku |
| `projects` | Projekty, filtrovanie, detail |
| `events` | Podujatia, filtre, kalendár podujatí, detail |
| `partners` | Partneri, detail, externé odkazy |
| `student-opportunities` | Ponuky pre študentov, detail |
| `resources` | Katalóg miestností a vybavenia, detail |
| `availability` | Verejný kalendár obsadenosti podľa zdroja |
| `reservations` | Vytvorenie a správa vlastných rezervácií |
| `access-requests` | Žiadosti o prístup do laboratória |
| `auth` | Prihlasovacie a prístupové obrazovky |
| `management` | Správca a administrátor: rozhodnutia, zdroje, roly |

## 4. Verejná prezentačná časť — funkčné požiadavky

### 4.1 Navigácia a spoločný layout

- Navigácia: **Domov, O SmartLabe, Aktuality, Projekty, Podujatia, Partneri, Kontakt, Študenti**; pridať jasný vstup **Priestory a vybavenie / Rezervácie** a oddeliť bežné prihlásenie od administrácie.
- Responzívna hlavička, mobilné menu s prístupným názvom, aktívne položky, pätička s relevantnými partnermi/logami, breadcrumbs pri detailoch podľa existujúceho UI vzoru.
- Stránka 404, loading, error a empty stavy; nevytvárať prázdne plochy pri scroll animáciách.
- Udržuj kompatibilné URL/redirecty tam, kde sú známe, najmä `/domov`, `/prilezitosti-pre-studentov`, prípadne existujúce detailné URL. Existujúce cesty prever pred implementáciou.

### 4.2 Domov

- Hero SmartLab s jasnou identitou a tromi CTA: **Požiadať o prístup**, **Rezervovať miestnosť**, **Pozrieť obsadenosť**.
- Štyri piliere: inovácie, spolupráca, vzdelávanie, digitálna transformácia.
- Výber projektov, budúcich podujatí a krátke predstavenie skutočných priestorov a vybavenia, ak sú dostupné schválené obrázky.
- Sekcia „Najbližšie podujatia“ zobrazuje **iba budúce/aktuálne relevantné akcie**; pri neexistencii takých akcií zobraz vhodný empty state, nie historické podujatia pod zavádzajúcim názvom.

### 4.3 O SmartLabe, Kontakt

- Zachovaj obsah o poslaní, hodnotách, cieľoch a oblastiach činnosti a galérie priestorov.
- Kontakt: adresa **Hlavná 5, Trnava**, e-mail iba ak je overený zo zdroja, mapa a existujúci šesťkrokový návod k vstupu (ak sú dostupné podklady a práva na ich použitie).
- Telefón, otváracie hodiny a kontaktný formulár nevymýšľaj: zobraz ich len po dodaní potvrdených údajov a potrebného API.

### 4.4 Aktuality, Projekty, Podujatia, Partneri, Študenti

- **Aktuality:** zoznam a detail; dátum, autor, obrázky s alt textom.
- **Projekty:** zoznam a detail, filtrovanie kategórií, normalizované názvy kategórií; dátum/stav iba ak sú dodané.
- **Podujatia:** zoznam/detail, filtre dátumu, formy, cieľovej skupiny a partnera (ak sú v dátach), mesačný kalendár **podujatí** (odlišný od rezervácií). Pri historickom podujatí nezobraz aktívnu registráciu; neplatné linky nerenderuj ako klikateľné.
- **Partneri:** zoznam a detail, bezpečné normalizovanie externých `https://` odkazov a ich validácia.
- **Študenti:** ponuky/zákazky a detail, ak je obsah dostupný. Nikdy nezobrazuj známy testovací záznam „Test“ ako reálnu ponuku. Prípadná integrácia so študentskými účtami až podľa dodaného kontraktu.
- Verejné API zdroje identifikované analýzou: `/api/public/projects`, `/api/public/events`, `/api/public/partners`. **Over skutočné schémy odpovedí a prístup/CORS; nepredpokladaj, že nové API používa rovnakú schému.**
- Pri prevzatí obsahu z pôvodného webu nerozbiehaj produkčné scrapovanie ani automatické kopírovanie cudzích obrázkov bez schválenia.

## 5. Priestory a vybavenie

- Samostatná sekcia s prepínačom/filtermi **Miestnosti / Vybavenie** a prehľadom zdrojov.
- Karta miestnosti: názov, fotografia (ak dostupná), kapacita (ak potvrdená), opis, dostupné vybavenie, dostupnosť a CTA **Rezervovať**.
- Karta vybavenia: názov, typ, počet kusov, stav/dostupnosť (iba ak API poskytuje), opis, CTA **Rezervovať**.
- Detail zdroja obsahuje informácie, kalendár obsadenosti a prechod do rezervácie s predvybraným zdrojom.
- Pri chýbajúcich kapacitách alebo fotkách zobraz primeraný placeholder alebo „Údaj zatiaľ nie je dostupný“, nie vymyslené hodnoty.

## 6. Kalendár obsadenosti

- Oddelený od kalendára verejných podujatí.
- Prehľad s výberom zdroja, navigáciou medzi dátumami a časovými úsekmi, čitateľnou legendou stavov a označením voľných/obsadených intervalov podľa API.
- Návštevník vidí len obsadenosť (bez osobných údajov); oprávnený používateľ môže kliknúť na voľný termín a začať rezerváciu.
- Čakajúce a schválené rezervácie môžu blokovať ďalšie požiadavky **podľa pravidiel servera**; UI musí vizualizovať konflikty, ktoré server vráti. Samotné vizuálne zablokovanie slotu **nie je ochrana pred dvojitou rezerváciou**.
- UI zobrazuje čas v `Europe/Bratislava` v 24-hodinovom formáte; implementuj správne letný/zimný čas. Integračné dáta o časových okamihoch spracuj podľa kontraktu (preferované ISO 8601 UTC).
- Tlačidlo na odber kalendára cez **ICS** pre zdroj, keď backend poskytne feed URL. Google a Outlook vedia odoberať ICS, ale aktualizácia nie je okamžitá. **Neimplementuj obojsmernú synchronizáciu** bez samostatnej požiadavky a backendovej podpory.

## 7. Prihlásenie, roly a chránené obrazovky

- Oddeliť UX **Prihlásenie študenta** od **Administrácia**; pre autentifikáciu používať výlučne dostupný mechanizmus backendu/identity providera.
- **Microsoft Entra ID / školské účty UCM sú nepotvrdený variant**, nie záväzná integrácia. Pokiaľ nie je dodaná konfigurácia a schválenie, nevytváraj vlastný OAuth flow ani neukladaj heslá.
- Guardy a navigácia podľa rolí: `visitor`, `student`, `manager`, `admin` ako **pracovné názvy UI**, mapovanie na skutočné backend roly po dodaní kontraktu.
- Neautorizovaný používateľ vidí zrozumiteľné „Nemáte oprávnenie“/presmerovanie podľa potreby; frontendové guardy sú len UX a **nenahrádzajú serverovú autorizáciu**.
- Nezobrazuj citlivé údaje iných študentov vo verejných kalendároch.

## 8. Rezervácie študenta

### 8.1 Formulár novej rezervácie

- Výber miestnosti alebo vybavenia, dátumu, začiatku, konca, prípadne množstva kusov vybavenia a účelu/popisného textu, ak ich vyžaduje backend.
- Reactive Form: povinné údaje, validita časového intervalu (`koniec > začiatok`), kladné množstvo, vizualizácia dostupnosti. **Pravidlá ako maximálna dĺžka rezervácie, predstih či otváracie hodiny sú neznáme**; podporiť ich konfigurovateľne po potvrdení.
- Pred odoslaním zhrnutie požiadavky; po odoslaní success/error stav podľa skutočnej odpovede servera. Počas odoslania ochrana pred opakovaným kliknutím.
- Pri konflikte (napr. HTTP 409, ak to určí backend kontrakt) zachovať formulár, vysvetliť problém a umožniť výber iného času. Server je autoritou pre dostupnosť.

### 8.2 Moje rezervácie

- Zoznam vlastných rezervácií s filtrami (dátum, zdroj, stav), detailom a históriou stavov, **ak sú dodané API dáta**.
- Stavy UI: **Čaká na schválenie, Schválená, Zamietnutá, Zrušená** (konkrétne enum hodnoty až podľa backendu).
- Umožniť zrušenie podľa oprávnení a pravidiel backendu; nemanipulovať s uloženým stavom optimisticky, pokiaľ operácia nie je potvrdená.
- Zamietnutie s dôvodom, ak API dôvod poskytuje.

## 9. Žiadosti o prístup do laboratória

- Prihlásený študent odošle formulár žiadosti s potvrdenými požadovanými údajmi, môže vidieť svoj stav a prípadný dôvod zamietnutia.
- Správca má obrazovku na zobrazenie a vybavenie žiadostí; rozhodnutie sa prejaví až po potvrdení API.
- Význam „prístupu“ (jednorazový, semestrálny, na konkrétne vybavenie) zatiaľ **nie je potvrdený**. UI a formuláre navrhni tak, aby sa tento parameter dal doplniť bez zásadnej prestavby; nevymýšľaj prístupové oprávnenia.
- Notifikácie len ako UI stav/in-app zobrazenie, ak API poskytne údaje; e-mail/Teams odosielanie patrí backendu/integrácii, nie frontendovej aplikácii.

## 10. Správcovská a administrátorská časť

### Správca

- Dashboard/fronta čakajúcich rezervácií a žiadostí o prístup.
- Detail žiadosti a akcie **Schváliť** / **Zamietnuť** s dôvodom zamietnutia, ak je požadovaný.
- Filtre podľa stavu, dátumu a zdroja, informatívne upozornenia na kolíziu či zmenu dostupnosti.
- Žiadna operácia sa nesmie považovať za úspešnú pred úspešnou odpoveďou backendu.

### Administrátor

- UI zoznamu a formulárov na správu miestností a vybavenia (názov, opis, typ, kapacita, počet kusov, stav, obrázok — dostupné polia podľa API).
- UI na prehľad a priradenie používateľských rolí, až keď backend sprístupní príslušné operácie.
- Obsahová administrácia pôvodného portálu: **nevytváraj nové CMS bez objednávky**; rešpektuj existujúce alebo budúce API a hranice projektu.
- Potvrdzovacie dialógy pri deštruktívnych úkonoch, zrozumiteľné chyby a zachovanie rozpracovaného formulára.

## 11. UX, vizuálna identita, prístupnosť

- Dizajn moderný, konzistentný, vhodný na univerzitný portál; vychádza z existujúceho vizuálu, ale ide o redesign.
- Orientačná paleta z analýzy: tyrkysová `#0D8EAF`, zelená `#52AF7C`, žltá `#EAE307`, tmavomodrá `#0A192D`; písmo Inter. **Ak je dodaný aktuálny dizajnový manuál alebo remaster loga, má prednosť.** Nevyužívaj nekonzistentnú fialovú pre „Študenti“ len preto, že bola na starom webe.
- Mobile-first aspoň pre mobilnú šírku 375 px, tablet 800 px a desktop. Bez horizontálneho scrollu, čitateľné formuláre a ovládateľné kalendáre.
- Sémantické HTML, vhodné nadpisy, alt texty, kontrasty, focus stavy, ovládanie klávesnicou, `aria-label` pri ikonových ovládacích prvkoch, **„Preskočiť na obsah“**, textová indikácia validačných chýb. Cieľ WCAG 2.2 AA v rámci rozumného rozsahu komponentov.
- Stavy loading / empty / error / unauthorized / no availability pre každú relevantnú obrazovku.
- Žiadne nadmerné animácie spôsobujúce prázdne bloky; rešpektovať `prefers-reduced-motion`, ak sa animácie používajú.

## 12. SEO a metadáta — frontendový rozsah

- Jedinečné titulky a meta descriptions pre verejné routy, canonical URL a Open Graph tam, kde to infraštruktúra umožňuje; favicon zo schválených assetov.
- Pripraviť `robots.txt` a `sitemap.xml` pre verejné stránky (dynamické záznamy len ak to podporuje deployment/data source); schémy `Event` iba z validných dát.
- Pre vyhľadávateľnosť verejného obsahu preferovať **SSR/prerender**, pokiaľ ho existujúci Angular projekt a deployment podporuje. **Nedoplň SSR bez overenia projektu a zodpovednosti nasadenia.** Ak nie je podporované, zdokumentuj obmedzenie indexácie CSR.
- Slugy generovať korektným prepisom slovenskej diakritiky, napr. `správy` → `spravy`, nie vymazaním znakov. Zachovať redirecty na pôvodné odkazy, keď sú známe.

## 13. Frontendová integrácia, modely a chybové stavy

- Aktuálne potvrdené **len ako existujúce verejné API starého webu**: `GET /api/public/projects`, `GET /api/public/events`, `GET /api/public/partners` (pred použitím prever schémy). Verejné aktuality, príležitosti, zdroje, rezervácie, prístup a administrácia nemajú v analýze potvrdený kontrakt.
- Navrhni jasné hranice dát: verejný obsah, katalóg zdrojov, dostupnosť, vlastné rezervácie, schvaľovanie, prístupové žiadosti a prihlasený používateľ.
- Pri chýbajúcom API používaj development-only mock provider, ktorý sa dá nahradiť API adapterom bez prestavby komponentov. Mockované dáta označ v lokálnom prostredí, nikdy ich potichu neodosielaj ako reálne.
- Chyby HTTP zobrazovať cez centralizované spracovanie, s lokalizovanými, zrozumiteľnými hláseniami. Zachovať vstupné údaje pri zlyhaní.
- Nepredpokladaj, že backend bude posielať serverový čas v lokálnom pásme. Over kontrakt pre UTC a formát časových údajov. **Neimplementuj databázovú kontrolu kolízií na frontende** — môžeš pridať predbežnú UX validáciu, ale rozhoduje API.

### Zmluva, ktorú treba získať od backend tímu

Zaznamenaj v `docs/backend-contract-todo.md` minimálne:

- OpenAPI/Swagger alebo presné endpointy, schémy request/response a enumy.
- Autentifikácia, session/token refresh, roly, oprávnenia a 401/403 správanie.
- Katalóg miestností/vybavenia, počet kusov, kapacity, fotografie a dostupnosť.
- Rezervácie: časy, UTC, vytvorenie, prehľad, zrušenie, schvaľovanie, zamietnutie, konfliktné odpovede a business pravidlá.
- Žiadosti o prístup: typy, formulárové polia, stavy, rozhodnutia, dôvody.
- Kalendár/ICS feed URL a prístupnosť verejného vs. súkromného feedu.
- Administrácia zdrojov a rolí, notifikačné možnosti, stránkovanie/filtrovanie, chyby.
- CORS/proxy a konfigurácia pre vývoj, test a produkciu.

## 14. Etapy implementácie a priority

### P0 — Funkčný základ

- [ ] Preskúmanie repo, overenie použitého Angular stacku a aplikovanie prílohy A.
- [ ] App shell, layout, navigácia, mobile menu, routing, guardy, error/empty/loading obrazovky.
- [ ] Verejné stránky a ich zodpovedajúce detailné routy; projekty/podujatia/partneri cez existujúce verejné API, ak je dostupné.
- [ ] Sekcia Priestory a vybavenie + prehľad obsadenosti.
- [ ] Študentský rezervačný formulár a Moje rezervácie, s jasne oddelenou dátovou vrstvou (API alebo lokálny demo režim).
- [ ] Žiadosti o prístup, stav žiadostí.
- [ ] Správcovská fronta a rozhodovacie UI.

### P1 — Dokončenie funkcií a kvality

- [ ] Administrácia zdrojov/rolí podľa dostupného API.
- [ ] UX opravy pôvodného webu: budúce podujatia, korektné dátumy, odkazy, normalizované slugy, žiadne produkčné testovacie záznamy.
- [ ] Responzivita, prístupnosť, metadata/SEO podľa infraštruktúry.
- [ ] ICS odber, keď je feed dostupný.
- [ ] Testy, dokumentácia a build/lint overenie.

### Out of scope bez ďalšieho potvrdenia

- Backend, databáza, spracovanie kolízií na úrovni DB, serverové notifikácie.
- Obojsmerná Google Calendar / Outlook / Microsoft Graph synchronizácia.
- Vlastná registrácia/SSO implementácia a správa hesiel.
- Úplné nové CMS, automatický import/scraping cudzích médií, anglický obsah.
- Nasadenie, DNS, zmeny na produkčnom webe a opravy dát **na existujúcom serveri**.

## 15. Akceptačné kritériá

1. Angular aplikácia sa spustí a build prejde podľa skriptov repo. Nie sú zavedené standalone komponenty ani inline šablóny.
2. Všetky verejné sekcie a navigácia fungujú na desktop aj mobilnom zobrazení 375 px; odkazy nevedú na neúmyselné 404.
3. Návštevník môže prechádzať zdroje a vidieť obsadenosť bez citlivých údajov. Pri nedostupnom API sa pravdivo zobrazuje nedostupnosť, nie fiktívne živé dáta.
4. Študent má funkčný UX flow pre vytvorenie rezervácie, zobrazenie vlastných rezervácií a žiadosť o prístup; v demo móde sa dajú scenáre otestovať, no demo je explicitne označené.
5. Správca vidí frontu žiadostí, vie otvoriť detail a vykonať schválenie/zamietnutie cez integračnú vrstvu; pri zlyhaní zostáva UI konzistentné.
6. Formulár zabráni zjavne neplatným časom; konflikt vrátený serverom sa zrozumiteľne vysvetlí, údaje formulára zostanú zachované.
7. Všetky časové údaje sú čitateľné v Europe/Bratislava, 24-hodinovo; prechod na letný/zimný čas je pokrytý testami.
8. Guardy a roly ovládajú viditeľnosť a prístupnosť UI; dokumentácia vysvetľuje, že bezpečnosť vynucuje backend.
9. Testované sú aspoň validátory časov, stavové transformácie/reducers/selectors, permission policy a základné kritické UI scenáre podľa testovacieho stacku repozitára.
10. `docs/backend-contract-todo.md` obsahuje všetky blokujúce neznáme kontrakty. Dokumentácia transparentne odlišuje skutočné API od demo mockov a pomenúva nedokončené integrácie.
11. Nie sú hardcoded credentials, produkčné mocky ani falošné success hlásenia; dodržaná prístupnosť základných ovládacích prvkov.

## 16. Požadovaný postup Codex agenta

1. Zmapuj existujúci repo (`README`, `package.json`, `angular.json`, routing, state, API klient, UI knižnica, lint, testy).
2. V `docs/implementation-plan.md` zaznamenaj stručnú mapu feature modulov, routy, integračné hranice a prípadné neznáme predpoklady. **Nemeň backend.**
3. Implementuj jednotlivé frontendové feature moduly v poradí P0 → P1. Pri absencii backend kontraktu používaj izolovaný demo provider iba pre vývoj a zachovaj jasnú možnosť prepnutia na API.
4. Priebežne overuj TypeScript, template check a relevantné unit testy.
5. Na konci spusti štandardné skripty repo (build, lint, test, prípadne e2e), oprav zistené chyby, a ak niečo nie je možné spustiť, presne uveď dôvod.
6. Odovzdaj súhrn: hotové obrazovky, pripojené API, demo funkcionality, blokujúce backendové kontrakty, overené testy a známe obmedzenia.

---

# Príloha A — Záväzné Angular Agent Instructions od zadávateľa

Nasledujúci text je priložený bez obsahového prepísania, aby agent mal implementačné pravidlá dostupné v jedinom súbore. Pri konflikte s odporúčaniami v tomto briefe platia konkrétne technické pravidlá z tejto prílohy; hranica **frontend-only** zostáva záväzná.

````
# Angular Agent Instructions

This document contains reusable conventions for Angular applications built with classic `NgModule` architecture. Adapt version-specific details to the Angular, TypeScript, RxJS, NgRx, testing, and UI-library versions used by the repository.

## Project Context

- Read the repository documentation, `package.json`, Angular configuration, lint configuration, and existing feature implementations before making changes.
- Use classic Angular modules (`NgModule`) and components with separate templates.
- Standalone components are not part of this architecture. Do not introduce them without an explicit, application-wide migration requirement.
- Prefer existing scripts for development, building, linting, and testing.
- When a reference project is available, use it as a guide for module structure, routing, state management, UI components, API configuration, and internationalization patterns. Do not copy domain-specific behavior blindly.

## Recommended Repository Structure

Use the existing structure when it differs. A conventional structure for a larger Angular application is:

```text
src/
  app/
    core/                 # Singleton services, interceptors, guards, and core modules
    modules/              # Functional or routed feature areas
      feature-name/
        view/             # Container and presentation components
        store/
          actions/
          effects/
          reducers/
          selectors/
        feature-routing.module.ts
        feature.module.ts
    shared/               # Reusable components, directives, pipes, and shared modules
    store/                # State shared by the whole application
    data/                 # Shared definitions, enums, and translation keys
    config/               # Menu, layout, validation, and application configuration
  assets/
    i18n/                 # Translation files
```

A typical feature module should follow this model:

```text
feature-name/
  view/
    list/
      feature-list.component.ts
      feature-list.component.html
    detail/
      feature-detail.component.ts
      feature-detail.component.html
  store/
    actions/
      feature.actions.ts
    effects/
      feature.effects.ts
    reducers/
      feature.reducer.ts
    selectors/
      feature.selectors.ts
  feature-routing.module.ts
  feature.module.ts
```

- Declare feature components in the owning feature module.
- Import shared UI, pipe, directive, and form modules through the application's shared-module boundary.
- Keep route definitions in the feature routing module and lazy-load the feature from its parent routing configuration.
- Do not declare feature components in the application shell or parent navigation module.

- Keep state owned by a single feature inside that feature.
- Keep only genuinely global or cross-feature state in the root store.
- Lazy-load routed feature areas where practical.
- A routing or layout shell should load feature modules and should not declare their components directly.
- When routes change, preserve legacy URLs with redirects if backward compatibility is required.

## Module and Feature Design

- Keep actions, effects, reducers, selectors, routing, and views close to the feature that owns them.
- Register feature state with `StoreModule.forFeature(...)` and feature effects with `EffectsModule.forFeature(...)` at the common module boundary that owns them.
- If multiple lazy-loaded modules use the same feature store, register it once in their shared parent module. Do not register the same feature state repeatedly.
- Create small route-specific container components when the same presentation component must load data from different endpoints or contexts.
- Choose an endpoint explicitly in the owning container. A reusable child component must not infer backend behavior by inspecting `ActivatedRoute`, the current URL, or route metadata.

## UI and Component Rules

- Use the UI component library already selected by the application consistently. Do not mix in another design system without an explicit requirement.
- Prefer library-provided layout, navigation, card, button, modal, table, form, spinner, and validation components over custom replacements.
- Follow one naming convention for modals across component names, folders, selectors, and files. External library API names are exempt from application naming rules.
- Each component must have its own `.html` template. Do not use inline templates.
- Add a component `.scss` file and `styleUrls` only when the component has specific styles.
- Avoid calling component methods or getters from template bindings, conditions, and interpolation because Angular reevaluates them during change detection.
- Precompute displayed values in observables, selectors, view models, or pure pipes. Event handlers such as `(click)="save()"` are acceptable.

## Validation Messages

- Render validation errors through the form or UI library's validation API rather than duplicating manual error blocks below each field.
- Register only application-specific validation messages locally. Use library defaults for standard validators such as `required`, `min`, `max`, `minlength`, `maxlength`, and `pattern` unless the product explicitly requires different wording.
- Keep the validation-message service a singleton and import library modules and services through their public entry points to avoid inconsistent dependency-injection instances.
- When adding a custom validator, add its localized message for every supported language.
- Display the first relevant active error once; do not render the same validation message through two mechanisms.

## Reactive Forms

- Centralize `FormGroup` creation in a form factory or another designated service when this is the repository convention. Components should receive or request configured forms rather than duplicating controls and validation rules.
- Do not repeatedly extract the same nested form object. Expose it through a non-private getter with an explicit return type and type assertion.
- A getter named `formGroup` needs no suffix. Otherwise use `FC` for `FormControl`, `FG` for `FormGroup`, and `FA` for `FormArray`.

```typescript
get validFromFC(): FormControl {
  return this.formGroup.get('validFrom') as FormControl;
}

get detailFG(): FormGroup {
  return this.formGroup.get('detail') as FormGroup;
}

get assignmentsFA(): FormArray {
  return this.formGroup.get('assignments') as FormArray;
}
```

- These getters are intended for component logic, not repeated template evaluation.

## Observable and Subscription Rules

- Do not call `.subscribe()` in components, store `Subscription` instances, or add `onDestroy$` and `takeUntil` solely to manage component subscriptions.
- Expose streams as observable properties and activate them with the `async` pipe. The template then owns subscription disposal.
- A deliberately empty template binding is acceptable when a template-owned stream exists only to trigger a necessary UI update.

```typescript
language$: Observable<void>;

this.language$ = this.languageService.currentLanguage$.pipe(
  map(() => this.setColumnDefinitions())
);
```

```html
<ng-container *ngIf="language$ | async"></ng-container>
```

- When several independent observables do not require ordered activation, group them into one template-local object.

```html
<ng-container *ngIf="{first: first$ | async, second: second$ | async} as values">
  <!-- Verify required nullable properties with an inner condition. -->
</ng-container>
```

- The object in this pattern is truthy even when its properties are `null`. Keep nested async conditions only when sequential creation or truthiness is part of the required behavior.
- Do not use `map(() => void 0)` merely to discard an emitted value or force `Observable<void>`. Preserve the original type when a stream orchestrates work through `tap`.
- Use `Observable<void>` only when the mapped operation itself returns `void`, such as rebuilding column definitions.
- Treat `valueChanges` and `statusChanges` the same way: expose the stream whenever the input form changes and activate it with `async` rather than manually replacing subscriptions.

```typescript
formChanges$: Observable<void>;

@Input()
set formGroup(formGroup: FormGroup) {
  this._formGroup = formGroup;
  this.formChanges$ = formGroup.valueChanges.pipe(
    map(() => this.syncDataSource())
  );
}
```

- Apply the same pattern to modal close streams: transform the close result, expose it as an observable, and bind it with `async`.
- Services may subscribe when they own an imperative external operation with no template owner.

## NgRx and Data Loading

- Use effects for backend calls and side effects.
- Components must not call generated API services directly. Dispatch feature actions, handle requests in effects, store results in reducers, and expose data through selectors.
- Reducers must be pure and must never mutate state.
- Keep selectors single-purpose: one state input and one selected value.
- Keep independent selector outputs as separate observable properties and bind each where it is used. Avoid composed selectors that return large view-model objects only for template convenience.
- When one observable must react to a primary value and read the latest values from other selectors, select them separately and use `withLatestFrom` in that orchestration stream.
- Do not inject the NgRx `Actions` stream into a component to observe a success action and dispatch a follow-up load.
- For a successful delete, include the deleted entity ID in the success action and update the collection and total count in the reducer. Existing selectors will update the component.
- A component owns orchestration of dependent data required by its view. If one selected entity determines another load, expose a template-activated observable using `tap` to dispatch the dependent action.
- Keep effects linear: a load action performs its API call and emits only its matching success or failure action. Do not create effect chains in which a load success automatically starts unrelated or view-specific loading.

## Reusable List Components

- Separate only behavior that truly differs between contexts.
- If all usages share the same feature store, filters, paging, sorting, and navigation, keep selectors and action dispatches in the reusable child component.
- Do not mechanically expose matching `@Input`/`@Output` pairs that every parent handles identically.
- If different routes load the same list from different endpoints, use simple route-specific containers. Each container dispatches its explicit load action and passes the resulting data into the reusable child through a data input.
- Use `@Output` only when a parent responds differently or owns a dependency the child should not know, such as opening a feature-specific modal.

## API Types, Enums, and Errors

- Prefer types generated by the application's API client. Do not create local interfaces that merely duplicate API response types.
- Introduce an application-specific model only for genuinely different domain data or an unavoidable transformation.
- Compare generated API enum values through the exported enum object, never through raw string literals.

```typescript
if (entity.status === EntityStatus.Active) {
  // ...
}
```

- Resolve backend errors centrally. Map stable backend error codes to localized messages and provide explicit fallback messages for other HTTP statuses.
- If error codes contain parameters, define and document a stable wire format and replace translation placeholders in their original order.
- Preserve entered data after request failures and show a localized, actionable error.

## Create and Update Flows

- Keep the user on the current form, modal, or wizard step until the backend confirms a successful create operation and returns the created entity.
- Navigate away only after the success response.
- On an HTTP error or missing response body, dispatch a failure action, display the error, and preserve the entered data.
- Derive edit, save, delete, and read-only permissions through a feature policy service when access depends on entity state. Avoid duplicating raw status comparisons across components, routes, lists, and resolvers.
- Load existing entities through feature actions, effects, and selectors. Components and resolvers should not bypass the state-management boundary by calling generated API services directly.

## Dates and Time Zones

- Know which date adapter the selected date-picker uses.
- For date-only API values such as `YYYY-MM-DD`, convert and serialize with explicit date semantics.
- If the application uses UTC date adapters, construct dates with UTC parts and serialize using UTC parts.
- Do not blindly convert local midnight with `toISOString()`, because the time-zone offset can shift a date by one day.

## Backend, Proxy, and Authentication

- Use the repository's development command when it starts Angular with a proxy configuration.
- Route local browser API requests through the frontend origin and development proxy unless the backend explicitly supports the required CORS configuration.
- Configure path rewriting when the public frontend API prefix differs from the backend's local paths.
- Keep service base URLs in environment or runtime configuration. Do not hard-code local backend URLs in components or generated-client consumers.
- Import the module that registers authentication interceptors; exporting it from another module alone does not instantiate its providers.
- Verify protected requests contain the expected authorization header.
- Distinguish Angular development-server and live-reload traffic from backend API calls during debugging.

## Coding Rules

- Follow KISS: optimize for clarity to a reader who did not write the code, not for the fewest lines.
- Follow YAGNI: do not add functionality that is not currently required.
- Follow DRY without premature abstraction. Keep code simple enough that meaningful duplication is visible before extracting shared behavior.
- Do not duplicate string literals. Keep repeated component-specific values in a local readonly constant or object. Put values shared across the application, or values representing business terminology, in a central data file.
- Do not use nested ternary expressions. Split complex conditions into `if`/`else`, a helper function, or clearly named variables.
- Follow the repository's existing formatting, linting, naming, and indentation rules.
- Write new source comments and project documentation in the language selected by the repository.
- Keep comments focused on intent, constraints, and non-obvious tradeoffs. Do not narrate straightforward code.

## Testing

- Follow the testing scope defined by the repository or the relevant feature specification.
- Prioritize automated tests for services and pure application logic such as pipes, validators, policy services, reducers, selectors, and isolated utilities.
- Add component, template, integration, and end-to-end tests when the specification or risk of the behavior requires them.
- When required coverage is unclear, document the expected behavior in the relevant specification before adding a new test category.
- Run the smallest relevant test suite while developing, then run the repository's required verification commands before declaring the work complete.

````