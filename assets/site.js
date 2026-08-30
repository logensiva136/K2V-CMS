/* K2V ENTERPRISE — public site renderer.
   Hash routing keeps this deployable to GitHub Pages with no server rules. */
(function () {
  "use strict";

  var S = window.K2VStore;
  var esc = S.esc;
  var data = S.load();
  var view = document.getElementById("view");

  function q(sel) { return document.querySelector(sel); }
  function money(n) { return n; }

  function img(rec, code) { return S.imageFor(rec, code); }

  function pubProducts() { return data.products.filter(function (p) { return p.published; }); }
  function pubCats() { return data.categories.filter(function (c) { return c.published; }); }
  function pubNews() {
    return data.news.filter(function (n) { return n.published; })
      .sort(function (a, b) { return (b.date || "").localeCompare(a.date || ""); });
  }
  function pageBySlug(slug) {
    return data.pages.filter(function (p) { return p.published && p.slug === slug; })[0];
  }
  function catBySlug(slug) {
    return data.categories.filter(function (c) { return c.slug === slug; })[0];
  }
  function productBySku(sku) {
    return data.products.filter(function (p) { return p.sku === sku; })[0];
  }
  function fmtDate(d) {
    if (!d) return "";
    var parts = String(d).split("-");
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    if (parts.length !== 3) return d;
    return parts[2] + " " + months[parseInt(parts[1], 10) - 1] + " " + parts[0];
  }

  /* ---------- chrome ---------- */

  function renderChrome() {
    var s = data.site;
    document.title = s.name + " — " + s.tagline;
    q("#brand-mark").textContent = s.mark || "K2V";
    q("#brand-name").textContent = s.name;
    q("#brand-sub").textContent = "Industrial supply · Malaysia";

    q("#util-left").innerHTML = "<span>" + esc(s.hours) + "</span>";
    q("#util-right").innerHTML =
      '<span><a href="tel:' + esc((s.phone || "").replace(/\s/g, "")) + '">' + esc(s.phone) + "</a></span>" +
      '<span><a href="mailto:' + esc(s.email) + '">' + esc(s.email) + "</a></span>";

    var items = data.nav.filter(function (n) { return n.showInNav !== false; });
    var extra = data.pages.filter(function (p) { return p.published && p.showInNav; })
      .map(function (p) { return { label: p.title, url: "#/page/" + p.slug }; });
    var all = items.concat(extra);
    var here = location.hash || "#/";
    q("#nav").innerHTML = all.map(function (n) {
      var active = (n.url === here) ? " class=\"is-active\"" : "";
      return "<a href=\"" + esc(n.url) + "\"" + active + ">" + esc(n.label) + "</a>";
    }).join("") + '<a class="btn btn--light nav__cta" href="#/contact">Get a quote</a>';

    q("#footer-grid").innerHTML =
      "<div><h4>" + esc(s.name) + "</h4><p>" + esc(s.footerBlurb) + "</p><p style=\"margin-top:16px\">" +
      esc(s.address) + "<br><span style=\"font-size:.8rem;opacity:.7\">" + esc(s.addressNote || "") + "</span></p></div>" +
      "<div><h4>Products</h4><ul>" + pubCats().slice(0, 6).map(function (c) {
        return "<li><a href=\"#/products/" + esc(c.slug) + "\">" + esc(c.name) + "</a></li>";
      }).join("") + "</ul></div>" +
      "<div><h4>Company</h4><ul>" +
      data.pages.filter(function (p) { return p.published; }).map(function (p) {
        return "<li><a href=\"#/page/" + esc(p.slug) + "\">" + esc(p.title) + "</a></li>";
      }).join("") +
      "<li><a href=\"#/news\">News</a></li><li><a href=\"#/contact\">Contact</a></li></ul></div>" +
      "<div><h4>Contact</h4><ul>" +
      "<li><a href=\"tel:" + esc((s.phone || "").replace(/\s/g, "")) + "\">" + esc(s.phone) + "</a></li>" +
      "<li><a href=\"mailto:" + esc(s.email) + "\">" + esc(s.email) + "</a></li>" +
      "<li>" + esc(s.hours) + "</li></ul></div>";

    q("#footer-bar").innerHTML =
      "<span>© " + new Date().getFullYear() + " " + esc(s.legalName) + " · " + esc(s.regNo) + "</span>" +
      "<span><a href=\"admin/\">Staff login</a> · Mock build</span>";

    q("#rail").innerHTML =
      '<a href="tel:' + esc((s.phone || "").replace(/\s/g, "")) + '" title="Call">Call</a>' +
      '<a href="https://wa.me/' + esc(s.whatsapp) + '" title="WhatsApp" target="_blank" rel="noopener">WA</a>' +
      '<a href="mailto:' + esc(s.email) + '" title="Email">Mail</a>';
  }

  /* ---------- partials ---------- */

  function plate(p) {
    var c = S.categoryOf(data, p);
    return '<a class="plate" href="#/product/' + encodeURIComponent(p.sku) + '">' +
      '<img src="' + img(p, p.sku) + '" alt="' + esc(p.name) + '" loading="lazy">' +
      '<div class="plate__body"><span class="plate__sku">' + esc(p.sku) + "</span>" +
      "<h3>" + esc(p.name) + "</h3><p>" + esc(p.summary) + "</p>" +
      '<span class="plate__more">' + esc(c ? c.name : "Catalogue") + " →</span></div></a>";
  }

  function tile(c) {
    var n = S.productsIn(data, c.id).length;
    return '<a class="tile" href="#/products/' + esc(c.slug) + '">' +
      '<img src="' + img(c, c.code) + '" alt="' + esc(c.name) + '" loading="lazy">' +
      '<div class="tile__body"><span class="tile__code">' + esc(c.code) + "</span><h3>" + esc(c.name) + "</h3>" +
      "<p>" + esc(c.blurb) + '</p><span class="tile__n">' + n + " item" + (n === 1 ? "" : "s") + "</span></div></a>";
  }

  function postCard(n) {
    return '<a class="post" href="#/news/' + esc(n.slug) + '">' +
      '<img src="' + img(n, "NEWS") + '" alt="" loading="lazy">' +
      '<div class="post__body"><span class="post__date">' + esc(fmtDate(n.date)) + "</span>" +
      "<h3>" + esc(n.title) + "</h3><p>" + esc(n.excerpt) + "</p></div></a>";
  }

  function band() {
    var h = data.home;
    return '<section class="band"><div class="wrap"><div><h2>' + esc(h.ctaTitle) + "</h2><p>" + esc(h.ctaBody) + "</p></div>" +
      '<a class="btn" href="#/contact">Start an enquiry</a></div></section>';
  }

  /* ---------- routes ---------- */

  function home() {
    var h = data.home;
    var cats = pubCats();
    var featured = (h.featuredSkus || []).map(productBySku).filter(function (p) { return p && p.published; });
    if (!featured.length) featured = pubProducts().slice(0, 4);

    return '<section class="hero"><div class="wrap hero__grid"><div>' +
      '<p class="eyebrow">' + esc(h.heroEyebrow) + "</p><h1>" + esc(h.heroTitle) + "</h1>" +
      '<p class="hero__body">' + esc(h.heroBody) + "</p>" +
      '<div class="hero__actions"><a class="btn btn--light" href="' + esc(h.heroCtaUrl) + '">' + esc(h.heroCtaLabel) + "</a>" +
      '<a class="btn btn--ghost" href="' + esc(h.heroCtaAltUrl) + '">' + esc(h.heroCtaAltLabel) + "</a></div></div>" +
      '<div class="index-card"><div class="index-card__head"><span>Supply index</span><span>' + cats.length + " lines</span></div>" +
      cats.map(function (c) {
        return '<a class="index-row" href="#/products/' + esc(c.slug) + '">' +
          '<span class="index-row__code">' + esc(c.code) + "</span>" +
          '<span class="index-row__name">' + esc(c.name) + "</span>" +
          '<span class="index-row__n">' + S.productsIn(data, c.id).length + "</span></a>";
      }).join("") + "</div></div></section>" +

      '<section class="stats"><div class="wrap">' + (h.stats || []).map(function (s) {
        return '<div class="stat"><div class="stat__v">' + esc(s.value) + '</div><div class="stat__l">' + esc(s.label) + "</div></div>";
      }).join("") + "</div></section>" +

      '<section class="section"><div class="wrap"><div class="section__head"><div>' +
      '<p class="eyebrow">Why K2V</p><h2>' + esc(h.whyTitle) + "</h2></div>" +
      '<p class="lede">' + esc(h.whyBody) + "</p></div>" +
      '<div class="grid grid--4">' + (h.why || []).map(function (w) {
        return '<div class="why"><h3>' + esc(w.title) + "</h3><p>" + esc(w.body) + "</p></div>";
      }).join("") + "</div></div></section>" +

      '<section class="section section--tight" style="background:#fff;border-block:1px solid var(--line)"><div class="wrap">' +
      '<div class="section__head"><div><p class="eyebrow">Catalogue</p><h2>Nine supply lines</h2></div>' +
      '<a class="btn btn--ghost" href="#/products">See all products</a></div>' +
      '<div class="grid grid--3">' + cats.map(tile).join("") + "</div></div></section>" +

      '<section class="section"><div class="wrap"><div class="section__head"><div>' +
      '<p class="eyebrow">Fast moving</p><h2>Ordered every week</h2></div></div>' +
      '<div class="grid grid--4">' + featured.map(plate).join("") + "</div></div></section>" +

      (pubNews().length ? '<section class="section section--tight"><div class="wrap"><div class="section__head">' +
        '<div><p class="eyebrow">Updates</p><h2>Latest news</h2></div>' +
        '<a class="btn btn--ghost" href="#/news">All news</a></div>' +
        '<div class="grid grid--3">' + pubNews().slice(0, 3).map(postCard).join("") + "</div></div></section>" : "") +

      band();
  }

  function products(catSlug) {
    var cats = pubCats();
    var active = catSlug ? catBySlug(catSlug) : null;
    var list = pubProducts().filter(function (p) { return !active || p.categoryId === active.id; });

    return '<section class="section"><div class="wrap">' +
      '<p class="eyebrow">Catalogue</p><h1>' + esc(active ? active.name : "All products") + "</h1>" +
      '<p class="lede">' + esc(active ? active.blurb : "Every line K2V Enterprise supplies. Filter by category, then send the list you need priced.") + "</p>" +
      '<div class="filters" style="margin-top:30px">' +
      '<button data-cat="" class="' + (active ? "" : "is-active") + '">All (' + pubProducts().length + ")</button>" +
      cats.map(function (c) {
        return '<button data-cat="' + esc(c.slug) + '" class="' + (active && active.id === c.id ? "is-active" : "") + '">' +
          esc(c.name) + " (" + S.productsIn(data, c.id).length + ")</button>";
      }).join("") + "</div>" +
      (list.length ? '<div class="grid grid--4">' + list.map(plate).join("") + "</div>"
        : '<div class="empty">No published items in this category yet. Add one in /admin.</div>') +
      "</div></section>" + band();
  }

  function productDetail(sku) {
    var p = productBySku(sku);
    if (!p || !p.published) return notFound();
    var c = S.categoryOf(data, p);
    var related = pubProducts().filter(function (x) { return x.categoryId === p.categoryId && x.sku !== p.sku; }).slice(0, 4);

    return '<section class="section"><div class="wrap">' +
      '<p class="crumbs"><a href="#/products">Products</a> / ' +
      (c ? '<a href="#/products/' + esc(c.slug) + '">' + esc(c.name) + "</a> / " : "") + esc(p.sku) + "</p>" +
      '<div class="detail"><div><img src="' + img(p, p.sku) + '" alt="' + esc(p.name) + '" style="border:1px solid var(--line)"></div>' +
      "<div><h1 style=\"font-size:clamp(1.9rem,3.6vw,2.7rem)\">" + esc(p.name) + "</h1>" +
      '<p style="font-family:var(--mono);font-size:.8rem;letter-spacing:.06em;color:var(--amber-deep)">' + esc(p.sku) + "</p>" +
      '<p class="lede">' + esc(p.summary) + "</p>" +
      "<table class=\"spec-table\">" + (p.specs || []).map(function (row) {
        return "<tr><th>" + esc(row[0]) + "</th><td>" + esc(row[1]) + "</td></tr>";
      }).join("") + "</table>" +
      "<p>" + esc(p.description) + "</p>" +
      "<p>" + (p.tags || []).map(function (t) { return '<span class="tag">' + esc(t) + "</span>"; }).join("") + "</p>" +
      '<p style="margin-top:24px"><a class="btn" href="#/contact?sku=' + encodeURIComponent(p.sku) + '">Request a quote</a></p>' +
      "</div></div>" +
      (related.length ? '<div style="margin-top:70px"><h2 style="font-size:1.5rem">More in ' + esc(c ? c.name : "this range") + '</h2><div class="grid grid--4" style="margin-top:24px">' + related.map(plate).join("") + "</div></div>" : "") +
      "</div></section>" + band();
  }

  function newsIndex() {
    var list = pubNews();
    return '<section class="section"><div class="wrap"><p class="eyebrow">Updates</p><h1>News</h1>' +
      '<p class="lede">Stock arrivals, range changes and delivery notices.</p>' +
      '<div class="grid grid--3" style="margin-top:36px">' +
      (list.length ? list.map(postCard).join("") : '<div class="empty">No posts published yet.</div>') +
      "</div></div></section>" + band();
  }

  function newsDetail(slug) {
    var n = pubNews().filter(function (x) { return x.slug === slug; })[0];
    if (!n) return notFound();
    return '<section class="section"><div class="wrap">' +
      '<p class="crumbs"><a href="#/news">News</a> / ' + esc(fmtDate(n.date)) + "</p>" +
      "<h1>" + esc(n.title) + "</h1>" +
      '<img src="' + img(n, "NEWS") + '" alt="" style="border:1px solid var(--line);margin:26px 0 32px;max-height:420px;object-fit:cover;width:100%">' +
      '<div class="prose">' + n.body + "</div></div></section>" + band();
  }

  function pageDetail(slug) {
    var p = pageBySlug(slug);
    if (!p) return notFound();
    return '<section class="section"><div class="wrap"><p class="eyebrow">' + esc(data.site.name) + "</p>" +
      "<h1>" + esc(p.title) + '</h1><p class="lede">' + esc(p.intro) + "</p>" +
      '<div class="prose" style="margin-top:36px">' + p.body + "</div></div></section>" + band();
  }

  function contact(sku) {
    var s = data.site;
    return '<section class="section"><div class="wrap"><div class="grid grid--2" style="gap:clamp(32px,6vw,72px)">' +
      '<div><p class="eyebrow">Enquiries</p><h1>Send us the list.</h1>' +
      '<p class="lede">Part numbers, a photo of the packaging you are replacing, or a rough description. We come back with pricing, pack size and lead time.</p>' +
      '<table class="spec-table" style="margin-top:30px">' +
      "<tr><th>Email</th><td><a href=\"mailto:" + esc(s.email) + "\">" + esc(s.email) + "</a></td></tr>" +
      "<tr><th>Phone</th><td><a href=\"tel:" + esc((s.phone || "").replace(/\s/g, "")) + "\">" + esc(s.phone) + "</a></td></tr>" +
      "<tr><th>WhatsApp</th><td><a href=\"https://wa.me/" + esc(s.whatsapp) + "\" target=\"_blank\" rel=\"noopener\">+" + esc(s.whatsapp) + "</a></td></tr>" +
      "<tr><th>Location</th><td>" + esc(s.address) + "</td></tr>" +
      "<tr><th>Hours</th><td>" + esc(s.hours) + "</td></tr></table></div>" +
      '<div><form class="form" id="enquiry">' +
      field("Name", '<input name="name" required autocomplete="name">') +
      field("Company", '<input name="company" autocomplete="organization">') +
      field("Email", '<input name="email" type="email" required autocomplete="email">') +
      field("Phone", '<input name="phone" autocomplete="tel">') +
      field("Item of interest", '<input name="sku" value="' + esc(sku || "") + '" placeholder="e.g. K2V-SF-500">') +
      field("What do you need?", "<textarea name=\"message\" required placeholder=\"Quantities, sizes, delivery location…\"></textarea>") +
      '<div><button class="btn" type="submit">Send enquiry</button></div>' +
      '<p style="font-size:.8rem;color:var(--slate);margin:0">Mock form. Submissions are stored in this browser and appear in the admin inbox.</p>' +
      "</form><div id=\"enquiry-ok\"></div></div></div></div></section>";
  }

  function field(label, input) {
    return '<div class="field"><label>' + esc(label) + "</label>" + input + "</div>";
  }

  function notFound() {
    return '<section class="section"><div class="wrap"><p class="eyebrow">404</p><h1>Page not found</h1>' +
      '<p class="lede">That address does not match anything published.</p>' +
      '<p style="margin-top:24px"><a class="btn" href="#/">Back to home</a></p></div></section>';
  }

  /* ---------- router ---------- */

  function route() {
    var raw = (location.hash || "#/").slice(1);
    var qs = "";
    var qi = raw.indexOf("?");
    if (qi > -1) { qs = raw.slice(qi + 1); raw = raw.slice(0, qi); }
    var parts = raw.split("/").filter(Boolean);
    var html;

    if (!parts.length) html = home();
    else if (parts[0] === "products") html = products(parts[1]);
    else if (parts[0] === "product") html = productDetail(decodeURIComponent(parts[1] || ""));
    else if (parts[0] === "news") html = parts[1] ? newsDetail(parts[1]) : newsIndex();
    else if (parts[0] === "page") html = pageDetail(parts[1]);
    else if (parts[0] === "contact") html = contact(param(qs, "sku"));
    else html = notFound();

    view.innerHTML = html;
    renderChrome();
    window.scrollTo({ top: 0, behavior: "auto" });
    bind();
  }

  function param(qs, key) {
    var out = "";
    qs.split("&").forEach(function (pair) {
      var kv = pair.split("=");
      if (decodeURIComponent(kv[0] || "") === key) out = decodeURIComponent((kv[1] || "").replace(/\+/g, " "));
    });
    return out;
  }

  function bind() {
    view.querySelectorAll(".filters button").forEach(function (b) {
      b.addEventListener("click", function () {
        var c = b.getAttribute("data-cat");
        location.hash = c ? "#/products/" + c : "#/products";
      });
    });

    var form = document.getElementById("enquiry");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var fd = new FormData(form);
        var rec = { id: S.uid("enq"), at: new Date().toISOString(), status: "new" };
        fd.forEach(function (v, k) { rec[k] = String(v).slice(0, 2000); });
        data.enquiries.unshift(rec);
        S.save(data);
        form.style.display = "none";
        document.getElementById("enquiry-ok").innerHTML =
          '<div class="notice"><strong>Enquiry sent.</strong> We reply within one working day. ' +
          "It is now waiting in the admin inbox.</div>";
      });
    }
  }

  document.getElementById("burger").addEventListener("click", function () {
    var nav = document.getElementById("nav");
    var open = nav.classList.toggle("is-open");
    this.setAttribute("aria-expanded", open ? "true" : "false");
  });

  window.addEventListener("hashchange", function () {
    document.getElementById("nav").classList.remove("is-open");
    route();
  });

  /* pick up edits made in the admin tab without a refresh */
  window.addEventListener("storage", function (e) {
    if (e.key === "k2v_cms_content") { data = S.load(); route(); }
  });

  route();
})();
