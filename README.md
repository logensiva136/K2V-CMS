# K2V ENTERPRISE — website + CMS mock

A deployable mock of a replacement website for
[K2V Enterprise](https://sites.google.com/view/k2venterprise/), a Kulim-based
one-stop supplier of industrial materials, packaging, safety and cleanroom
consumables, office furniture and stationery for factories, schools and offices
across Perlis, Kedah and Penang.

The **entire public site renders from one editable content object**. An admin
panel at `/admin/` edits every part of it — text, headings, colours, images,
products (including per-product description and a specification table) — so the
client can click through the real thing and shape the content before a Wagtail
CRX build.

Public pages: home one-pager (every published product is listed in the
"products" section, grouped by category) · `#/product/<id>` product detail
(image, description, spec table, enquiry button) · `#/products` a category-
filtered browse of the same products.

- `/` — customer-facing site (home + products catalogue)
- `/admin/` — content editor. Logs in for real if you deploy the `/api` backend
  described below; otherwise it runs in **local-only mode** automatically — see
  "Admin authentication".

Built with **React + Vite**.

---

## Run it

```bash
npm install
npm run dev        # http://localhost:5173/  and  /admin/
npm run build      # → dist/
npm run preview    # serve the production build
```

`npm run gen:content` rewrites `data/content.json` from `src/content/defaults.js`
(the Wagtail import reference — see below).

---

## How editing works

| | |
|---|---|
| **Source of truth** | `src/content/defaults.js` — the built-in/seed content |
| **Live edits** | saved to `localStorage` under `k2v_site_content`, per browser — and, if `/api` is deployed, synced to the server so every visitor sees it (see "Admin authentication") |
| **Publishing (no backend)** | export JSON from `/admin/` → **Import / export**, paste into `defaults.js`, bump `CONTENT_VERSION`, commit |

Without the `/api` backend, edits are **per browser** — what the client changes
on their laptop is not what a visitor sees. That is the mock's current, deployed
behaviour and the one thing to be explicit about in a demo. Bumping
`CONTENT_VERSION` makes returning browsers pick up new seed content instead of
their stale local copy.

If `localStorage` is unavailable (private mode, sandboxed preview) the editor
falls back to memory — it still works, it just forgets on reload.

### What the admin can edit

Theme (fonts, corner radius, every colour) · identity and logo · announcement
bar · navigation menu · hero (text, buttons, image, badge) · stats band · about
section · "what we supply" section · services · sectors · contact details ·
products-page header · footer (columns and links) · categories (name, blurb,
image, published) · products (name, code, category, summary, **description**,
**specification rows**, image, published).

A product with no description or no spec rows simply hides that block on its
detail page, so the client can fill products in one at a time.

### Images

Every image field takes a URL **or** an uploaded file. Uploads are stored as a
base64 data URL inside the content JSON — fine for a handful of images; the field
warns when one is large. Prefer hosted URLs for anything that ships in the seed.

Records with no image show a hatched placeholder with the item's name, so nothing
ever 404s.

### Live preview

`/admin/` shows the real site in an iframe beside the form. Because both run on
the same origin and share the `localStorage` key, edits appear in the preview as
you type — no save button.

---

## Deploy to GitHub Pages

`.github/workflows/static.yml` builds the site and deploys it on every push to
`master` (and on demand from the Actions tab). One-time setup:

**Settings → Pages → Source: GitHub Actions.**

Pages must be **public** — GitHub only serves Pages from private repos on paid
plans. Vite is configured with `base: "./"` so the build works at any path
(`https://<you>.github.io/<repo>/`) without knowing the repo name.

---

## Admin authentication

`/admin/` works two ways, chosen automatically at load:

- **No `/api` reachable (GitHub Pages, or `npm run dev` with no backend running)** —
  runs in **local-only mode**: no login, edits save to `localStorage` in that
  browser only. This is the mock behaviour and is what's deployed today.
- **`/api` answers the contract below** — real login. First visit to `/admin/`
  with no admin account yet shows a one-time setup screen; after that, a login
  screen gated by a server-verified session. Content read/write also moves to
  the server at that point (`GET`/`POST /api/content`), so a logged-in edit
  publishes for every visitor instead of staying in one browser.

The frontend (`src/admin/auth.jsx`, `src/admin/api.js`, the sync layer in
`src/store.js`) is already built against this contract — any backend that
implements it works without frontend changes:

```
GET  /api/auth/status   -> { hasAdmin: boolean, authenticated: boolean }
POST /api/auth/setup    { username, password } -> sets session cookie
                            (must refuse once hasAdmin is already true)
POST /api/auth/login    { username, password } -> sets session cookie, or 401
POST /api/auth/logout   -> clears the session cookie
GET  /api/content       -> the full content JSON (public, no auth required)
POST /api/content       body: full content JSON
                            -> 200 if the session is valid, 401 otherwise
```

Requirements for whichever backend implements it (PHP or Node — both work,
pick whichever your host supports):

- Single admin account, created once via `/auth/setup`.
- Password hashed (bcrypt / `password_hash()` — never stored or compared in
  plaintext).
- Session token issued as a **JWT in an `HttpOnly`, `Secure`, `SameSite=Strict`
  cookie** — never returned in the response body or readable from JS, so an
  XSS bug can't steal it. Short expiry (a couple of hours) is enough for a
  single-editor tool.
- Rate-limit `/auth/login` server-side (the React login form already locks
  itself out client-side after 5 failed attempts, but that's UX, not
  security — the real limit has to be enforced on the server).
- `/api/content` `POST` checks the session cookie before writing anything.

`npm run verify` includes `scripts/verify-auth.mjs`, which drives the real
`AuthGate`/`Login`/`Setup` components in jsdom against an in-memory fake
backend implementing this exact contract — useful as executable documentation
of the expected request/response shapes while building the real one.

Until a backend is deployed: do not put anything confidential into this mock,
and treat `/admin/` as publicly editable (per-browser only, as above).

---

## Migration path — Wagtail CRX

`data/content.json` is the same model as a flat JSON file, ready as the initial
data load for the real build.

| `content.json` key | Wagtail CRX |
|---|---|
| `theme`, `identity` | `Website` settings / branding, fonts, colours |
| `nav` | `Navbar` snippet |
| `hero`, `about`, `supply`, `services`, `sectors`, `contact` | home `ArticlePage` StreamField blocks |
| `catalogue` | products index page |
| `categories[]` | `ArticleIndexPage` (or a product category model) |
| `products[]` | Product page type with a spec table block |
| `footer` | footer snippet |

Recommended follow-on scope for the real build:

- CRX `ProductPage` with variants and downloadable spec sheets (PDF)
- Enquiry form emailing `k2venterprise@gmail.com`, with a submissions log
- Wagtail image renditions and WebP, plus alt-text discipline for SEO
- Bilingual EN/BM via `wagtail-localize` if the client wants it
- Sitemap, robots, per-page meta — CRX ships all three
- Editor roles: one admin, one content editor

---

## Layout

```
index.html                  public app entry (Vite)
admin/index.html            admin app entry (Vite)
src/
  content/defaults.js       seed content — the single source of truth
  store.js                  content store: localStorage + optional /api sync
  theme.js                  applies the theme object to CSS custom properties
  public/                   the customer-facing app (App.jsx + sections)
  admin/                    the CMS (Admin.jsx, fields.jsx, auth.jsx, api.js)
  styles/                   site.css, admin.css
scripts/gen-content-json.mjs  regenerates data/content.json from defaults
scripts/verify.mjs            headless check of the public + admin content loop
scripts/verify-auth.mjs       headless check of the login/onboarding flow
data/content.json           flat content model for the CRX import
.github/workflows/static.yml  build + deploy to GitHub Pages
```

---

## Placeholder content to replace before any client review

In the seed content, the **phone number**, **full address** and **company
registration number** are labelled placeholders ("to be confirmed by client").
The email is the real one from the current Google Site. Product summaries are
plausible but unverified — confirm them with the client before this is shown to a
buyer.
