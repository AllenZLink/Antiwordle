import fs from "node:fs/promises";
import path from "node:path";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const outDir = path.resolve("www.antiwordle.com");
const contentDir = path.resolve("src/content");
const pagesDir = path.join(contentDir, "pages");
const pageOrder = ["home", "about", "contact", "terms", "privacy", "changeLog", "sitemap"];

const site = JSON.parse(await fs.readFile(path.join(contentDir, "site.json"), "utf8"));
const pageEntries = await Promise.all(
  pageOrder.map(async (key) => {
    const page = JSON.parse(await fs.readFile(path.join(pagesDir, `${key}.json`), "utf8"));
    return [key, page];
  })
);
const pages = Object.fromEntries(pageEntries);
const manifest = JSON.parse(await fs.readFile(path.join(outDir, ".vite/manifest.json"), "utf8"));
const entry = manifest["index.html"];

if (!entry) {
  throw new Error("Could not find index.html entry in Vite manifest.");
}

const gameScript = `/${entry.file}`;
const cssFiles = entry.css?.map((file) => `/${file}`) ?? [];

function e(type, props, ...children) {
  return React.createElement(type, props, ...children);
}

function absoluteUrl(routePath) {
  const base = site.baseUrl.replace(/\/$/, "");
  return routePath === "/" ? `${base}/` : `${base}${routePath}`;
}

function displayDate(value) {
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC"
  }).format(new Date(`${value}T00:00:00Z`));
}

function Header() {
  return e(
    "header",
    { className: "site-header" },
    e(
      "div",
      { className: "site-inner" },
      e(
        "nav",
        { className: "site-nav", "aria-label": "Main navigation" },
        e("a", { className: "site-brand", href: "/", title: "Go to Antiwordle home" }, site.name),
        e(
          "div",
          { className: "site-links" },
          ...(site.headerNavigation ?? site.navigation).map((item) =>
            e("a", { key: item.href, href: item.href, title: item.title }, item.label)
          )
        ),
        e(
          "details",
          { className: "mobile-nav" },
          e(
            "summary",
            { className: "mobile-nav-toggle", "aria-label": "Open navigation" },
            e("span", null),
            e("span", null),
            e("span", null)
          ),
          e(
            "div",
            { className: "mobile-nav-panel" },
            ...(site.headerNavigation ?? site.navigation).map((item) =>
              e("a", { key: item.href, href: item.href, title: item.title }, item.label)
            )
          )
        )
      )
    )
  );
}

function Footer() {
  return e(
    "footer",
    { className: "site-footer" },
    e(
      "div",
      { className: "site-inner footer-grid" },
      e(
        "div",
        { className: "footer-copy" },
        e("p", null, site.footer.tagline)
      ),
      e(
        "div",
        { className: "footer-links" },
        ...site.navigation.map((item) =>
          e("a", { key: item.href, href: item.href, title: item.title }, item.label)
        )
      ),
      e("p", { className: "copyright" }, site.footer.copyright)
    )
  );
}

function Layout({ page, children }) {
  return e(
    "div",
    { className: "site-shell" },
    e(Header),
    e("main", { className: "site-main" }, children),
    e(Footer)
  );
}

function ContentSections({ sections }) {
  return e(
    React.Fragment,
    null,
    ...sections.map((section) =>
      e(
        "section",
        { key: section.title, className: "content-block" },
        e("h2", null, section.title),
        section.examples?.length
          ? e(SteppedContent, { section })
          : section.body.map((paragraph, index) => e("p", { key: index }, paragraph))
      )
    )
  );
}

function SteppedContent({ section }) {
  return e(
    "div",
    { className: "content-steps" },
    ...section.body.map((paragraph, index) =>
      e(
        "div",
        { key: paragraph, className: "content-step" },
        e("p", null, paragraph),
        section.examples[index] && e(ExampleTiles, { example: section.examples[index] })
      )
    )
  );
}

function ExampleTiles({ example }) {
  return e(
    "div",
    { className: "tile-example" },
    e("p", { className: "tile-example-label" }, example.label),
    e(
      "div",
      { className: "tile-example-row", "aria-label": example.label },
      ...example.tiles.map((tile, index) =>
        e(
          "span",
          { key: `${tile.letter}-${index}`, className: `example-tile ${tile.status}` },
          tile.letter
        )
      )
    )
  );
}

function HomePage() {
  const page = pages.home;

  return e(
    Layout,
    { page },
    e("div", { id: "root" }),
    e(
      "div",
      { className: "site-inner content-section" },
      e(ContentSections, { sections: page.sections }),
      e(
        "section",
        { className: "faq-section" },
        e("h2", null, page.faq.title),
        ...page.faq.items.map((item) =>
          e(
            "div",
            { key: item.question, className: "faq-item" },
            e("h3", null, item.question),
            e("p", null, item.answer)
          )
        )
      )
    )
  );
}

function ContentPage({ page }) {
  return e(
    Layout,
    { page },
    e(
      "div",
      { className: "site-inner page-content" },
      e("h1", { className: "page-title" }, page.heading),
      e(ContentSections, { sections: page.sections })
    )
  );
}

function ChangeLogPage() {
  const page = pages.changeLog;

  return e(
    Layout,
    { page },
    e(
      "div",
      { className: "site-inner page-content" },
      e("h1", { className: "page-title" }, page.heading),
      ...page.entries.map((entry) =>
        e(
          "article",
          { key: `${entry.date}-${entry.version}`, className: "change-log-entry" },
          e(
            "div",
            { className: "change-log-meta" },
            e("time", { dateTime: entry.date }, displayDate(entry.date)),
            e("span", null, `Version ${entry.version}`)
          ),
          e("h2", null, entry.title),
          e("ul", null, ...entry.items.map((item) => e("li", { key: item }, item)))
        )
      )
    )
  );
}

function SitemapPage() {
  const page = pages.sitemap;

  return e(
    Layout,
    { page },
    e(
      "div",
      { className: "site-inner page-content" },
      e("h1", { className: "page-title" }, page.heading),
      e("p", { className: "page-intro" }, page.intro),
      e(
        "ul",
        { className: "sitemap-list" },
        ...site.navigation.map((item) =>
          e(
            "li",
            { key: item.href },
            e("a", { href: item.href, title: item.title }, item.label)
          )
        )
      )
    )
  );
}

function pageComponent(key) {
  if (key === "home") return e(HomePage);
  if (key === "changeLog") return e(ChangeLogPage);
  if (key === "sitemap") return e(SitemapPage);
  return e(ContentPage, { page: pages[key] });
}

function htmlDocument({ page, body, includeGameScript }) {
  const canonical = page.canonical ?? absoluteUrl(page.path);
  const styles = cssFiles.map((file) => `<link rel="stylesheet" crossorigin href="${file}">`).join("\n    ");
  const script = includeGameScript ? `\n    <script type="module" crossorigin src="${gameScript}"></script>` : "";
  const jsonLd = buildJsonLd(page)
    .map(
      (schema) =>
        `<script type="application/ld+json">${JSON.stringify(schema).replaceAll("<", "\\u003c")}</script>`
    )
    .join("\n    ");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(page.meta.title)}</title>
    <meta name="description" content="${escapeHtml(page.meta.description)}">
    <meta name="date" content="${escapeHtml(page.updatedAt)}">
    <meta property="article:modified_time" content="${escapeHtml(page.updatedAt)}">
    <link rel="icon" href="/favicon.ico" sizes="any">
    <link rel="icon" href="/icon.svg" type="image/svg+xml">
    <link rel="manifest" href="/manifest.webmanifest">
    <link rel="canonical" href="${canonical}">
    <meta property="og:title" content="${escapeHtml(page.meta.title)}">
    <meta property="og:type" content="website">
    <meta property="og:description" content="${escapeHtml(page.meta.description)}">
    <meta property="og:url" content="${canonical}">
    <meta name="twitter:card" content="summary">
    ${jsonLd}
    ${styles}${script}
  </head>
  <body>
    ${body}
  </body>
</html>
`;
}

function buildJsonLd(page) {
  const canonical = page.canonical ?? absoluteUrl(page.path);
  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${canonical}#webpage`,
      "url": canonical,
      "name": page.meta.title,
      "headline": page.hero?.title ?? page.heading ?? page.meta.title,
      "description": page.meta.description,
      "dateModified": page.updatedAt,
      "isPartOf": {
        "@type": "WebSite",
        "name": site.name,
        "url": site.baseUrl
      },
      "breadcrumb": {
        "@id": `${canonical}#breadcrumb`
      },
      "mainEntity": page.faq?.items?.length ? { "@id": `${canonical}#faq` } : undefined
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "@id": `${canonical}#breadcrumb`,
      "itemListElement": page.breadcrumbs.map((crumb, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": crumb.name,
        "item": crumb.item
      }))
    }
  ];

  if (page.faq?.items?.length) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "@id": `${canonical}#faq`,
      "url": canonical,
      "dateModified": page.updatedAt,
      "mainEntity": page.faq.items.map((item) => ({
        "@type": "Question",
        "name": item.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": item.answer
        }
      }))
    });
  }

  return schemas.map(removeUndefined);
}

function removeUndefined(value) {
  if (Array.isArray(value)) return value.map(removeUndefined);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, entryValue]) => entryValue !== undefined)
        .map(([key, entryValue]) => [key, removeUndefined(entryValue)])
    );
  }
  return value;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

async function writePage(key) {
  const page = pages[key];
  const body = renderToStaticMarkup(pageComponent(key));
  const html = htmlDocument({ page, body, includeGameScript: key === "home" });
  const pageDir = page.path === "/" ? outDir : path.join(outDir, page.path);

  await fs.mkdir(pageDir, { recursive: true });
  await fs.writeFile(path.join(pageDir, "index.html"), html);
}

function sitemapXml() {
  const urls = Object.values(pages).map((page) => {
    return `  <url>
    <loc>${page.canonical ?? absoluteUrl(page.path)}</loc>
    <lastmod>${page.updatedAt}</lastmod>
  </url>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>
`;
}

await Promise.all(Object.keys(pages).map(writePage));
await fs.writeFile(path.join(outDir, "robots.txt"), `${site.robots.rules.join("\n")}\n`);
await fs.writeFile(path.join(outDir, "sitemap.xml"), sitemapXml());
await fs.rm(path.join(outDir, ".vite"), { recursive: true, force: true });

console.log(`Generated ${Object.keys(pages).length} static pages, robots.txt, and sitemap.xml.`);
