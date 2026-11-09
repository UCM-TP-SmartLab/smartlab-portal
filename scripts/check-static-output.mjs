import { readFileSync, existsSync } from "node:fs";
import assert from "node:assert/strict";
const root = "dist/smartlab/browser";
const routes = readFileSync("prerender-routes.txt", "utf8")
  .trim()
  .split(/\r?\n/);
for (const route of routes) {
  const html = readFileSync(`${root}${route}/index.html`, "utf8");
  assert.match(html, /<h1[ >]/, `${route}: chýba prerenderovaný nadpis`);
  assert.match(html, /<title>[^<]+<\/title>/);
  assert.doesNotMatch(html, /https:\/\/fonts\.(googleapis|gstatic)\.com/);
}
const home = readFileSync(`${root}/domov/index.html`, "utf8");
for (const text of [
  "SmartLab",
  "Požiadať o prístup",
  "Rezervovať miestnosť",
  "Pozrieť obsadenosť",
])
  assert.ok(home.includes(text), text);
assert.ok(existsSync(`${root}/404.html`));
console.log(
  `Statický výstup: ${routes.length} ciest s HTML, titulkom a obsahom.`,
);
