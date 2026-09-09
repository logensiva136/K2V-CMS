# K2V ENTERPRISE — website + CMS mock

A deployable mock of a replacement website for
[K2V Enterprise](https://sites.google.com/view/k2venterprise/), a Kulim-based
one-stop supplier of industrial materials, packaging, safety and cleanroom
consumables, office furniture and stationery for factories, schools and offices
across Kulim and Penang.

The **entire public site renders from one editable content object**. An admin
panel at `/admin/` edits every part of it — text, headings, colours, images,
products — so the client can click through the real thing and shape the content
before a Wagtail CRX build.

- `/` — customer-facing site (home + products catalogue)
- `/admin/` — content editor (no login — see the security note)

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
| **Live edits** | saved to `localStorage` under `k2v_site_content`, per browser |
| **Publishing** | export JSON from `/admin/` → **Import / export**, paste into `defaults.js`, bump `CONTENT_VERSION`, commit |

Edits are **per browser** — what the client changes on their laptop is not what a
visitor sees. That is the correct behaviour for a mock and the one thing to be
explicit about in the demo. Bumping `CONTENT_VERSION` makes returning browsers
pick up new seed content instead of their stale local copy.

If `localStorage` is unavailable (private mode, sandboxed preview) the editor
falls back to memory — it still works, it just forgets on reload.

### What the admin can edit

Theme (fonts, corner radius, every colour) · identity and logo · announcement
bar · navigation menu · hero (text, buttons, image, badge) · stats band · about
section · "what we supply" section · services · sectors · contact details ·
products-page header · footer (columns and links) · categories (name, blurb,
image, published) · products (name, code, category, summary, image, published).

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

## Security note — read this before showing the client

`/admin/` has **no authentication**. It is publicly reachable and anyone can open
it and edit their own browser's copy of the content. On a static host there is no
way around that; it exists so the demo feels like a real product. Real
authentication, roles and audit logging arrive with the Wagtail build.

Do not put anything confidential into this mock.

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
  store.js                  localStorage load/save/subscribe/export/import
  theme.js                  applies the theme object to CSS custom properties
  public/                   the customer-facing app (App.jsx + sections)
  admin/                    the CMS (Admin.jsx, fields.jsx)
  styles/                   site.css, admin.css
scripts/gen-content-json.mjs  regenerates data/content.json from defaults
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
