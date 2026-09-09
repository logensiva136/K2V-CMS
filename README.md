# K2V ENTERPRISE — website + CMS mock

A working, deployable mock of a replacement website for
[K2V Enterprise](https://sites.google.com/view/k2venterprise/), a Kulim-based
one-stop supplier of industrial materials, packaging, safety and cleanroom
consumables, office furniture and stationery for factories, schools and offices
across Kulim and Penang.

Built as a static site: no server, no build step, no dependencies. It runs on
GitHub Pages as-is.

- `/` — customer-facing site
- `/category/` — product catalogue
- `/admin/` — content editor (no login on the deployed build — see the security note)

The point of this build is to let the client **click through the real thing and
edit real content** before committing budget to a Wagtail CRX build. The content
model in `data/content.json` is shaped to map onto CRX page types (table below).

---

## Two builds in this repo

**Deployed build (the real deliverable)** — the multi-file site at the repo root.
This is what GitHub Pages serves.

| Path | What it is |
|---|---|
| `index.html` | Public one-page site |
| `category/index.html` | Static product catalogue (nine supply lines) |
| `admin/index.html` | Content editor |
| `assets/site.css`, `assets/site.js` | Public styles + mobile nav / scroll-spy |
| `assets/public-cms.js` | Applies admin edits to the public page on load |
| `assets/admin-dashboard.js`, `assets/admin-dashboard.css` | The editor |

**Standalone build** — `standalone/site.html` and `standalone/admin.html` are an
earlier, self-contained version: a hash-router single-page app with the CSS and
JavaScript inlined into one file each. Double-click either one, or email them to
the client for a demo on a laptop with no internet. They share content with each
other but not with the deployed build. The standalone admin has a **mock** staff
login (`admin` / `k2v2026`).

---

## What the client can edit in `/admin` (deployed build)

| Section | What it edits |
|---|---|
| Overview | Live counts and quick actions |
| Site content | Business name, legal name, tagline, email, phone, registration no., hours, address; hero eyebrow / title / body |
| Products | Add, edit, delete; name, category, published/draft status |
| Categories | The supply lines and their descriptions |
| Services | The "how we work" pillars |
| Command line | A few safe text commands against the local store (`help`, `stats`, `set title …`, `add product …`, `publish all`) |
| Import / export | Download the content as JSON, load one back, reset to seed |

Deleting a category that still has products is left to the editor's judgement in
this build; the real rules (unique product codes, blocked deletes, draft hiding)
arrive with the Wagtail build.

---

## How content is stored

The seed content ships inside the JavaScript:

- Deployed build — seed is inline in `assets/admin-dashboard.js`; saves write to
  `localStorage` under **`k2v_site_content`**.
- Standalone build — seed is `window.K2V_SEED` inline in each HTML file (and
  mirrored in `assets/seed.js` / `assets/store.js`); saves write to
  `localStorage` under **`k2v_cms_content`**.

The two keys are deliberately different so the builds never clobber each other.

Edits are **per browser** — what the client changes on their laptop is not what a
visitor sees. That is the correct behaviour for a mock, and it is the single
thing to be explicit about in the demo. To make an edit permanent:

1. In `/admin` → **Import / export** → **Download JSON**
2. Paste the values into the seed object (`assets/admin-dashboard.js` for the
   deployed build)
3. Commit and push

If `localStorage` is unavailable (private mode, sandboxed preview) the editor
falls back to memory — it still works, it just forgets on reload.

### Placeholder images

Records without an image URL render a generated SVG plate instead of a broken
image. Real photography can be dropped in one record at a time by pasting a URL.

---

## Deploy to GitHub Pages

`.github/workflows/static.yml` deploys the whole repository to GitHub Pages on
every push to `master` (and on demand from the Actions tab). One-time setup:

**Settings → Pages → Source: GitHub Actions.**

First build takes 1–2 minutes. Pages must be **public** — GitHub only serves
Pages from private repos on paid plans. `.nojekyll` is included so Jekyll leaves
the files alone.

The site appears at `https://<you>.github.io/<repo>/`, the catalogue at
`/category/` and the editor at `/admin/`.

To preview locally, open `index.html` directly, or:

```bash
python3 -m http.server 8000
```

---

## Security note — read this before showing the client

The deployed `/admin` has **no authentication**. The page is publicly reachable
and anyone can open it and edit their own browser's copy of the content. On a
static host there is no way around that. The standalone admin's login is
**cosmetic** — the credentials are in the JavaScript.

Do not put anything confidential into this mock, and do not treat the enquiry
inbox as private. Real authentication, roles and audit logging arrive with the
Wagtail build.

---

## Migration path — Wagtail CRX

`data/content.json` is a fuller content model than the deployed editor exposes
(products carry spec tables, categories carry codes and slugs, plus `pages` and
`news`). It is not loaded by the live site — it exists as the initial data load
for the real build.

| `content.json` key | Wagtail CRX |
|---|---|
| `site` | `Website` settings / branding, analytics, social |
| `nav` | `Navbar` snippet |
| `home` | `ArticlePage` (home) using hero, card grid and button blocks |
| `pages[]` | `ArticlePage` children of home |
| `categories[]` | `ArticleIndexPage` (or a product category model) |
| `products[]` | Product page type with a spec table block |
| `news[]` | `ArticlePage` under a `News` index page |
| `enquiries[]` | `FormPage` submissions |

Recommended follow-on scope for the real build:

- CRX `ProductPage` with variants and downloadable spec sheets (PDF)
- Enquiry form emailing `k2venterprise@gmail.com`, with a submissions log
- Wagtail image renditions and WebP, plus alt-text discipline for SEO
- Bilingual EN/BM via `wagtail-localize` if the client wants it
- Sitemap, robots, per-page meta — CRX ships all three
- Editor roles: one admin, one content editor

---

## File map

```
index.html                    public site
category/index.html           product catalogue
admin/index.html              admin shell
assets/site.css               public styles
assets/site.js                public nav / scroll-spy
assets/public-cms.js          applies admin edits to the public page
assets/admin-dashboard.js     the deployed editor (seed inline)
assets/admin-dashboard.css    editor styles
assets/seed.js                standalone-build seed content
assets/store.js               standalone-build storage layer + helpers
assets/admin.js               standalone-build admin CRUD
assets/admin.css              standalone-build admin styles
data/content.json             fuller content model for the CRX import
standalone/site.html          single-file offline copy of the public SPA
standalone/admin.html         single-file offline copy of the admin SPA
.github/workflows/static.yml  GitHub Pages deploy
.nojekyll                     serve files as-is
```

`assets/seed.js`, `assets/store.js`, `assets/admin.js` and `assets/admin.css`
belong to the standalone build. The deployed pages do not load them; the
standalone HTML files have their own inlined copies. Regenerate the standalone
files whenever those assets change.

---

## Placeholder content to replace before any client review

In the seed content, the **phone number**, **full address** and **company
registration number** are labelled placeholders ("to be confirmed by client").
The email address is the real one from the current Google Site. Product
specifications in `data/content.json` are plausible but unverified — confirm them
with the client before this is shown to a buyer.
