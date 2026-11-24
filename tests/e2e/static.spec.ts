import { test, expect } from "@playwright/test";
const origin = "http://127.0.0.1:4300";
test("verejný obsah má HTML bez JavaScriptu", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  for (const [path, title] of [
    ["domov", "Veľké nápady."],
    ["kontakt", "Kontakt"],
    ["projekty", "Projekty"],
    ["obsadenost", "Obsadenosť"],
  ]) {
    await page.goto(`${origin}/${path}`);
    await expect(page.locator("h1")).toContainText(title);
  }
  await context.close();
});
test("produkcia volá iba existujúce API a nedá sa prepnúť na demo", async ({
  page,
}) => {
  const forbidden: string[] = [];
  const errors: string[] = [];
  const apiCalls: string[] = [];
  await page.route("**/api/spaces", (route) =>
    route.fulfill({
      json: { data: { message: "Zoznam priestorov SmartLab" } },
    }),
  );
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("request", (r) => {
    if (
      (["fetch", "xhr"].includes(r.resourceType()) &&
        new URL(r.url()).pathname !== "/api/spaces") ||
      new URL(r.url()).origin !== origin
    )
      forbidden.push(r.url());
  });
  page.on("request", (request) => {
    if (new URL(request.url()).pathname === "/api/spaces")
      apiCalls.push(request.url());
  });
  await page.addInitScript(() => {
    localStorage.setItem("role", "admin");
    localStorage.setItem("demo", "true");
  });
  await page.goto(`${origin}/domov?demo=true`);
  for (const path of [
    "aktuality",
    "projekty",
    "podujatia",
    "partneri",
    "prilezitosti-pre-studentov",
    "priestory-a-vybavenie",
    "obsadenost",
    "prihlasenie",
    "administracia/prihlasenie",
  ]) {
    await page.locator(`a[href="/${path}"]`).first().click();
    await expect(page.locator("h1")).toBeVisible();
  }
  await expect(
    page.getByText("Prihlásenie zatiaľ nie je dostupné"),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Pokračovať ako/ }),
  ).toHaveCount(0);
  expect(forbidden).toEqual([]);
  expect(apiCalls.length).toBeGreaterThan(0);
  expect(errors).toEqual([]);
});
test("detail priestoru volá PHP trasu a nezobrazuje testovaciu správu ako dáta", async ({
  page,
}) => {
  let called = false;
  await page.route("**/api/spaces/1", (route) => {
    called = true;
    return route.fulfill({
      json: { data: { id: "1", message: "Detail priestoru SmartLab" } },
    });
  });
  await page.goto(`${origin}/priestory-a-vybavenie/1`);
  await expect(
    page.getByText("Backend zatiaľ vracia iba testovaciu odpoveď.", {
      exact: false,
    }),
  ).toBeVisible();
  expect(called).toBe(true);
});
test("neznámy detail zobrazuje pravdivý stav", async ({ page }) => {
  await page.goto(`${origin}/projekty/neexistuje`);
  await expect(
    page
      .getByRole("heading", { name: "Záznam sa nenašiel", exact: true })
      .first(),
  ).toBeVisible();
});
test("neznáma verejná cesta má čitateľnú 404 aj bez JavaScriptu", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  const response = await page.goto(`${origin}/neznama-stranka`);
  expect(response?.status()).toBe(404);
  await expect(page.locator("h1")).toHaveText(
    "Táto cesta zatiaľ nikam nevedie.",
  );
  await context.close();
});
for (const width of [375, 800, 1440])
  test(`layout bez pretekania pri ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of ["domov", "podujatia", "obsadenost", "kontakt"]) {
      await page.goto(`${origin}/${route}`);
      await expect(page.locator("h1")).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
    }
  });
test("mobilné menu má názov, stav a dá sa ovládať klávesnicou", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto(`${origin}/domov`);
  const toggle = page.getByRole("button", { name: "Menu ☰" });
  await toggle.focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("button", { name: "Zavrieť menu" }),
  ).toHaveAttribute("aria-expanded", "true");
  await page
    .getByRole("navigation", { name: "Hlavná navigácia" })
    .getByRole("link", { name: "Kontakt", exact: true })
    .click();
  await expect(page.locator("h1")).toHaveText("Kontakt");
});
