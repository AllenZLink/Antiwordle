# Antiwordle

This project rebuilds Antiwordle as a static site with a React-powered game island.

You can try [Antiwordle](https://www.antiwordle.net/)
The production architecture is:

- Static HTML pages generated at build time.
- Page copy stored in JSON for easy editing.
- Shared page layout, header, footer, SEO metadata, and content pages rendered with `react-dom/server`.
- The game itself rendered in the browser with React.
- Final output deployable to static hosting such as Cloudflare Pages.

## Current Stack

- Vite
- React
- TypeScript
- React DOM client for the game
- React DOM server for static page generation
- JSON content files for editable page copy
- Plain CSS, preserving the original Antiwordle class names and game layout

## Rendering Model

The site uses a hybrid static model:

1. Static pages are generated during the build.
2. Users receive normal pre-rendered HTML files.
3. Only the game area on the home page is hydrated by React in the browser.

For example, `/about` should resolve to a prebuilt file:

```text
www.antiwordle.net/about/index.html
```

The browser URL can remain:

```text
/about
```

No runtime Node server or SSR service is required after deployment.

## Output Structure

The final build produces:

```text
www.antiwordle.net/
├── index.html
├── about/
│   └── index.html
├── contact-us/
│   └── index.html
├── terms-of-service/
│   └── index.html
├── privacy-policy/
│   └── index.html
├── change-log/
│   └── index.html
├── sitemap/
│   └── index.html
├── sitemap.xml
├── robots.txt
└── assets/
    ├── game-[hash].js
    └── style-[hash].css
```

## Home Page

The home page is special.

It contains:

- Static header and footer.
- Static SEO text generated directly into `index.html`.
- The existing Antiwordle game mounted into:

```html
<div id="root"></div>
```

The game is the only browser-rendered React island. The rest of the home page text, including game description, how-to-play content, comparison with Wordle, and FAQ, should exist directly in the generated HTML.

## Content Source

All editable page copy lives in JSON, including:

- Page title
- Meta description
- Canonical path
- Headings
- Body text
- FAQ questions and answers
- Change log entries
- Footer/navigation copy

Shared site copy lives in:

```text
src/content/site.json
```

Each page has its own JSON file:

```text
src/content/pages/home.json
src/content/pages/about.json
src/content/pages/contact.json
src/content/pages/terms.json
src/content/pages/privacy.json
src/content/pages/changeLog.json
src/content/pages/sitemap.json
```

Each page JSON includes its route, SEO metadata, canonical URL, update date, link title, breadcrumbs, and page-specific body copy. Pages with FAQ content also generate FAQ structured data.

The generated pages are:

- `/` Home
- `/contact-us`
- `/about`
- `/terms-of-service`
- `/privacy-policy`
- `/change-log`
- `/sitemap`
- `/robots.txt`
- `/sitemap.xml`

## Change Log Layout

The change log page is generated from JSON entries grouped by date and version.

Suggested JSON shape:

```json
{
  "date": "2026-05-18",
  "version": "1.0.0",
  "title": "Site rebuild",
  "items": [
    "Rebuilt the game with Vite, React, and TypeScript.",
    "Removed ads and analytics.",
    "Added static content pages."
  ]
}
```

Suggested HTML layout:

```html
<article class="change-log-entry">
  <div class="change-log-meta">
    <time datetime="2026-05-18">May 18, 2026</time>
    <span>Version 1.0.0</span>
  </div>
  <h2>Site rebuild</h2>
  <ul>
    <li>Rebuilt the game with Vite, React, and TypeScript.</li>
  </ul>
</article>
```

## Build Flow

The build flow is:

```text
1. Vite builds the browser game bundle.
2. A Node build script reads JSON content.
3. The script uses react-dom/server to render static pages.
4. The script writes all HTML files, robots.txt, and sitemap.xml.
5. The resulting www.antiwordle.net directory is deployed as static files.
```

Current build script:

```json
{
  "scripts": {
    "build": "tsc -b && vite build && node scripts/build-site.mjs"
  }
}
```

## Local Development

Use this command to view the generated static site, including footer, content pages, JSON-LD, canonical links, robots.txt, and sitemap.xml:

```bash
npm run dev
```

This command builds the site and serves `www.antiwordle.net` with a small local static server. Routes such as `/about`, `/privacy-policy`, and `/change-log` resolve to their generated `index.html` files.

Use this command only when you want Vite's source dev server for the React game island:

```bash
npm run dev:vite
```

`npm run dev:vite` does not run the static page generator, so it is not the right command for checking generated pages or footer content.

## Game Preservation Rules

When adding the static site layer, do not change the existing game behavior.

Preserve:

- Main game DOM hierarchy inside `#root`.
- Original game class names such as `.container`, `.header`, `.title`, `.instructions`, `.guesses`, `.tile`, `.keyboardRow`, `.key`, `.success`, `.toast`, and `.settingsMenu`.
- Button text such as `Play`, `ENTER`, `Share`, and `Hard Mode`.
- Guess grid and keyboard structure.
- Existing localStorage keys and daily word behavior.

Allowed to change:

- Generated React wrapper details.
- Modal portal placement.
- Attribute order.

Do not restore:

- Advertising code.
- Analytics code.
- Third-party captured cache files.

## Deployment

The generated `www.antiwordle.net` directory is deployable to a static CDN.

Recommended deployment target:

- Cloudflare Pages

Because the pages are prebuilt as real files, direct visits such as `/about`, `/privacy-policy`, and `/change-log` should work without a server-side rewrite.
