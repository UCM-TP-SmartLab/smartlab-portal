import { copyFileSync, writeFileSync, readFileSync, readdirSync } from "node:fs";
const root = "dist/smartlab/browser";
// Angular a Material nechávajú v prerenderovanom HTML atribúty selektorov
// (routerlink, mat-flat-button, ng-app-id…), ktoré nie sú platné HTML.
// Aplikácia nepoužíva hydratáciu, prehliadač po načítaní JS vykreslí DOM
// nanovo, takže v statickom HTML ich netreba a W3C validátor ich odmieta.
const frameworkAttributes = new Set([
  "routerlink",
  "routerlinkactive",
  "ariacurrentwhenactive",
  "ng-app-id",
  "ngcm",
  "cdk-overlay-origin",
  "matinput",
  "matformfieldfloatinglabel",
  "matformfieldlineripple",
  "mat-ripple-loader-uninitialized",
  "mat-ripple-loader-class-name",
  "mat-button",
  "mat-flat-button",
  "mat-stroked-button",
  "mat-raised-button",
  "mat-icon-button",
]);
const stripFrameworkAttributes = (html) =>
  html.replace(/<[a-zA-Z][^\s>/]*(?:\s[^>]*)?>/g, (tag) =>
    tag.replace(
      /\s([^\s"'>/=]+)(?:="[^"]*")?(?=[\s/>])/g,
      (attribute, name) =>
        frameworkAttributes.has(name.toLowerCase()) ? "" : attribute,
    ),
  );
for (const file of readdirSync(root, { recursive: true })) {
  if (!String(file).endsWith(".html")) continue;
  const path = `${root}/${file}`;
  writeFileSync(path, stripFrameworkAttributes(readFileSync(path, "utf8")));
}
copyFileSync(`${root}/404/index.html`, `${root}/404.html`);
const config = JSON.parse(readFileSync("site.config.json", "utf8"));
const routes = Object.keys(
  JSON.parse(readFileSync("dist/smartlab/prerendered-routes.json", "utf8"))
    .routes,
).filter(
  (route) =>
    route !== "/" &&
    !/^\/(administracia|rezervacie|ziadosti-o-pristup|prihlasenie|404)(\/|$)/.test(
      route,
    ),
);
let sitemapLine = "";
if (config.origin) {
  const origin = new URL(config.origin);
  if (
    origin.protocol !== "https:" ||
    origin.pathname !== "/" ||
    origin.username ||
    origin.password ||
    origin.search ||
    origin.hash
  )
    throw new Error(
      "site.config.json: origin musí byť čistý HTTPS pôvod bez cesty.",
    );
  const escape = (value) =>
    value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll('"', "&quot;");
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map((route) => `<url><loc>${escape(new URL(route, origin).href)}</loc></url>`).join("")}</urlset>`;
  writeFileSync(`${root}/sitemap.xml`, sitemap);
  sitemapLine = `Sitemap: ${origin.origin}/sitemap.xml\n`;
}
writeFileSync(
  `${root}/robots.txt`,
  `User-agent: *\nAllow: /\nDisallow: /administracia\nDisallow: /rezervacie\nDisallow: /ziadosti-o-pristup\nDisallow: /prihlasenie\n${sitemapLine}`,
);
console.log(
  "Statické HTML a 404 pripravené. Nasadzujte iba dist/smartlab/browser.",
);
