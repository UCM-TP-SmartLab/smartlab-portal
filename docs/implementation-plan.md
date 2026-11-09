# SmartLab Static Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Alternatíva pri explicitnom výbere používateľa: superpowers:subagent-driven-development.

**Goal:** Vytvoriť staticky generovaný Angular portál podľa zadania s nulovými runtime API požiadavkami a oddeleným lokálnym demom.

**Architecture:** NgModule aplikácia s lazy-loaded features, NgRx actions/effects/reducers/selectors a Reactive Forms. Verejný obsah je importovaný lokálny dataset; produkčný provider odmieta nepodporované operácie. Prerender prebehne pri builde, nasadzuje sa iba statický browser výstup.

**Tech Stack:** Angular, TypeScript, RxJS, NgRx, Angular Material, SCSS, lokálny Manrope, kompatibilný unit runner a Playwright pre kritické UI a sieťové kontroly. Verzie sa zvolia podľa oficiálnej kompatibility s Node 24.22.1 a zaznamenajú v lockfile.

**Spec:** [Schválená špecifikácia](superpowers/specs/2026-11-09-smartlab-static-design.md)

**Stav:** Implementácia dokončená. Skutočný priebeh, spresnenia a záverečné opravy sú v [realizačnom denníku](progress.md), výsledky v [overení](verification.md). Pôvodné kroky nižšie zostávajú plánom; denník zaznamenáva ich realizáciu a odchýlky.

## Global Constraints

- Klasické `NgModule`, komponenty s vlastnými HTML šablónami, žiadne standalone komponenty.
- Jediná UI knižnica Angular Material, prispôsobená dodanej identite.
- Žiadne komponentové `subscribe()`, priame volania integračných adaptérov ani template gettery.
- Nasadzuje sa iba výstup pre prehliadač; nesmie byť potrebný Node proces ani runtime SSR handler.
- Produkčný build nesmie umožniť zapnutie dema pomocou URL, prehliadačového úložiska alebo prepínača.
- Žiadne Google Fonts, mapové iframe, analytika, vzdialené obrázky, API polling alebo automatické požiadavky na externé služby.
- Časové okamihy sa zobrazujú v `Europe/Bratislava` v 24-hodinovom formáte.
- Grafit `#3d3935`, zelená `#72c593`, tmavozelená `#3e6b4a`, žltá `#ebd34b`; schválené logá bez úprav.
- Zmeny používateľa v `AGENTS.md` a zadaní sa zachovajú. Bez backendu, hesiel, OAuth, CMS a produkčného nasadenia.
- Implementácia a dokumentácia sú po slovensky. Stav demo relácie sa po obnovení stránky resetuje.

## Review Focus

1. Priamy vstup na detail a neznámy slug nesmú zobraziť nesprávny obsah ani vyžadovať aplikačný server; kontrola v úlohách 3 a 8.
2. Produkcia s `?demo=true` a podvrhnutou rolou v localStorage musí zostať bez demo funkcií; kontrola v úlohách 2 a 8.
3. Jarný neexistujúci a jesenný dvojznačný miestny čas sa nesmie potichu previesť na iný okamih; kontrola v úlohe 5.
4. Zamietnutá operácia, opakovaný klik a chýbajúca odpoveď nesmú zmeniť kolekciu ani zmazať formulár; kontrola v úlohách 5 až 7.
5. Prázdny dataset a nedostupná obsadenosť nesmú znamenať voľný zdroj, aktívnu registráciu ani fiktívny kontakt; kontrola v úlohách 3, 4 a 8.

## Mapa súborov a rozhraní

- `src/app/core/`: `core.module.ts`, `data/portal-provider.ts`, `data/production-portal.provider.ts`, `data/demo-portal.provider.ts`, `auth/role.guard.ts`, `auth/permission-policy.service.ts`, `errors/portal-error.service.ts`, `seo/seo.service.ts`.
- `src/app/data/`: `frontend.models.ts`, `public-content.ts`, `routes.ts`, `ui-text.sk.ts`. Modely nesú prefix `Frontend`, pracovné enumy prefix `Ui`.
- `src/app/config/`: `portal.config.ts`, `navigation.ts`; `src/environments/`: produkčný a demo výber providerov cez build file replacements.
- `src/app/shared/`: `shared.module.ts`, stavové panely, potvrdenie akcie, validačné správy, pipes pre dátumy a spoločné karty/kalendár.
- `src/app/modules/<feature>/`: `<feature>.module.ts`, `<feature>-routing.module.ts`, `view/<screen>/<screen>.component.ts` a `.html`, voliteľne `.scss`; `store/actions`, `effects`, `reducers`, `selectors`.
- `src/app/store/session/`: jediná zdieľaná demo relácia. Zdieľané workflow dáta vlastní spoločný lazy parent `workspace` pre rezervácie, prístup a management; jeho store sa registruje raz.
- `src/assets/brand/`, `src/assets/fonts/`: schválené logá, favicon, lokálny font a licencia.
- `scripts/`: generovanie zoznamu prerender ciest, sitemap a kontrola statického výstupu.
- `tests/e2e/`: produkčné sieťové a demo workflow scenáre.

Predbežné modely: `FrontendResource`, `FrontendReservation`, `FrontendAccessRequest`,
`FrontendAvailabilityInterval`, `FrontendContentEntry`, `FrontendSession`,
`FrontendReservationDraft`, `FrontendAccessDraft`, `FrontendDecision`.
`UiRole`: `visitor`, `student`, `manager`, `admin`. `UiRequestStatus`: `pending`,
`approved`, `rejected`, `cancelled`. Ide iba o frontend terminológiu.

Provider používa RxJS `Observable<T>`; chyby majú tvar
`FrontendOperationError { code: UiErrorCode; messageKey: string }`.
Základné kódy: `unavailable`, `conflict`, `forbidden`, `invalid-response`.
Nepredstavujú kontrakt HTTP servera.

## Úloha 1: Spustiteľný statický základ a shell

**Files:** `package.json`, lockfile, `angular.json`, `tsconfig*.json`, lint konfigurácia, `src/main*.ts`, `src/app/app*.ts`, `src/app/app.component.html`, `src/styles.scss`, core/shared moduly, konfigurácia, lokálne assety, `scripts/check-static-output.mjs`.

**Interfaces:** Vytvorí `PortalConfig { demo: boolean; timeZone: 'Europe/Bratislava'; siteOrigin: string | null }`, token `PORTAL_CONFIG`, export `PUBLIC_ROUTES: readonly string[]`. Root store a effects inicializované raz.

- [ ] Overiť oficiálnu kompatibilitu Angular/NgRx/Material/TypeScript a Node; zvoliť jednu kompatibilnú sadu, zapísať verzie a vytvoriť lockfile.
- [ ] Pridať build, demo, lint a test skripty, strict template checking a konfiguráciu prerender bez runtime SSR nasadenia.
- [ ] Pridať kontrolu statického výstupu, ktorá zatiaľ zlyhá, ak `/domov/index.html` neobsahuje nadpis SmartLab a tri CTA bez spúšťania JavaScriptu.
- [ ] Implementovať shell, lokálny Manrope/licenciu, SVG logá, skip link, navigáciu, mobilné menu, footer a 404. Načítanie ikon nesmie používať externý font.
- [ ] Spustiť `npm run build`, `npm run check:static`, `npm run lint`; požadovaný výsledok: úspech a HTML pre `/domov`.

## Úloha 2: Dátové hranice, demo a oprávnenia

**Files:** core data/auth/errors, `data/frontend.models.ts`, `data/public-content.ts`, session actions/reducer/selectors, príslušné `.spec.ts`, `docs/backend-contract-todo.md`.

**Interfaces:** `PublicContentProvider.list(kind: UiContentKind): Observable<readonly FrontendContentEntry[]>`; `ResourceProvider.list(): Observable<readonly FrontendResource[]>`; `AvailabilityProvider.list(resourceId: string, date: string): Observable<readonly FrontendAvailabilityInterval[]>`. `SessionProvider.current(): Observable<FrontendSession>`. `PermissionPolicyService.canAccess(role: UiRole, area: UiArea): boolean` a `canCancel(session: FrontendSession, reservation: FrontendReservation): boolean`.

- [ ] Napísať testy `productionRejectsWrites`, `productionIgnoresBrowserRole`, `visitorCannotAccessWorkspace`, `managerCannotAssignRoles`, `studentCannotCancelOthersReservation`; overiť počiatočné zlyhanie.
- [ ] Definovať frontendové modely a injection tokeny providerov. Produkcia vracia iba potvrdený obsah, chýbajúce dáta odlišuje od chyby/nedostupnosti a všetky zápisy odmieta.
- [ ] Implementovať demo provider vybraný iba build konfiguráciou, syntetické záznamy a lokálnu reláciu v pamäti. Produkčný dependency graph neimportuje demo fixtures.
- [ ] Implementovať guardy, policy a centrálne slovenské chyby; dokumentovať všetky chýbajúce kontrakty vrátane vypnutých pôvodných API a budúceho proxy/auth.
- [ ] Spustiť `npm test -- --watch=false` a lint; uvedené policy/provider testy musia prejsť.

## Úloha 3: Verejné stránky, zoznamy a detaily

**Files:** moduly `public`, `news`, `projects`, `partners`, `student-opportunities`, ich routing/views/store; `shared/utils/slug.ts`, `external-url.ts`, tests.

**Interfaces:** Používa `PublicContentProvider.list`. Vytvorí `toSlug(value: string): string`, `normalizeHttpsUrl(value: string): string | null` a `isPublishableOpportunity(entry: FrontendContentEntry): boolean`. Jednoúčelové selectors vracajú kolekciu, loading a error samostatne.

- [ ] Napísať testy: `toSlug('Správy zo školy') === 'spravy-zo-skoly'`; HTTPS doména je prijatá; `javascript:`, `data:`, neplatný host a HTTP sú odmietnuté; názov ` Test ` sa nepublikuje. Overiť zlyhanie.
- [ ] Implementovať utility a feature actions/effects/reducers/selectors; effects vykonávajú iba operáciu patriacu k akcii.
- [ ] Implementovať domov, O SmartLabe, kontakt s Hlavná 5, Trnava; bez vymysleného e-mailu, telefónu, hodín či návodu. Pridať tri CTA a štyri piliere zo zadania.
- [ ] Implementovať zoznamy, dostupné filtre, detaily a breadcrumbs. Neznámy slug vracia stav nenájdené; produkčný nedodaný obsah má empty state, demo obsah jasnú značku.
- [ ] Overiť unit testy a build; pridať všetky známe verejné cesty a dátové detaily do generovaného prerender zoznamu.

## Úloha 4: Podujatia, zdroje a obsadenosť

**Files:** moduly `events`, `resources`, `availability`, ich store/views/routing, `shared/calendar/`, utility a testy.

**Interfaces:** `isUpcomingEvent(entry: FrontendContentEntry, now: Date): boolean`; `buildMonthDays(year: number, month: number): readonly FrontendCalendarDay[]`. Availability používa samostatný provider a zobrazuje iba intervaly/stavy bez údajov žiadateľa.

- [ ] Napísať testy ukončenej/aktuálnej/budúcej akcie, prázdneho mesiaca, neplatného registračného linku a chýbajúcej dostupnosti; posledná nesmie viesť k stavu „voľné“. Overiť zlyhanie.
- [ ] Implementovať podujatia, filtre dostupných dát, mesačný kalendár a detail. Ukončené akcie nemajú registračné CTA; úvodný výber má iba relevantné akcie.
- [ ] Implementovať katalóg miestností/vybavenia a detail s predvýberom zdroja v rezervácii. Nedodané kapacity, počty a fotografie majú pravdivé zástupné texty.
- [ ] Implementovať oddelenú obsadenosť s výberom zdroja/dátumu, navigáciou, legendou a textovou alternatívou. ICS bez schváleného feedu je označené ako nedostupné.
- [ ] Spustiť unit testy, lint a build; overiť, že verejný kalendár neobsahuje osobné údaje demo študentov.

## Úloha 5: Rezervačný formulár a časové pravidlá

**Files:** `shared/utils/bratislava-time.ts`, testy; workspace parent module/store; reservation form factory, validator, policy, create view a booking effects.

**Interfaces:** `resolveBratislavaTime(date: string, time: string): FrontendTimeResolution`, discriminated union `valid` s UTC ISO alebo `nonexistent`/`ambiguous`/`invalid`; `ReservationFormFactory.create(resourceId?: string): FormGroup`; `ReservationProvider.create(draft: FrontendReservationDraft): Observable<FrontendReservation>`; `listMine(): Observable<readonly FrontendReservation[]>`; `cancel(id: string): Observable<FrontendReservation>`.

- [ ] Napísať a spustiť zlyhávajúce testy: Bratislava `2026-03-29 02:30` je `nonexistent`, `2026-10-25 02:30` je `ambiguous`, `2026-07-15 12:00` je `2026-07-15T10:00:00.000Z`, `2026-01-15 12:00` je `2026-01-15T11:00:00.000Z`; množstvo 0 a koniec pred/rovný začiatku sú neplatné.
- [ ] Implementovať časové utility bez závislosti na lokálnom pásme počítača. Dvojznačnú hodinu vyžiadať zmeniť; date-only dátum neposúvať UTC konverziou.
- [ ] Implementovať form factory, Material validation API, predvýber zdroja, zhrnutie pred odoslaním a zachovanie formulára pri chybe.
- [ ] Napísať tests pre reducer/effect: dvojklik vytvorí jednu operáciu, konflikt nemení zoznam, prázdna odpoveď vytvorí failure a úspech pridá až vrátený záznam. Overiť zlyhanie a následne implementovať pomocou `exhaustMap` a odpovedí providera.
- [ ] Spustiť relevantné unit testy, lint a build. Demo musí hlásiť lokálne vytvorenie, produkcia iba nedostupnosť.

## Úloha 6: Vlastné rezervácie a žiadosti o prístup

**Files:** reservations list/detail views/store; access-requests views, form factory a store; workspace store registrácia zostáva jediná.

**Interfaces:** Používa reservation provider z úlohy 5. `AccessRequestProvider.listMine(): Observable<readonly FrontendAccessRequest[]>`; `create(draft: FrontendAccessDraft): Observable<FrontendAccessRequest>`; `AccessFormFactory.create(): FormGroup`.

- [ ] Napísať testy filtrácie vlastných záznamov, cancellation failure bez zmeny stavu, zachovania dôvodu zamietnutia a neznámeho ID; overiť zlyhanie.
- [ ] Implementovať zoznam/detail rezervácií, filtre dátumu/zdroja/stavu, históriu dostupných zmien a potvrdzovací dialóg zrušenia. Policy riadi dostupné akcie.
- [ ] Implementovať formulár prístupu s demo označenými predbežnými poľami, zhrnutím, zoznamom stavov a dôvodom zamietnutia. Nevytvárať reálne prístupové oprávnenia.
- [ ] Aktivovať modal close a formulárové streams cez template `async`, bez subscribe v komponentoch.
- [ ] Spustiť unit testy, lint a build; overiť, že pri chybe zostáva zadaný formulár a pri obnovení sa demo relácia resetuje.

## Úloha 7: Správcovská fronta a administrácia

**Files:** management module/routing/fronta/detail/resources/roles views, decision form factory, management effects/selectors a testy.

**Interfaces:** `ManagementProvider.listQueue(): Observable<readonly FrontendQueueItem[]>`; `decide(decision: FrontendDecision): Observable<FrontendQueueItem>`. Queue item je označená union rezervácie/prístupu; rozhodnutie obsahuje typ, ID, výsledok a voliteľný dôvod. Čítanie zdrojov a demo rolí cez samostatné provider rozhrania.

- [ ] Napísať testy: zamietnutie bez dôvodu neprejde demo formulárom, provider failure nemení stav, manager nemá role admina a success aktualizuje iba zodpovedajúce ID/typ. Overiť zlyhanie.
- [ ] Implementovať frontu, filtre stavu/dátumu/zdroja, detail a schválenie/zamietnutie. Zmeny sa publikujú až po úspešnej odpovedi demo providera.
- [ ] Implementovať admin prehľad zdrojov a rolí; produkcia má unavailable stav. Nové CRUD a role zápisy nevymýšľať bez kontraktu, podľa schválenej špecifikácie stačí demo prehľad.
- [ ] Pridať loading/error/empty/forbidden stavy a potvrdenia deštruktívnych akcií.
- [ ] Spustiť unit testy, lint a build; overiť oddelený vstup do administrácie a neprístupnosť pre študenta.

## Úloha 8: Statické SEO, UI overenie a odovzdanie

**Files:** SEO service, scripts na prerender routes/sitemap, `robots.txt`, `tests/e2e/static.spec.ts`, `demo-workflows.spec.ts`, `accessibility.spec.ts`, README, backend-contract dokumentácia.

**Interfaces:** `SeoService.update(metadata: FrontendPageMetadata): void`; `siteOrigin` nastavuje build konfigurácia, bez hodnoty sa absolútne canonical/OG/sitemap URL negenerujú. Detailné cesty pochádzajú z rovnakého datasetu ako aplikácia.

- [ ] Napísať Playwright scenáre: priamy verejný detail s vypnutým JS, neznámy slug, produkčný query/localStorage pokus o demo, prechod celou navigáciou s nulovými fetch/XHR a externými asset requests.
- [ ] Pridať UI scenáre vytvorenie demo rezervácie, konflikt so zachovaným formulárom, správca rozhodne o rovnakej žiadosti a študent neprejde do správy. Prehliadačové testy používajú produkčný statický hosting alebo samostatný demo vývojový server, nikdy backend.
- [ ] Implementovať unikátne titulky/descriptions, podmienené canonical/OG/sitemap, noindex súkromných ciest, favicon a statický 404 výstup. Žiadna fiktívna produkčná doména.
- [ ] Overiť 375 px, 800 px a desktop: bez horizontálneho pretekania, klávesnicové menu/dialog, focus, prístupné názvy a stavové texty. Vizuálne prezrieť domov, kalendár a formulár; opraviť nálezy.
- [ ] Spustiť `npm run lint`, `npm test -- --watch=false`, `npm run build`, `npm run check:static`, `npm run test:e2e`. Úspech znamená nulový exit code všetkých vykonateľných kontrol; nevykonateľný krok sa pravdivo zaznamená s dôvodom.
- [ ] Dokončiť README: inštalácia, vývoj/demo, statický build, hosting bez Node, routing/404, aktualizácia lokálneho obsahu, reset dema a chýbajúce integrácie. Odovzdať výsledky testov a presný zoznam hotových obrazoviek.

## Spôsob vykonania a kontrolné body

Odporúčanie: vykonať úlohy postupne v tejto relácii. Feature rozhrania sú navzájom
závislé a oddelení implementátori by zvyšovali režijné náklady. Bez výslovného
výberu delegovania sa subagenti nespúšťajú. Pred implementáciou sa overí stav
git a vhodnosť izolácie; existujúce používateľské zmeny sa nesmú premiestniť
ani zahrnúť do vlastného commitu. Commitovanie alebo zmeny git metadát sa
vykonajú iba v rozsahu oprávnení prostredia; chýbajúci commit neblokuje testy
ani dokončenie súborov.

Po každej úlohe skontrolovať diff a relevantné testy. Nálezy riešiť pred ďalšou
úlohou. Na konci vykonať celkovú kontrolu proti špecifikácii a nevydávať demo
za skutočnú rezerváciu alebo plnú backendovú integráciu.
