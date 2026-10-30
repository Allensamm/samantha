# Samantha Bender — Multimedia Journalist

A complete editorial redesign of Samantha Bender’s portfolio: warm ivory, burgundy, expressive serif typography, original photography, an arched portrait, and responsive layouts. This is a custom static website with a premium Squarespace-inspired design; it is not a native Squarespace template or an installation inside a Squarespace account.

## Run locally

Requires Node.js 22 or newer; validated with Node.js 24.19.0. There are no third-party application or build dependencies.

```sh
npm ci
npm run dev
```

Run these commands in the repository root. The development server uses port 3000, rebuilds after edits to `src`, `content`, or `public`, and prints readiness to the terminal. Refresh the browser after an edit. Override the port with `PORT=3001 npm run dev`.

```sh
npm run build
npm test
npm start
```

The build writes complete HTML pages into `dist/`; `npm start` serves that existing build. Deploy `dist/` on a static host with directory-index support, such as Netlify, Cloudflare Pages, or Vercel. Build command: `npm run build`; output directory: `dist`. No database, runtime secrets, or external font service is required. Paths assume deployment at a domain root.

## Content and page coverage

- All **15 main pages** and **32 article pages** from the public Wix sitemap are preserved.
- New Work, About, and Contact pages organize the same portfolio content.
- Cleaner project URLs coexist with all original page slugs. The site generates **57 HTML routes**, plus a custom 404 page.
- All articles render their original body content in HTML and support search and Reporting/Opinion filters.
- The résumé includes the more recent source résumé image, WKBN role, education, awards, skills, notable coverage, print view, and original document. Earlier home-page experience and education remain under About → earlier experience.
- The complete original magazine PDF and a travel photograph are bundled locally.
- YouTube players load on request using the privacy-enhanced domain. The podcast retains its SoundCloud embed and direct link.
- The contact form validates input and opens a populated email draft. **It does not submit to a server or send mail itself.** The visitor reviews and sends using their email application.

See `content/source-inventory.json` for all source URLs, `content/site.json` for migrated content, and `content/unavailable-source-media.json` for source-host failures observed during migration on October 30, 2026.

## Source limitations

Several original Wix photos and all five Wix-hosted news videos returned HTTP 403. The original text, pages, source links, and available posters are retained. Unavailable videos display an explicit archive notice instead of a broken player; unavailable article photos use designed typographic covers. The portrait is displayed through a CSS crop of the original résumé image. The YouTube and SoundCloud sources are retained, but remote playback could not be verified from the execution network. Publication dates and “Current” résumé labels are preserved from their source era, not asserted as current employment in 2026.

The primary contact address comes from the newer résumé (`samanthabendertv@gmail.com`); the older school address remains on Contact for completeness. Connected third-party projects and social profiles are external destinations, not copied websites.

## Edit the design

- `scripts/build.mjs`: reusable HTML layouts and page generation.
- `src/style.css`: design tokens, desktop/mobile layouts, print stylesheet, reduced-motion handling.
- `src/app.js`: menu, filtering, search, share, player activation, print, and email-draft interactions.
- `content/site.json`: article bodies, project descriptions, image references, original media URLs.
- `public/assets/`: local photography, original résumé, magazine PDF, fonts, and font licenses.

The font files use the SIL Open Font License; licenses are included under `public/assets/licenses`. Original portfolio writing and media remain the property of their respective owners.

## Verification

`npm test` checks all 47 original pages, all 32 article bodies, every local navigation and asset reference, preserved résumé and document content, and explicit unavailable-video notices. Browser validation additionally visited all 57 routes at desktop and mobile sizes and exercised navigation, search, empty states, filters, and video activation. External video playback and mail delivery are not claimed by these checks.

## Squarespace implementation

The visual system can be recreated with Squarespace 7.1 Fluid Engine sections: ivory page background, Playfair Display headings, DM Sans body, burgundy buttons, summary blocks for stories, portfolio collections for projects, and a blog collection for the 32 articles. The HTML/Node source is intended for independent static hosting; importing it does not create native editable Squarespace pages. Building inside Squarespace requires access to a Squarespace site and a separate content migration.

For the optional full Chromium and accessibility audit, install tooling outside the checkout and run the saved audit while `npm start` serves the build in another terminal:

```sh
npm install --prefix /tmp/samantha-browser playwright @axe-core/playwright
BROWSER_TOOLS_ROOT=/tmp/samantha-browser/node_modules BASE_URL=http://127.0.0.1:3000 node scripts/browser-check.cjs
```

The audit expects Chromium at `/usr/bin/chromium`, visits all routes at 1440px and 390px widths, checks interactions, and audits ten representative pages with axe-core. It blocks outbound browser requests to keep the check local, so it deliberately does not test external playback. Reports and screenshots are written to the ignored `browser-artifacts/` directory.
