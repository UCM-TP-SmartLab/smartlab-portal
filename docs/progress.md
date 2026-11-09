# Realizačný denník — docs/implementation-plan.md

## Rozhodnutia

- Pracujeme v aktuálnom adresári na vetve dev podľa schváleného vykonania priamo v relácii; používateľské súbory nemeníme ani necommitujeme.
- Statický hosting doručuje HTML/JS/CSS; zákaz serverových požiadaviek znamená žiadne runtime API ani externé assety, nie zákaz doručenia samotného webu.
- Produkcia nemá schválené obsahové dáta okrem zadania a identity: zoznamy majú pravdivý prázdny stav. Demo je oddelené build konfiguráciou.
- Pre-flight: public/resource providers vlastnia dáta, workspace store vlastní rezervácie/prístup/frontu raz; management číta tú istú kolekciu. Session zostáva globálna. Signatúry nadväzujú bez konfliktu.
- Balíčky sa inštalujú cez npm; sandbox nemá sieťový prístup, povolené npm operácie preto používajú eskalovaný sieťový prístup.

## Priebeh

- Úloha 1: dokončená — Angular NgModule shell, Material, lokálne fonty, statický prerender; build a kontrola HTML prešli.
- Úloha 2: dokončená — oddelený produkčný/demo provider, centrálne chyby, policy, guardy; 6 provider/policy testov prešlo po počiatočnom zlyhaní chýbajúcich implementácií.
- Úloha 3: dokončená — verejné lazy features a detaily, safe links a slug utility; slovenské titulky a detaily overené aj prehliadačom.
- Úloha 4: dokončená — kalendár podujatí, katalóg, detail s dennou obsadenosťou a samostatný prehľad intervalov; bez osobných údajov a bez predstierania živej dostupnosti.
- Úloha 5: dokončená — form factory, DST/interval validátory, zhrnutie a asynchrónny demo výsledok; form test najskôr zlyhal na chýbajúcej implementácii, potom prešiel.
- Úloha 6: dokončená — vlastné rezervácie, filtre/detail/história/zrušenie; prístupové žiadosti. Konflikt aj zachovanie formulára overené v E2E.
- Úloha 7: dokončená — fronta, detail a rozhodnutie s dôvodom, admin prehľady. Rozhodnutie overené v rovnakej demo relácii.
- Úloha 8: dokončená — metadata, podmienený sitemap podľa skutočnej domény, robots, dokumentácia, 29 unit a 13 E2E testov, lint/build/check:static prešli.
- Záverečná kontrola: dokončené nezávislé read-only review podľa executing-plans/requesting-code-review. Dôležité nálezy opravené s RED → GREEN dôkazom: prázdne dokončenie operácie vytvára failure a odblokuje UI; dátumový filter aj kalendár používajú Bratislava kalendárny deň. Navyše null výsledok a súčasné dvojité podanie pokrývajú effect testy.
- Menšie nálezy: zjednotené duplicitné šablóny do čisto prezentačného komponentu s vlastnou HTML šablónou a feature kontajnermi; 404 náhľad opravený po prehliadačovom RED → GREEN teste bez JS. Žiadne odložené nálezy.
- Final review: mimo rozsahu ostáva skutočná backendová autorizácia, business pravidlá, SSO, potvrdený obsah, doména a nastavenie hostingu — podľa schválenej statickej špecifikácie ich nepredstierame a uvádzame v integračnom zozname.
- Súbory ponechané v aktuálnej vetve dev bez commitu, pushu alebo nasadenia. Používateľské zmeny v AGENTS.md a zadaní zachované.

## Spresnenia počas implementácie

- Spoločný typovaný `PortalProvider` má oddelené metódy pre všetky dátové oblasti namiesto viacerých injection tokenov. Výber produkcie/dema je jediná build-time hranica; budúce API adaptéry možno zložiť za touto fasádou.
- Verejné feature moduly zdieľajú factory reduktora/effects a základ kontajnera; endpoint/kind vyberá výslovne vlastník modulu, nie prezentačný komponent podľa URL.
- Bez potvrdeného API sú admin zdroje/roly iba demo prehľad, nie vymyslený CRUD. Backendové operácie sú dokumentované ako nedostupné.
- `outputMode: static` ignoruje staršie CLI prerender nastavenie. Parametre detailov preto určuje server route konfigurácia podľa lokálneho datasetu, súkromné routy sú client-only. Nasadenie naďalej tvorí iba browser výstup.
- Npm balíčky s @angular/platform-browser-dynamic a animations používame pre kompatibilný NgModule bootstrap; deprekačné upozornenia pri inštalácii neznamenajú neúspešný build.
- Prvé utility testy boli vytvorené pred dokončením npm inštalácie; prvý pokus sa nedostal k testom pre chýbajúci runner. Ich úspech bol potom potvrdený, no tento prvý pokus nie je dôkazom RED fázy utility testov.
