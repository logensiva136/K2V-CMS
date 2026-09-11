import { useState } from "react";
import { useContent, useSyncState, exportContent, importContent, resetContent, STORAGE_KEY } from "../store.js";
import { FONT_PRESETS } from "../content/defaults.js";
import { useAuthContext } from "./auth.jsx";
import {
  Group, Text, Area, Select, Toggle, Color, Num, ImageInput, Repeater, StringList, PairList, Field, at,
} from "./fields.jsx";

const uid = (p) =>
  `${p}${(crypto.randomUUID?.() || Math.random().toString(36).slice(2)).replace(/-/g, "").slice(0, 8)}`;

const SECTIONS = [
  { id: "theme", label: "Theme & colours" },
  { id: "identity", label: "Identity & header" },
  { id: "nav", label: "Navigation" },
  { id: "hero", label: "Hero" },
  { id: "band", label: "Stats band" },
  { id: "about", label: "About section" },
  { id: "supply", label: "Supply section" },
  { id: "services", label: "Services" },
  { id: "sectors", label: "Sectors" },
  { id: "contact", label: "Contact" },
  { id: "catalogue", label: "Catalogue page" },
  { id: "footer", label: "Footer" },
  { id: "categories", label: "Categories" },
  { id: "products", label: "Products" },
  { id: "data", label: "Import / export" },
];

export function Admin() {
  const content = useContent();
  const sync = useSyncState();
  const { mode, username, logout } = useAuthContext();
  const [section, setSection] = useState("theme");
  const [showPreview, setShowPreview] = useState(true);

  return (
    <>
      {mode === "local-only" && (
        <div className="authbanner">
          No login backend found — running in local-only mode. Changes save to this browser only; see README.md “Admin authentication” to deploy the real login.
        </div>
      )}
      <div className={`cms ${showPreview ? "cms--split" : ""}`}>
      <aside className="cms__nav">
        <div className="cms__brand">
          <span className="cms__mark">{content.identity.logoText || "K2V"}</span>
          <div>
            K2V CMS
            <small>Site content editor</small>
          </div>
        </div>
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            className={section === s.id ? "active" : ""}
            onClick={() => setSection(s.id)}
          >
            {s.label}
          </button>
        ))}
        <div className="cms__navfoot">
          <button className="ghost" onClick={() => setShowPreview((v) => !v)}>
            {showPreview ? "Hide preview" : "Show preview"}
          </button>
          <a className="ghost" href="../" target="_blank" rel="noreferrer">
            Open site ↗
          </a>
          {mode === "server" && (
            <button className="ghost" onClick={logout}>
              Log out{username ? ` (${username})` : ""}
            </button>
          )}
          <p>
            {mode === "server"
              ? "Changes publish to the live site."
              : "Changes save to this browser instantly. Use Import / export to keep them."}
          </p>
        </div>
      </aside>

      <main className="cms__main">
        <header className="cms__head">
          <h1>{SECTIONS.find((s) => s.id === section)?.label}</h1>
          <SyncBadge sync={sync} mode={mode} />
        </header>
        <div className="cms__panel">
          <Panel section={section} content={content} />
        </div>
      </main>

      {showPreview && (
        <aside className="cms__preview">
          <div className="cms__preview-bar">Live preview</div>
          <iframe title="Site preview" src="../" />
        </aside>
      )}
      </div>
    </>
  );
}

function SyncBadge({ sync, mode }) {
  if (mode === "local-only") return null;
  const label =
    sync.saveState === "saving"
      ? "Saving…"
      : sync.saveState === "saved"
      ? "Saved to server"
      : sync.saveState === "unauthorized"
      ? "Not logged in — saved to this browser only"
      : sync.saveState === "offline"
      ? "Server unreachable — saved to this browser only"
      : sync.source === "server"
      ? "Up to date"
      : "Loaded from this browser";
  const tone =
    sync.saveState === "saved" || (sync.saveState === "idle" && sync.source === "server")
      ? "ok"
      : sync.saveState === "saving"
      ? "busy"
      : sync.saveState === "unauthorized" || sync.saveState === "offline"
      ? "warn"
      : "muted";
  return <span className={`syncbadge syncbadge--${tone}`}>{label}</span>;
}

function Panel({ section, content }) {
  switch (section) {
    case "theme":
      return <ThemePanel />;
    case "identity":
      return <IdentityPanel />;
    case "nav":
      return <NavPanel />;
    case "hero":
      return <HeroPanel />;
    case "band":
      return <BandPanel />;
    case "about":
      return <AboutPanel />;
    case "supply":
      return <SupplyPanel />;
    case "services":
      return <ServicesPanel />;
    case "sectors":
      return <SectorsPanel />;
    case "contact":
      return <ContactPanel />;
    case "catalogue":
      return <CataloguePanel />;
    case "footer":
      return <FooterPanel />;
    case "categories":
      return <CategoriesPanel />;
    case "products":
      return <ProductsPanel content={content} />;
    case "data":
      return <DataPanel />;
    default:
      return null;
  }
}

function LinkPair({ base, label }) {
  return (
    <Group title={label}>
      <div className="two">
        <Text path={`${base}.label`} label="Button label" hint="Leave blank to hide" />
        <Text path={`${base}.href`} label="Link" hint="#about, #/products, mailto:…, https://…" />
      </div>
    </Group>
  );
}

/* ---------------- panels ---------------- */

function ThemePanel() {
  return (
    <>
      <Group title="Typography">
        <Select
          path="theme.fontPreset"
          label="Font"
          options={Object.entries(FONT_PRESETS).map(([value, v]) => ({ value, label: v.label }))}
        />
        <Num path="theme.radius" label="Corner radius (px)" min={0} max={24} />
      </Group>
      <Group title="Brand colours">
        <Color path="theme.navy" label="Primary (headings, dark UI)" />
        <Color path="theme.red" label="Accent (buttons, links)" />
        <Color path="theme.ink" label="Body text" />
        <Color path="theme.muted" label="Muted text" />
        <Color path="theme.line" label="Borders / hairlines" />
      </Group>
      <Group title="Backgrounds">
        <Color path="theme.pageBg" label="Page background" />
        <Color path="theme.soft" label="Soft section background" />
        <Color path="theme.heroTint" label="Hero tint" />
        <Color path="theme.bandBg" label="Stats band background" />
        <Color path="theme.bandInk" label="Stats band text" />
        <Color path="theme.footerBg" label="Footer / top bar background" />
        <Color path="theme.footerInk" label="Footer text" />
      </Group>
    </>
  );
}

function IdentityPanel() {
  return (
    <>
      <Group title="Business">
        <Text path="identity.name" label="Business name" hint="Shown in the logo, tab title and footer" />
        <Text path="identity.sub" label="Logo sub-line" hint="Small caps under the name" />
        <div className="two">
          <Text path="identity.logoText" label="Logo monogram" hint="Used when no logo image is set" />
        </div>
        <ImageInput path="identity.logoImage" label="Logo image" hint="Optional — replaces the monogram" />
      </Group>
      <Group title="Announcement bar">
        <Text path="identity.topBarLeft" label="Top bar — left text" />
        <Text path="identity.topBarRight" label="Top bar — right text" />
      </Group>
      <LinkPair base="nav.cta" label="Header button" />
    </>
  );
}

function NavPanel() {
  return (
    <Repeater
      path="nav.items"
      label="Menu items"
      itemLabel="item"
      hint="Order here sets the order in the header. Uncheck to hide without deleting."
      makeItem={() => ({ id: uid("n"), label: "New link", href: "#/", show: true })}
      renderItem={(p) => (
        <>
          <div className="two">
            <Text path={`${p}.label`} label="Label" />
            <Text path={`${p}.href`} label="Link" hint="#about, #/products, https://…" />
          </div>
          <Toggle path={`${p}.show`} label="Show in menu" />
        </>
      )}
    />
  );
}

function HeroPanel() {
  return (
    <>
      <Group title="Text">
        <Text path="hero.eyebrow" label="Eyebrow" />
        <div className="two">
          <Text path="hero.title" label="Heading" />
          <Text path="hero.titleEm" label="Heading — accent tail" hint="Rendered in the accent colour" />
        </div>
        <Area path="hero.body" label="Body" rows={3} />
      </Group>
      <LinkPair base="hero.primary" label="Primary button" />
      <LinkPair base="hero.secondary" label="Secondary link" />
      <Group title="Visual">
        <ImageInput path="hero.image" label="Hero image" />
        <div className="two">
          <Text path="hero.badgeValue" label="Badge — big value" />
          <Text path="hero.badgeText" label="Badge — caption" />
        </div>
      </Group>
    </>
  );
}

function BandPanel() {
  return (
    <Repeater
      path="trust.items"
      label="Stats"
      itemLabel="stat"
      hint="The dark strip under the hero."
      makeItem={() => ({ id: uid("t"), value: "0", label: "New stat" })}
      renderItem={(p) => (
        <div className="two">
          <Text path={`${p}.value`} label="Value" />
          <Text path={`${p}.label`} label="Label" />
        </div>
      )}
    />
  );
}

function AboutPanel() {
  return (
    <>
      <Group title="Text">
        <Text path="about.eyebrow" label="Eyebrow" />
        <Text path="about.title" label="Heading" />
        <StringList
          path="about.paragraphs"
          label="Paragraphs"
          itemLabel="paragraph"
          hint="A leading “Label:” at the start of a paragraph is shown in bold."
        />
      </Group>
      <Group title="Visual">
        <ImageInput path="about.image" label="About image" />
      </Group>
      <LinkPair base="about.cta" label="Button" />
    </>
  );
}

function SupplyPanel() {
  return (
    <>
      <Group title="Products section (on the home page)">
        <Text path="supply.eyebrow" label="Eyebrow" />
        <Text path="supply.title" label="Heading" />
      </Group>
      <LinkPair base="supply.link" label="Section link" />
      <p className="note">
        This section lists <b>every published product</b>, grouped under its category heading.
        Each card links to that product’s own page. Add products, images, descriptions and
        specification tables in the <b>Products</b> panel; rename or hide category headings in
        the <b>Categories</b> panel.
      </p>
    </>
  );
}

function ServicesPanel() {
  return (
    <>
      <Group title="Heading">
        <Text path="services.eyebrow" label="Eyebrow" />
        <Text path="services.title" label="Heading" />
        <Area path="services.intro" label="Intro" rows={2} />
      </Group>
      <Repeater
        path="services.items"
        label="Service items"
        itemLabel="service"
        makeItem={() => ({ id: uid("s"), num: "0", title: "New service", body: "" })}
        renderItem={(p) => (
          <>
            <div className="two">
              <Text path={`${p}.num`} label="Number" />
              <Text path={`${p}.title`} label="Title" />
            </div>
            <Area path={`${p}.body`} label="Body" rows={2} />
          </>
        )}
      />
    </>
  );
}

function SectorsPanel() {
  return (
    <>
      <Group title="Heading">
        <Text path="sectors.eyebrow" label="Eyebrow" />
        <Text path="sectors.title" label="Heading" />
      </Group>
      <StringList path="sectors.items" label="Sectors" itemLabel="sector" placeholder="e.g. MANUFACTURING" />
    </>
  );
}

function ContactPanel() {
  return (
    <>
      <Group title="Text">
        <Text path="contact.eyebrow" label="Eyebrow" />
        <Text path="contact.title" label="Heading" />
        <Area path="contact.body" label="Body" rows={2} />
      </Group>
      <Group title="Details (shown under the body)">
        <Text path="contact.email" label="Email" />
        <Text path="contact.phone" label="Phone" hint="Free text — shown as “Phone: …”. Leave a placeholder if not public yet." />
        <Text path="contact.address" label="Address / area served" />
        <Text path="contact.regNo" label="Registration number" />
        <Text path="contact.hours" label="Business hours" />
      </Group>
      <LinkPair base="contact.cta" label="Button" />
    </>
  );
}

function CataloguePanel() {
  return (
    <>
      <Group title="Products page header">
        <Text path="catalogue.eyebrow" label="Eyebrow" />
        <Text path="catalogue.title" label="Heading" />
        <Area path="catalogue.intro" label="Intro" rows={2} />
      </Group>
      <LinkPair base="catalogue.cta" label="Button" />
    </>
  );
}

function FooterPanel() {
  return (
    <>
      <Group title="Footer">
        <Area path="footer.blurb" label="Blurb (under the logo)" rows={2} />
        <div className="two">
          <Text path="footer.legal" label="Copyright line" />
          <Text path="footer.note" label="Right-aligned note" />
        </div>
      </Group>
      <Repeater
        path="footer.columns"
        label="Footer columns"
        itemLabel="column"
        makeItem={() => ({ id: uid("f"), heading: "New column", links: [] })}
        renderItem={(p) => (
          <>
            <Text path={`${p}.heading`} label="Column heading" />
            <Repeater
              path={`${p}.links`}
              label="Links"
              itemLabel="link"
              makeItem={() => ({ id: uid("fl"), label: "New link", href: "#/" })}
              renderItem={(lp) => (
                <div className="two">
                  <Text path={`${lp}.label`} label="Label" />
                  <Text path={`${lp}.href`} label="Link" />
                </div>
              )}
            />
          </>
        )}
      />
    </>
  );
}

function CategoriesPanel() {
  return (
    <Repeater
      path="categories"
      label="Categories"
      itemLabel="category"
      minItems={0}
      hint="The first published categories also appear as cards in the “What we supply” section."
      makeItem={() => ({ id: uid("c"), name: "New category", slug: uid("cat-"), blurb: "", image: "", published: true })}
      renderItem={(p) => (
        <>
          <div className="two">
            <Text path={`${p}.name`} label="Name" />
            <Text path={`${p}.slug`} label="Slug" hint="Used for in-page links on the products page" />
          </div>
          <Area path={`${p}.blurb`} label="Blurb" rows={2} />
          <ImageInput path={`${p}.image`} label="Category image" />
          <Toggle path={`${p}.published`} label="Published (visible on the site)" />
        </>
      )}
    />
  );
}

function ProductsPanel({ content }) {
  const catOptions = content.categories.map((c) => ({ value: c.id, label: c.name }));
  return (
    <Repeater
      path="products"
      label="Products"
      itemLabel="product"
      hint="Grouped by category on the Products page."
      makeItem={() => ({
        id: uid("p"),
        name: "New product",
        sku: "",
        categoryId: content.categories[0]?.id || "",
        summary: "",
        description: "",
        specs: [],
        image: "",
        published: true,
      })}
      renderItem={(p) => (
        <>
          <div className="two">
            <Text path={`${p}.name`} label="Name" />
            <Text path={`${p}.sku`} label="Code / SKU" />
          </div>
          <Select path={`${p}.categoryId`} label="Category" options={catOptions} />
          <Area path={`${p}.summary`} label="Summary" hint="One line — shown on the card and above the details" rows={2} />
          <Area path={`${p}.description`} label="Description" hint="Full text for the product page. Leave a blank line between paragraphs." rows={5} />
          <PairList
            path={`${p}.specs`}
            label="Specifications"
            hint="Each row becomes one line of the spec table on the product page. Leave empty to hide the table."
            labelPlaceholder="e.g. Roll width"
            valuePlaceholder="e.g. 1000 mm"
          />
          <ImageInput path={`${p}.image`} label="Product image" />
          <Toggle path={`${p}.published`} label="Published (visible on the site)" />
        </>
      )}
    />
  );
}

function DataPanel() {
  const [msg, setMsg] = useState("");
  return (
    <Group title="Content file">
      <p className="note">
        All edits live in this browser only (localStorage key <code>{STORAGE_KEY}</code>). Export the
        JSON and commit it into the seed to publish changes for everyone.
      </p>
      <div className="btnrow">
        <button className="primary" onClick={exportContent}>
          Download content JSON
        </button>
        <label className="filebtn">
          Import JSON
          <input
            type="file"
            accept="application/json"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f)
                importContent(f)
                  .then(() => setMsg("Imported."))
                  .catch(() => setMsg("That file could not be read as content JSON."));
              e.target.value = "";
            }}
          />
        </label>
        <button
          className="danger"
          onClick={() => {
            if (confirm("Reset all content to the built-in defaults?")) {
              resetContent();
              setMsg("Reset to defaults.");
            }
          }}
        >
          Reset to defaults
        </button>
      </div>
      {msg && <p className="note">{msg}</p>}
    </Group>
  );
}
