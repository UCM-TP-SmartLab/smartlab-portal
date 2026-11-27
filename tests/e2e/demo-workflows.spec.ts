import { test, expect, Page } from "@playwright/test";
const origin = "http://127.0.0.1:4201";
async function student(page: Page) {
  await page.goto(`${origin}/prihlasenie`);
  await page.getByRole("button", { name: "Pokračovať ako Študent" }).click();
}
async function booking(page: Page, purpose: string) {
  await page.getByRole("link", { name: "Nová rezervácia ↗" }).click();
  await page
    .getByRole("combobox", { name: "Miestnosť alebo vybavenie" })
    .click();
  await page.getByRole("option", { name: "Demo tvorivé laboratórium" }).click();
  await page.getByLabel("Dátum", { exact: true }).fill("2026-12-15");
  await page.getByLabel("Začiatok", { exact: true }).fill("12:00");
  await page.getByLabel("Koniec", { exact: true }).fill("13:00");
  await page.getByLabel("Účel rezervácie").fill(purpose);
  await page.getByRole("button", { name: "Skontrolovať rezerváciu" }).click();
  await page.getByRole("button", { name: "Vytvoriť rezerváciu" }).click();
}
test("vytvorenie, konflikt a správcovské rozhodnutie v jednej relácii", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await student(page);
  await booking(page, "Prvý projekt");
  await expect(page.getByText("Rezervácia bola vytvorená.")).toBeVisible();
  await page.getByRole("link", { name: "Moje rezervácie →" }).click();
  await booking(page, "Druhý projekt");
  await expect(
    page.getByText("Vybraný termín je už obsadený.", { exact: false }),
  ).toBeVisible();
  await expect(page.getByLabel("Účel rezervácie")).toHaveValue("Druhý projekt");
  await page
    .getByRole("link", { name: "Administrácia", exact: true })
    .first()
    .click();
  await page.getByRole("button", { name: "Pokračovať ako Správca" }).click();
  await page.getByRole("link", { name: "Prvý projekt" }).click();
  await page.getByRole("button", { name: "Potvrdiť rozhodnutie" }).click();
  await page.getByRole("button", { name: "Potvrdiť", exact: true }).click();
  await expect(page.getByText("Rozhodnutie bolo uložené.")).toBeVisible();
  expect(errors).toEqual([]);
});
test("študent neprejde do správy a obnovenie vymaže reláciu", async ({
  page,
}) => {
  await student(page);
  await page.evaluate(() => {
    history.pushState({}, "", "/administracia");
    window.dispatchEvent(new PopStateEvent("popstate"));
  });
  await expect(
    page.getByRole("heading", { name: "Nemáte oprávnenie", exact: true }),
  ).toBeVisible();
  await expect(page).toHaveURL(/administracia\/prihlasenie/);
  await page.reload();
  await expect(page.getByText("Rola: Návštevník")).toBeVisible();
});
test("žiadosti o prístup zachovajú účel a zobrazia stav", async ({ page }) => {
  await student(page);
  await page
    .getByRole("link", { name: "Žiadosti o prístup", exact: true })
    .click();
  await page.getByLabel("Účel prístupu").fill("Práca na prototypovaní");
  await page.getByRole("button", { name: "Vytvoriť žiadosť" }).click();
  await expect(page.getByText("Žiadosť bola vytvorená.")).toBeVisible();
  await expect(
    page.getByText("Čaká na schválenie", { exact: true }),
  ).toBeVisible();
});
test("demo obsah má slovenské titulky, detaily a bezpečný návrat", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const sections = [
    ["aktuality", "Aktuality"],
    ["projekty", "Projekty"],
    ["podujatia", "Podujatia"],
    ["partneri", "Partneri"],
    ["prilezitosti-pre-studentov", "Príležitosti pre študentov"],
  ];
  for (const [path, title] of sections) {
    await page.goto(`${origin}/${path}`);
    await expect(page.locator("h1")).toHaveText(title);
    await page.getByRole("link", { name: "Zistiť viac ↗" }).first().click();
    await expect(page.getByText("Ukážkový obsah")).toBeVisible();
    await expect(page.getByRole("link", { name: `← ${title}` })).toBeVisible();
  }
  expect(errors).toEqual([]);
});
test("rezervačný formulár sa zmestí na mobil a prázdny účel sa neodošle", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 900 });
  await student(page);
  await page.getByRole("link", { name: "Nová rezervácia ↗" }).click();
  await page.getByRole("button", { name: "Skontrolovať rezerváciu" }).click();
  await expect(page.getByText("Vyberte zdroj.", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Vytvoriť rezerváciu" }),
  ).toHaveCount(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
