# K2V Enterprise — CMS mock

A working, deployable mock of a replacement website for
[K2V Enterprise](https://sites.google.com/view/k2venterprise/), with an editable
admin panel. Built as a static site so it runs on GitHub Pages with no server,
no build step and no dependencies.

- `/` — customer-facing site
- `/admin` — content editor (demo login `admin` / `k2v2026`)

The point of this build is to let the client **click through the real thing and
edit real content** before committing budget to the Wagtail CRX build. Every
content shape here maps to a CRX page type (see the table below).

---

## What the client can do in /admin

| Section | What it edits |
|---|---|
| Dashboard | Counts, recent enquiries, quick actions |
| Products | Add, edit, delete, publish/unpublish; code, category, summary, description, spec table, tags, image |
| Categories | The nine supply lines, their codes, blurbs and images |
| Pages | About, Services, Privacy and any new page; optionally added to the main menu |
| News | Posts with date, excerpt, body and image |
| Home page | Hero copy and buttons, numbers strip, reasons block, call to action, featured products |
| Navigation | Main menu labels and links |
| Site settings | Business name, registration number, phone, email, WhatsApp, hours, location |
| Enquiries | Inbox of contact-form submissions, mark read / delete |
| Import / export | Download `content.json`, load one back, reset to demo content |

Deleting a category that still has products is blocked, duplicate product codes
are rejected, and drafts are hidden from the public site.

---

## Deploy to GitHub Pages

```bash
git init
git add .
git commit -m "K2V CMS mock"
git branch -M main
git remote add origin git@github.com:<you>/k2v-mock.git
git push -u origin main
```

Then: **Settings → Pages → Source: Deploy from a branch → `main` / `root` → Save.**

Or with the GitHub CLI, one command from inside this folder:

```bash
gh repo create k2v-mock --public --source=. --remote=origin --push
gh api -X POST repos/:owner/k2v-mock/pages -f "source[branch]=main" -f "source[path]=/"
```

First build takes 1–2 minutes. Pages must be **public** — GitHub only serves
Pages from private repositories on paid plans.

The site appears at `https://<you>.github.io/k2v-mock/` and the editor at
`https://<you>.github.io/k2v-mock/admin/`. `.nojekyll` is included so Jekyll
does not touch the files.

To preview locally, open `index.html` directly, or:

```bash
python3 -m http.server 8000
```

---

## How content is stored

Content ships in `assets/seed.js`. On first visit the browser loads that seed;
every save in `/admin` writes to `localStorage` under `k2v_cms_content`.

That means edits are **per browser** — what the client edits on their laptop is
not what a visitor sees. That is the correct behaviour for a mock, and it is the
single thing to be explicit about in the demo. To make an edit permanent:

1. In `/admin` → **Import / export** → **Download content.json**
2. Replace the `window.K2V_SEED = { … }` object in `assets/seed.js` with it
3. Bump `version` in that object so returning browsers pick up the new content
4. Commit and push

If `localStorage` is unavailable (private mode, sandboxed preview) the store
falls back to memory — the panel still works, it just forgets on reload.

### Placeholder images

Any record without an image URL renders a generated SVG plate with its product
code. Nothing 404s, and real photography can be dropped in one record at a time
by pasting a URL in the admin.

---

## Security note — read this before showing the client

The `/admin` login is **cosmetic**. The credentials are in the JavaScript, the
page is publicly reachable, and anyone can open it. On a static host there is no
way around that. It exists so the demo feels like a real product.

Do not put anything confidential into this mock, and do not treat the enquiry
inbox as private. Real authentication, roles and audit logging arrive with the
Wagtail build.

---

## Migration path — Wagtail CRX

The JSON in `data/content.json` is deliberately shaped to map onto CRX
page types, so the mock's content becomes the initial data load rather than
throwaway work.

| Mock key | Wagtail CRX |
|---|---|
| `site` | `Website` settings / branding, Google Analytics, social |
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

## Two ways to run it

**Deployed (the real deliverable)** — the multi-file version at the repository
root. This is what goes on GitHub Pages.

**Standalone** — `standalone/site.html` and `standalone/admin.html` are the same
build with the CSS and JavaScript inlined into single files. No server needed;
double-click either one, or email them to the client. Handy for a demo on a
laptop with no internet. They share content with each other but not with the
deployed copy. Regenerate them whenever `assets/` changes.

## File map

```
index.html          public site shell
admin/index.html    admin shell
assets/seed.js      shipped content (the "database")
assets/store.js     storage layer + helpers — replace with API calls later
assets/site.js      public site rendering and hash router
assets/admin.js     admin CRUD
assets/site.css     public styles
assets/admin.css    admin styles
data/content.json   the same content as JSON, for the CRX import
standalone/         single-file copies for offline demos
.nojekyll           tells GitHub Pages to serve files as-is
```

## Placeholder content to replace before any client review

`assets/seed.js` → `site`: the phone number, WhatsApp number, full address and
registration number are all invented placeholders. The email address is the real
one from the current Google Site. Product specifications are plausible but
unverified — confirm them with the client before this is shown to a buyer.
