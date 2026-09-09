import { useEffect, useState } from "react";
import { useContent } from "../store.js";
import { useTheme } from "../theme.js";

/* ---------------- routing ---------------- */

function useRoute() {
  const [hash, setHash] = useState(() => window.location.hash || "#/");
  useEffect(() => {
    const on = () => setHash(window.location.hash || "#/");
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  if (hash.startsWith("#/product/")) return { view: "product", id: decodeURIComponent(hash.slice(10)), hash };
  if (hash.startsWith("#/products")) return { view: "products", hash };
  if (hash.startsWith("#/")) return { view: "home", anchor: null, hash };
  return { view: "home", anchor: hash.slice(1), hash };
}

function go(href) {
  if (href && href.startsWith("#")) {
    if (window.location.hash === href) {
      // re-trigger anchor scroll
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    } else {
      window.location.hash = href;
    }
  } else if (href) {
    window.open(href, href.startsWith("mailto:") ? "_self" : "_blank");
  }
}

function Link({ href, className, children }) {
  return (
    <a
      href={href}
      className={className}
      onClick={(e) => {
        if (href && href.startsWith("#")) {
          e.preventDefault();
          go(href);
        }
      }}
    >
      {children}
    </a>
  );
}

/* ---------------- helpers ---------------- */

function bg(url) {
  return url ? { backgroundImage: `url("${url}")` } : undefined;
}

function Img({ url, alt, className, phText }) {
  if (url) return <div className={className} style={bg(url)} role="img" aria-label={alt} />;
  return <div className={`${className} img-ph`}>{phText || alt}</div>;
}

/* ---------------- shell ---------------- */

export function App() {
  const c = useContent();
  const route = useRoute();
  useTheme(c.theme);

  useEffect(() => {
    if (route.view === "home" && route.anchor) {
      const el = document.getElementById(route.anchor);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 0 });
    }
  }, [route.view, route.anchor, route.hash]);

  useEffect(() => {
    document.title = c.identity.name || "K2V ENTERPRISE";
  }, [c.identity.name]);

  return (
    <>
      <TopLine identity={c.identity} />
      <Header content={c} route={route} />
      {route.view === "product" ? (
        <ProductDetail content={c} id={route.id} />
      ) : route.view === "products" ? (
        <Catalogue content={c} />
      ) : (
        <main>
          <Hero data={c.hero} />
          <Band items={c.trust.items} />
          <About data={c.about} />
          <Supply content={c} />
          <Services data={c.services} />
          <Sectors data={c.sectors} />
          <Contact data={c.contact} />
        </main>
      )}
      <Footer content={c} />
    </>
  );
}

function TopLine({ identity }) {
  if (!identity.topBarLeft && !identity.topBarRight) return null;
  return (
    <div className="topline">
      <div className="wrap topflex">
        <span>{identity.topBarLeft}</span>
        <span>{identity.topBarRight}</span>
      </div>
    </div>
  );
}

function Logo({ identity, footer }) {
  return (
    <span className={`logo${footer ? " logo--footer" : ""}`}>
      <span className="logo__icon">
        {identity.logoImage ? <img src={identity.logoImage} alt={identity.name} /> : identity.logoText}
      </span>
      <span>
        <b>{identity.name}</b>
        <small>{identity.sub}</small>
      </span>
    </span>
  );
}

function Header({ content, route }) {
  const { identity, nav } = content;
  const [open, setOpen] = useState(false);
  const activeAnchor = route.view === "products" ? "#/products" : `#${route.anchor || "/"}`;
  return (
    <header className="header" id="top">
      <div className="wrap header__inner">
        <Link href="#/" className="logo-link" aria-label={`${identity.name} home`}>
          <Logo identity={identity} />
        </Link>
        <button className="menu" aria-label="Toggle navigation" onClick={() => setOpen((v) => !v)}>
          ☰
        </button>
        <nav className={open ? "open" : ""} onClick={() => setOpen(false)}>
          {nav.items
            .filter((i) => i.show)
            .map((i) => (
              <Link
                key={i.id}
                href={i.href}
                className={i.href === activeAnchor ? "active" : ""}
              >
                {i.label}
              </Link>
            ))}
        </nav>
        {nav.cta?.label && (
          <Link href={nav.cta.href} className="header__cta">
            {nav.cta.label} →
          </Link>
        )}
      </div>
    </header>
  );
}

/* ---------------- home sections ---------------- */

function Hero({ data }) {
  return (
    <section className="hero">
      <div className="wrap hero__grid">
        <div className="hero__copy">
          {data.eyebrow && <p className="kicker">{data.eyebrow}</p>}
          <h1>
            {data.title} {data.titleEm && <em>{data.titleEm}</em>}
          </h1>
          {data.body && <p>{data.body}</p>}
          <div className="hero__actions">
            {data.primary?.label && (
              <Link href={data.primary.href} className="btn btn--red">
                {data.primary.label} <span>→</span>
              </Link>
            )}
            {data.secondary?.label && (
              <Link href={data.secondary.href} className="text-link">
                {data.secondary.label} <span>→</span>
              </Link>
            )}
          </div>
        </div>
        <div className="hero__visual">
          <Img url={data.image} alt="" className="hero__image" phText="Hero image" />
          {(data.badgeValue || data.badgeText) && (
            <div className="hero__badge">
              <strong>{data.badgeValue}</strong>
              <span>{data.badgeText}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Band({ items }) {
  if (!items?.length) return null;
  return (
    <section className="band">
      <div className="wrap band__grid">
        {items.map((s) => (
          <div key={s.id}>
            <strong>{s.value}</strong>
            <span>{s.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function About({ data }) {
  return (
    <section className="section" id="about">
      <div className="wrap about">
        <Img url={data.image} alt="About" className="about__image" phText="About image" />
        <div className="about__copy">
          {data.eyebrow && <p className="kicker">{data.eyebrow}</p>}
          <h2>{data.title}</h2>
          {data.paragraphs.map((p, i) => (
            <p key={i} dangerouslySetInnerHTML={{ __html: emphasise(p) }} />
          ))}
          {data.cta?.label && (
            <Link href={data.cta.href} className="btn btn--navy">
              {data.cta.label} <span>→</span>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

// let "Our vision:" / "Our mission:" style leads render bold without a rich editor
function emphasise(text) {
  const esc = text.replace(/[&<>]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[ch]));
  return esc.replace(/^([^:]{3,40}:)/, "<strong>$1</strong>");
}

function Supply({ content }) {
  const { supply, categories, products } = content;
  const cats = categories.filter((c) => c.published);
  const published = products.filter((p) => p.published !== false);
  const groups = cats
    .map((cat) => ({ cat, items: published.filter((p) => p.categoryId === cat.id) }))
    .filter((g) => g.items.length > 0);
  const orphans = published.filter((p) => !cats.some((c) => c.id === p.categoryId));
  if (orphans.length) groups.push({ cat: null, items: orphans });

  return (
    <section className="section section--soft" id="products">
      <div className="wrap">
        <div className="section__heading">
          <div>
            {supply.eyebrow && <p className="kicker">{supply.eyebrow}</p>}
            <h2>{supply.title}</h2>
          </div>
          {supply.link?.label && (
            <Link href={supply.link.href} className="outline-link">
              {supply.link.label} <span>→</span>
            </Link>
          )}
        </div>

        {groups.length === 0 && (
          <p style={{ color: "var(--muted)" }}>Products will appear here once they are added.</p>
        )}

        {groups.map(({ cat, items }) => (
          <div className="supply-group" key={cat ? cat.id : "_orphans"}>
            {cat && <h3 className="supply-group__title">{cat.name}</h3>}
            <div className="cards">
              {items.map((p) => (
                <Link key={p.id} href={`#/product/${p.id}`} className="product-card">
                  <Img url={p.image} alt={p.name} className="card-image" phText={p.sku || p.name} />
                  {p.sku && <span>{p.sku}</span>}
                  <h4>{p.name}</h4>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Services({ data }) {
  return (
    <section className="section services" id="services">
      <div className="wrap">
        <div className="section__heading center">
          {data.eyebrow && <p className="kicker">{data.eyebrow}</p>}
          <h2>{data.title}</h2>
          {data.intro && <p>{data.intro}</p>}
        </div>
        <div className="service-grid">
          {data.items.map((s) => (
            <div key={s.id}>
              <b>{s.num}</b>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Sectors({ data }) {
  if (!data.items?.length) return null;
  return (
    <section className="sectors" id="sectors">
      <div className="wrap">
        {data.eyebrow && <p className="kicker">{data.eyebrow}</p>}
        <h2>{data.title}</h2>
        <div className="sector-list">
          {data.items.map((s, i) => (
            <span key={i}>{s}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contact({ data }) {
  const phoneDigits = String(data.phone || "").replace(/[^\d+]/g, "");
  const phoneIsNumber = /\d/.test(phoneDigits);
  const meta = [
    data.phone && (
      <>
        Phone:{" "}
        {phoneIsNumber ? (
          <a href={`tel:${phoneDigits}`} style={{ color: "inherit", textDecoration: "underline" }}>
            {data.phone}
          </a>
        ) : (
          data.phone
        )}
      </>
    ),
    data.address || null,
    data.regNo || null,
    data.hours || null,
  ].filter(Boolean);
  return (
    <section className="cta" id="contact">
      <div className="wrap cta__inner">
        <div>
          {data.eyebrow && <p className="kicker">{data.eyebrow}</p>}
          <h2>{data.title}</h2>
          {data.body && (
            <p>
              {data.body}{" "}
              {data.email && (
                <a href={`mailto:${data.email}`} style={{ color: "#fff", textDecoration: "underline" }}>
                  {data.email}
                </a>
              )}
            </p>
          )}
          {meta.length > 0 && (
            <div className="cta__meta">
              {meta.map((m, i) => (
                <span key={i}>{m}</span>
              ))}
            </div>
          )}
        </div>
        {data.cta?.label && (
          <Link href={data.cta.href} className="btn btn--red">
            {data.cta.label} <span>→</span>
          </Link>
        )}
      </div>
    </section>
  );
}

function Footer({ content }) {
  const { identity, footer } = content;
  return (
    <footer>
      <div className="wrap footer__grid">
        <div>
          <Link href="#/" className="logo-link">
            <Logo identity={identity} footer />
          </Link>
          <p>{footer.blurb}</p>
        </div>
        {footer.columns.map((col) => (
          <div key={col.id}>
            <h4>{col.heading}</h4>
            {col.links.map((l) => (
              <Link key={l.id} href={l.href}>
                {l.label}
              </Link>
            ))}
          </div>
        ))}
      </div>
      <div className="footer__bottom">
        <div className="wrap">
          {footer.legal} <span>{footer.note}</span>
        </div>
      </div>
    </footer>
  );
}

/* ---------------- products / catalogue view ---------------- */

function Catalogue({ content }) {
  const { catalogue, categories, products } = content;
  const cats = categories.filter((c) => c.published);
  const [active, setActive] = useState(cats[0]?.slug || "");

  return (
    <main className="catalogue">
      <div className="wrap">
        <div className="catalogue-head">
          <div>
            {catalogue.eyebrow && <p className="kicker">{catalogue.eyebrow}</p>}
            <h1>{catalogue.title}</h1>
            <p className="catalogue-intro">{catalogue.intro}</p>
          </div>
          {catalogue.cta?.label && (
            <Link href={catalogue.cta.href} className="btn btn--red">
              {catalogue.cta.label} <span>→</span>
            </Link>
          )}
        </div>
        <div className="catalogue-layout">
          <aside className="catalogue-nav">
            <h3>Categories</h3>
            {cats.map((cat) => (
              <a
                key={cat.id}
                className={active === cat.slug ? "active" : ""}
                onClick={() => {
                  setActive(cat.slug);
                  document.getElementById(`cat-${cat.slug}`)?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                {cat.name} <span>›</span>
              </a>
            ))}
          </aside>
          <div>
            {cats.map((cat) => {
              const items = products.filter((p) => p.published && p.categoryId === cat.id);
              return (
                <section key={cat.id} className="cat-block" id={`cat-${cat.slug}`}>
                  <div className="cat-block__head">
                    <h2>{cat.name}</h2>
                    <p>{cat.blurb}</p>
                  </div>
                  {items.length === 0 ? (
                    <p style={{ color: "var(--muted)", fontSize: 13 }}>
                      Contact us for the current range in this category.
                    </p>
                  ) : (
                    <div className="prod-grid">
                      {items.map((p) => (
                        <Link key={p.id} href={`#/product/${p.id}`} className="prod-item">
                          <Img
                            url={p.image}
                            alt={p.name}
                            className="prod-item__img"
                            phText={p.sku || p.name}
                          />
                          <div className="prod-item__body">
                            {p.sku && <div className="prod-item__sku">{p.sku}</div>}
                            <h3>{p.name}</h3>
                            <span className="prod-item__more">View details →</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}

/* ---------------- product detail ---------------- */

function ProductDetail({ content, id }) {
  const product = content.products.find((p) => p.id === id);

  if (!product || product.published === false) {
    return (
      <main className="pdp">
        <div className="wrap">
          <Link href="#/products" className="pdp__back">
            ← Back to products
          </Link>
          <h1>Product not found</h1>
          <p style={{ color: "var(--muted)" }}>
            This product may have been removed. Browse the full catalogue instead.
          </p>
        </div>
      </main>
    );
  }

  const category = content.categories.find((c) => c.id === product.categoryId);
  const specs = (product.specs || []).filter((row) => row && (row[0] || row[1]));
  const paragraphs = String(product.description || "")
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  const email = content.contact?.email;
  const enquireHref = email
    ? `mailto:${email}?subject=${encodeURIComponent(`Enquiry: ${product.name}${product.sku ? ` (${product.sku})` : ""}`)}`
    : "#contact";

  return (
    <main className="pdp">
      <div className="wrap">
        <div className="pdp__crumbs">
          <Link href="#/products">Products</Link>
          {category && (
            <>
              <span>/</span>
              <Link href="#/products">{category.name}</Link>
            </>
          )}
        </div>

        <div className="pdp__grid">
          <Img url={product.image} alt={product.name} className="pdp__img" phText={product.sku || product.name} />

          <div className="pdp__info">
            {product.sku && <div className="pdp__sku">{product.sku}</div>}
            <h1>{product.name}</h1>
            {category && <p className="pdp__cat">{category.name}</p>}
            {product.summary && <p className="pdp__lead">{product.summary}</p>}

            {paragraphs.map((p, i) => (
              <p key={i} className="pdp__para">
                {p}
              </p>
            ))}

            <a className="btn btn--red" href={enquireHref}>
              Enquire about this product <span>→</span>
            </a>
          </div>
        </div>

        {specs.length > 0 && (
          <div className="pdp__specs">
            <h2>Specification</h2>
            <table>
              <tbody>
                {specs.map((row, i) => (
                  <tr key={i}>
                    <th>{row[0]}</th>
                    <td>{row[1]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="pdp__note">
              Specifications are indicative. Contact K2V ENTERPRISE to confirm the exact
              variant, pack size and lead time for your order.
            </p>
          </div>
        )}

        <Link href="#/products" className="pdp__back">
          ← Back to all products
        </Link>
      </div>
    </main>
  );
}
