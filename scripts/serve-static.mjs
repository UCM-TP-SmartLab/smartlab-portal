// Lokálny náhľad/testovací server; nie je súčasťou nasadenia aplikácie.
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { resolve, extname, sep } from "node:path";
const root = resolve("dist/smartlab/browser");
const port = Number(process.env["PORT"] || 4300);
const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".txt": "text/plain",
  ".xml": "application/xml",
};
createServer((req, res) => {
  try {
    const pathname = decodeURIComponent(
      new URL(req.url || "/", "http://localhost").pathname,
    );
    let file = resolve(root, `.${pathname}`);
    if (file !== root && !file.startsWith(root + sep)) {
      res.writeHead(403).end();
      return;
    }
    if (existsSync(file) && statSync(file).isDirectory())
      file = resolve(file, "index.html");
    const asset = !!extname(pathname);
    const exists = existsSync(file);
    const protectedRoute =
      /^\/(administracia|rezervacie|ziadosti-o-pristup)(\/|$)/.test(pathname);
    if (!exists)
      file = resolve(
        root,
        !asset && protectedRoute ? "index.csr.html" : "404.html",
      );
    if (!existsSync(file)) file = resolve(root, "404.html");
    res.writeHead(exists ? 200 : 404, {
      "Content-Type": mime[extname(file)] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    res.end(readFileSync(file));
  } catch {
    res.writeHead(400).end();
  }
}).listen(port, "127.0.0.1", () =>
  console.log(`Statický náhľad http://127.0.0.1:${port}`),
);
