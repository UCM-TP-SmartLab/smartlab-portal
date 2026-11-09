# Ako pracujeme s gitom

Do `dev` sa nedá pushovať priamo, GitHub to odmietne. Každú zmenu robte na vlastnej vetve a do `dev` ju dostanete cez Pull Request, ktorý musí niekto z tímu schváliť. Do `main` pridávam veci ja, takže PR do `main` neotvárajte.

## Jednorazové nastavenie

Stačí spustiť raz na svojom počítači:

```bash
git config --global push.autoSetupRemote true
git config --global fetch.prune true
```

Potom stačí obyčajný `git push` a git si sám uprace vetvy, ktoré už na GitHube nie sú.

Na vytváranie a mergeovanie PR z terminálu používam GitHub CLI (`gh`). Ak ho nemáte, dá sa to isté spraviť aj na stránke GitHubu.

## Postup pri každej úlohe

**1. Nová vetva z aktuálneho dev**

```bash
git fetch
git switch -c feature/nazov-ulohy origin/dev
```

Namiesto `nazov-ulohy` dajte niečo, z čoho je jasné, na čom robíte, napr. `feature/login`. Lokálny `dev` nepotrebujete, vetvu robte vždy rovno z `origin/dev`.

**2. Práca a commit**

```bash
git add .
git commit -m "Popis zmeny"
git push
```

**3. Pull Request do dev**

```bash
gh pr create --base dev --fill
```

Bez `gh`: na GitHube kliknite na „Compare & pull request“ a skontrolujte, že base je `dev`. Vpravo v Reviewers vyberte niekoho z tímu.

**4. Opravy po review**

Keď treba niečo upraviť, spravte ďalší commit a `git push` na tú istú vetvu. Pridá sa to do toho istého PR. Po každom pushi musí reviewer PR schváliť znova.

**5. Merge po schválení**

```bash
gh pr merge --squash --delete-branch
```

PR sa zmergeuje ako jeden commit, vetva sa zmaže na GitHube aj u vás a prepne vás späť na `dev`. Bez `gh`: v PR kliknite na „Squash and merge“.

Na ďalšiu úlohu začnite znova od kroku 1. Na starej vetve nepokračujte.

**Auto-merge (nemusíte čakať na schválenie)**

V repe je zapnutý auto-merge. Hneď po vytvorení PR môžete spustiť:

```bash
gh pr merge --squash --auto
```

PR sa potom zmergeuje sám, keď ho niekto schváli. Schválenie je stále povinné, auto-merge ho neobchádza. Bez `gh`: v PR kliknite na „Enable auto-merge“.

Lokálnu vetvu si v tomto prípade treba zmazať sami. Keď začnete ďalšiu úlohu (krok 1), starú vetvu zmažte:

```bash
git branch -D feature/nazov-ulohy
```

## Ak ste omylom commitli do dev

Push do `dev` vám neprejde, ale commit u vás zostal. Presuňte ho na novú vetvu:

```bash
git switch -c feature/nazov-ulohy
git push
gh pr create --base dev --fill
```

A potom vráťte lokálny `dev` do stavu GitHubu:

```bash
git switch dev
git reset --hard origin/dev
git switch feature/nazov-ulohy
```

`git reset --hard` spúšťajte až keď je commit na novej vetve, inak o neho prídete.

## Pravidlá repa

- `dev` je predvolená vetva. Zmeny len cez PR, treba 1 schválenie od niekoho iného, merge len ako squash. Nedá sa zmazať ani force-pushnúť.
- `main` mením iba ja cez PR z `dev`.
