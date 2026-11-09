# Otvorené integračné kontrakty

Táto verzia je statická: za behu neposiela API požiadavky. Žiadny endpoint nie je
pripojený. Nasledujúce body sú podklady pre budúcu integráciu, nie implementované
backendové operácie. Zapnutie integrácie vyžaduje aj zmenu požiadavky na nulové
runtime API požiadavky.

| Oblasť | Čo treba potvrdiť | Súčasné správanie |
| --- | --- | --- |
| Verejný obsah | OpenAPI, schémy, schválené články/projekty/podujatia/partneri/ponuky, autorstvo a práva na médiá | Lokálny dataset, produkčné zoznamy bez dodaných záznamov sú prázdne |
| Staré verejné API | `/api/public/projects`, `/api/public/events`, `/api/public/partners`: pôvod, schémy, prístup a CORS | Zámerne nevolané podľa požiadavky na statickú aplikáciu; schémy nie sú overené |
| Prihlásenie | Mechanizmus identity providera, session/token/refresh/logout, 401/403, CSRF podľa zvoleného mechanizmu | Produkčne nedostupné; demo volí iba pracovnú UI rolu, bez hesla |
| Roly | Skutočné enumy, používateľské ID, mapovanie oprávnení a serverové vynucovanie | `UiRole` je predbežný enum; guardy sú iba UX |
| Zdroje | Katalóg, ID, druhy, opisy, kapacity, počty kusov, stav, potvrdené fotografie a vybavenie | Produkčný katalóg prázdny; demo má syntetickú miestnosť a tlačiareň |
| Dostupnosť | Rozsah a granularita, verejná redakcia osobných údajov, blokujúce stavy, množstvá, serverový čas | Produkčne explicitne nedostupná; demo intervaly neobsahujú osobné údaje |
| Rezervácie | Request/response, požadované polia, UTC ISO 8601, identifikátory, stavové enumy, história, paging/filtre | Predbežné frontendové typy a pamäťový demo provider |
| Pravidlá času | Maximálna dĺžka, predstih, prevádzkové hodiny, povolené dni, práca s dvojznačnými časmi | Žiadne vymyslené limity; demo kontroluje platný interval, celé kladné množstvo a DST |
| Kolízie | Atomické serverové overenie, HTTP status (409 nie je potvrdený), kódy a parametre chýb | Iba predbežná demo detekcia prekrytia. Demo pri vybavení konzervatívne blokuje celý zdroj, nerozdeľuje kapacitu |
| Zrušenie a rozhodnutia | Povolené prechody, vlastníctvo, prípadné termíny, dôvod zamietnutia, idempotencia | Demo potvrdí výsledok providerom pred zmenou store; bez optimistických zmien |
| Prístup do labu | Význam prístupu, typy, trvanie, povinné polia, stavy a rozhodnutia | Demo obsahuje iba účel, nie skutočné prístupové práva |
| Správa zdrojov a rolí | CRUD, validácia, nahrávanie obrázkov, priraďovanie rolí, oprávnenia | Iba demo prehľady, žiadne fiktívne produkčné zápisy ani nové CMS |
| Chyby | Stabilné kódy, poradie parametrov a formát placeholderov, mapovanie HTTP statusov | Centralizované slovenské správy pre predbežné lokálne kódy; HTTP mapovanie nemožno potvrdiť |
| ICS | Feed URL, verejný/súkromný prístup, autorizácia, únik údajov a aktualizačná frekvencia | Odber nedostupný, bez synchronizácie Google/Outlook |
| Notifikácie | In-app dáta, unread stav, email/Teams zodpovednosť | Žiadne odosielanie, iba lokálne stavové hlásenia |
| Prostredia | API base URL, proxy/path rewrite, CORS, autentifikačné hlavičky a deployment zodpovednosť | Žiadny HTTP klient ani interceptor; doplnia sa až s potvrdeným mechanizmom |
| Obsah a SEO | Skutočná doména, existujúce detailné URL, kontakty, šesť krokov vstupu, galérie | Doména v `site.config.json` je null; canonical/sitemap nevymýšľame |

Frontendové názvy `Frontend*`, `UiRole`, `UiRequestStatus` a chybové kódy
nie sú backendové schémy. Budúci adaptér ich má mapovať na generované API typy,
nie nútiť backend preberať pracovný frontendový kontrakt.

Demo pracuje iba v pamäti prehliadača v jednej relácii. Po obnovení sa záznamy
aj rola resetujú. Neexistuje zdieľanie medzi používateľmi, audit, zaručenie
kolízií, skutočná autorizácia ani doručenie žiadosti.
