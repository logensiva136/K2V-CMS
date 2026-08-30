/* K2V CMS mock — admin panel.
   Mock authentication and browser storage only. Real deployment moves this
   to Wagtail CRX: same content shapes, real users, real database. */
(function () {
  "use strict";

  var S = window.K2VStore;
  var esc = S.esc;
  var data = S.load();
  var app = document.getElementById("app");
  var SITE = "../index.html";

  /* ---------------- utilities ---------------- */

  function toast(msg, bad) {
    var t = document.createElement("div");
    t.className = "toast" + (bad ? " toast--bad" : "");
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 2400);
  }

  function persist(msg) { S.save(data); if (msg) toast(msg); }

  function go(hash) { location.hash = hash; }

  function field(label, inner, hint) {
    return '<div class="field"><label>' + esc(label) + "</label>" + inner +
      (hint ? '<div class="hint">' + esc(hint) + "</div>" : "") + "</div>";
  }
  function text(name, val, ph) {
    return '<input type="text" name="' + name + '" value="' + esc(val || "") + '" placeholder="' + esc(ph || "") + '">';
  }
  function area(name, val, rows) {
    return '<textarea name="' + name + '" rows="' + (rows || 5) + '">' + esc(val || "") + "</textarea>";
  }
  function check(name, val, label) {
    return '<label class="check"><input type="checkbox" name="' + name + '"' + (val ? " checked" : "") + "> " + esc(label) + "</label>";
  }
  function select(name, val, options) {
    return '<select name="' + name + '">' + options.map(function (o) {
      return '<option value="' + esc(o[0]) + '"' + (o[0] === val ? " selected" : "") + ">" + esc(o[1]) + "</option>";
    }).join("") + "</select>";
  }
  function pairs(id, rows, a, b) {
    return '<div id="' + id + '" data-repeat>' +
      (rows || []).map(function (r) { return pairRow(r[0], r[1], a, b); }).join("") +
      '</div><button type="button" class="btn btn--ghost btn--sm" data-add="' + id + '">Add row</button>';
  }
  function pairRow(v1, v2, a, b) {
    return '<div class="repeat-row"><input value="' + esc(v1 || "") + '" placeholder="' + esc(a) + '">' +
      '<input value="' + esc(v2 || "") + '" placeholder="' + esc(b) + '">' +
      '<button type="button" class="btn btn--danger btn--sm" data-drop>Remove</button></div>';
  }
  function readPairs(id) {
    var box = document.getElementById(id);
    if (!box) return [];
    return Array.prototype.slice.call(box.querySelectorAll(".repeat-row")).map(function (r) {
      var i = r.querySelectorAll("input");
      return [i[0].value.trim(), i[1].value.trim()];
    }).filter(function (p) { return p[0] || p[1]; });
  }
  function formValues(form) {
    var out = {};
    Array.prototype.slice.call(form.querySelectorAll("input,textarea,select")).forEach(function (el) {
      if (!el.name) return;
      out[el.name] = el.type === "checkbox" ? el.checked : el.value;
    });
    return out;
  }
  function statusPill(published) {
    return published ? '<span class="pill pill--live">Live</span>' : '<span class="pill pill--draft">Draft</span>';
  }

  /* ---------------- login ---------------- */

  function renderLogin() {
    app.innerHTML =
      '<div class="login"><div class="login__card"><div class="login__mark">K2V</div>' +
      "<h1>K2V CMS</h1><p class=\"muted small\">Mock admin. Demo credentials are <b>admin</b> / <b>k2v2026</b>.</p>" +
      '<form id="loginForm" style="margin-top:22px">' +
      field("Username", '<input type="text" name="u" autocomplete="username" autofocus>') +
      field("Password", '<input type="password" name="p" autocomplete="current-password">') +
      '<button class="btn" type="submit" style="width:100%;justify-content:center">Sign in</button>' +
      '</form><p class="small muted" style="margin-top:18px">This login is cosmetic — anyone with the URL can open it. ' +
      "Real access control comes with the Wagtail build.</p></div></div>";

    document.getElementById("loginForm").addEventListener("submit", function (e) {
      e.preventDefault();
      var v = formValues(this);
      if (S.login(v.u, v.p)) render();
      else toast("Wrong username or password", true);
    });
  }

  /* ---------------- shell ---------------- */

  var NAV = [
    ["Overview", [["", "Dashboard"]]],
    ["Catalogue", [["products", "Products"], ["categories", "Categories"]]],
    ["Content", [["pages", "Pages"], ["news", "News"], ["home", "Home page"]]],
    ["Configuration", [["nav", "Navigation"], ["settings", "Site settings"]]],
    ["Operations", [["enquiries", "Enquiries"], ["data", "Import / export"]]]
  ];

  function counts(key) {
    if (key === "products") return data.products.length;
    if (key === "categories") return data.categories.length;
    if (key === "pages") return data.pages.length;
    if (key === "news") return data.news.length;
    if (key === "enquiries") return data.enquiries.filter(function (e) { return e.status === "new"; }).length || "";
    return "";
  }

  function renderShell(section, body) {
    app.innerHTML =
      '<div class="shell"><aside class="side">' +
      '<div class="side__brand"><div class="side__mark">K2V</div><div>' +
      '<div class="side__title">K2V CMS</div><div class="side__sub">Mock build</div></div></div>' +
      NAV.map(function (g) {
        return '<div class="side__group">' + esc(g[0]) + "</div>" + g[1].map(function (item) {
          var active = (item[0] === section) ? " is-active" : "";
          var c = counts(item[0]);
          return '<a class="navlink' + active + '" href="#/' + item[0] + '">' + esc(item[1]) +
            (c ? '<span class="count">' + c + "</span>" : "") + "</a>";
        }).join("");
      }).join("") +
      '<div class="side__group">Session</div><a class="navlink" href="#" id="logout">Sign out</a>' +
      "</aside><div class=\"main\">" +
      '<div class="topbar"><div class="mono small muted">' + esc(data.site.name) +
      " · last saved " + esc(data.updatedAt ? new Date(data.updatedAt).toLocaleString() : "never") + "</div>" +
      '<div class="topbar__actions">' +
      '<a class="btn btn--ghost btn--sm" href="' + SITE + '" target="_blank" rel="noopener">View site</a>' +
      '<a class="btn btn--sm" href="#/data">Data</a></div></div>' +
      '<div class="workspace">' + body + "</div></div></div>";

    document.getElementById("logout").addEventListener("click", function (e) {
      e.preventDefault(); S.logout(); location.hash = "#/"; render();
    });
    wireRepeaters();
  }

  function wireRepeaters() {
    document.querySelectorAll("[data-add]").forEach(function (b) {
      b.addEventListener("click", function () {
        var box = document.getElementById(b.getAttribute("data-add"));
        var first = box.querySelector(".repeat-row input");
        var ph = box.querySelectorAll(".repeat-row input");
        var a = first ? first.placeholder : "Label";
        var bph = ph[1] ? ph[1].placeholder : "Value";
        box.insertAdjacentHTML("beforeend", pairRow("", "", a, bph));
        bindDrops();
      });
    });
    bindDrops();
  }
  function bindDrops() {
    document.querySelectorAll("[data-drop]").forEach(function (b) {
      b.onclick = function () { b.closest(".repeat-row").remove(); };
    });
  }

  /* ---------------- dashboard ---------------- */

  function dashboard() {
    var newEnq = data.enquiries.filter(function (e) { return e.status === "new"; }).length;
    var drafts = data.products.filter(function (p) { return !p.published; }).length;
    var body =
      "<h1>Dashboard</h1>" +
      '<p class="muted">Everything on the public site is edited from here. Changes are live the moment you save.</p>' +
      '<div class="banner">Content lives in this browser only. To publish for real, go to <b>Import / export</b>, ' +
      "download <code>content.json</code> and commit it to the repository.</div>" +
      '<div class="tiles">' +
      tileBox("#/products", data.products.length, "Products") +
      tileBox("#/categories", data.categories.length, "Categories") +
      tileBox("#/news", data.news.length, "News posts") +
      tileBox("#/enquiries", newEnq, "New enquiries") +
      "</div>" +
      '<div class="card"><div class="card__head"><h2>Quick actions</h2></div>' +
      '<div class="topbar__actions">' +
      '<a class="btn" href="#/products/new">Add a product</a>' +
      '<a class="btn btn--ghost" href="#/news/new">Write a news post</a>' +
      '<a class="btn btn--ghost" href="#/pages/new">Create a page</a>' +
      '<a class="btn btn--ghost" href="#/home">Edit the home page</a></div></div>' +
      (drafts ? '<div class="card"><div class="card__head"><h2>Waiting to publish</h2></div>' +
        '<p class="muted small">' + drafts + " product" + (drafts === 1 ? " is" : "s are") +
        " saved as a draft and not visible on the site.</p></div>" : "") +
      '<div class="card"><div class="card__head"><h2>Recent enquiries</h2><a class="btn btn--ghost btn--sm" href="#/enquiries">Open inbox</a></div>' +
      (data.enquiries.length ? enquiryTable(data.enquiries.slice(0, 5), false)
        : '<div class="empty">No enquiries yet. Submit the form on the public contact page to test it.</div>') +
      "</div>";
    renderShell("", body);
  }
  function tileBox(href, n, label) {
    return '<a class="tilebox" href="' + href + '"><b>' + n + "</b><span>" + esc(label) + "</span></a>";
  }

  /* ---------------- products ---------------- */

  function productList() {
    var rows = data.products.map(function (p) {
      var c = S.categoryOf(data, p);
      return "<tr><td><img class=\"thumb\" src=\"" + S.imageFor(p, p.sku) + "\" alt=\"\"></td>" +
        '<td class="mono small">' + esc(p.sku) + "</td>" +
        "<td><b>" + esc(p.name) + "</b><br><span class=\"small muted\">" + esc((p.summary || "").slice(0, 70)) + "</span></td>" +
        "<td>" + esc(c ? c.name : "—") + "</td>" +
        "<td>" + statusPill(p.published) + "</td>" +
        '<td><div class="row-actions">' +
        '<a class="btn btn--ghost btn--sm" href="#/products/edit/' + esc(p.id) + '">Edit</a>' +
        '<button class="btn btn--danger btn--sm" data-del="' + esc(p.id) + '">Delete</button></div></td></tr>';
    }).join("");

    renderShell("products",
      '<div class="card__head"><h1 style="margin:0">Products</h1>' +
      '<a class="btn" href="#/products/new">Add a product</a></div>' +
      '<p class="muted">' + data.products.length + " items across " + data.categories.length + " categories.</p>" +
      (data.products.length ?
        '<table class="list"><thead><tr><th></th><th>Code</th><th>Name</th><th>Category</th><th>Status</th><th></th></tr></thead><tbody>' +
        rows + "</tbody></table>" :
        '<div class="empty">No products yet. Add the first one.</div>'));

    bindDelete("products", "product");
  }

  function productForm(id) {
    var p = id ? data.products.filter(function (x) { return x.id === id; })[0] : null;
    var isNew = !p;
    if (!p) p = { id: "", sku: "", name: "", categoryId: (data.categories[0] || {}).id || "", summary: "", description: "", specs: [["", ""]], tags: [], image: "", published: true };

    var catOptions = data.categories.map(function (c) { return [c.id, c.name]; });

    renderShell("products",
      '<p class="mono small muted"><a href="#/products">Products</a> / ' + (isNew ? "New" : esc(p.sku)) + "</p>" +
      "<h1>" + (isNew ? "Add a product" : "Edit product") + "</h1>" +
      '<form id="f" class="card">' +
      '<div class="cols">' +
      field("Product name", text("name", p.name, "Hand Stretch Film 500mm")) +
      field("Product code", text("sku", p.sku, "K2V-SF-500"), "Shown on the card and used in the page address.") +
      "</div>" +
      '<div class="cols">' +
      field("Category", select("categoryId", p.categoryId, catOptions)) +
      field("Tags", text("tags", (p.tags || []).join(", "), "packaging, fast-moving"), "Separate with commas.") +
      "</div>" +
      field("Short summary", area("summary", p.summary, 2), "One line. Appears on the product card.") +
      field("Description", area("description", p.description, 5)) +
      field("Specifications", pairs("specs", p.specs && p.specs.length ? p.specs : [["", ""]], "Attribute", "Value")) +
      field("Image URL", text("image", p.image, "https://…"), "Leave blank to use the generated placeholder.") +
      field("Visibility", check("published", p.published, "Published — visible on the site")) +
      '<div class="formbar"><button class="btn" type="submit">Save product</button>' +
      '<a class="btn btn--ghost" href="#/products">Cancel</a>' +
      (isNew ? "" : '<button class="btn btn--danger" type="button" id="del">Delete</button>') +
      "</div></form>");

    document.getElementById("f").addEventListener("submit", function (e) {
      e.preventDefault();
      var v = formValues(this);
      if (!v.name.trim() || !v.sku.trim()) return toast("Name and product code are required", true);
      var clash = data.products.filter(function (x) { return x.sku === v.sku.trim() && x.id !== p.id; }).length;
      if (clash) return toast("That product code is already in use", true);

      var rec = {
        id: p.id || S.uid("prod"),
        sku: v.sku.trim(), name: v.name.trim(), categoryId: v.categoryId,
        summary: v.summary.trim(), description: v.description.trim(),
        specs: readPairs("specs"),
        tags: v.tags.split(",").map(function (t) { return t.trim(); }).filter(Boolean),
        image: v.image.trim(), published: !!v.published
      };
      if (isNew) data.products.push(rec);
      else data.products = data.products.map(function (x) { return x.id === p.id ? rec : x; });
      persist(isNew ? "Product added" : "Product saved");
      go("#/products");
    });

    var del = document.getElementById("del");
    if (del) del.addEventListener("click", function () {
      if (!confirm("Delete " + p.name + "? This cannot be undone.")) return;
      data.products = data.products.filter(function (x) { return x.id !== p.id; });
      persist("Product deleted"); go("#/products");
    });
  }

  /* ---------------- categories ---------------- */

  function categoryList() {
    var rows = data.categories.map(function (c) {
      return "<tr><td><img class=\"thumb\" src=\"" + S.imageFor(c, c.code) + "\" alt=\"\"></td>" +
        '<td class="mono small">' + esc(c.code) + "</td><td><b>" + esc(c.name) + "</b><br>" +
        '<span class="small muted">/' + esc(c.slug) + "</span></td>" +
        "<td>" + S.productsIn(data, c.id).length + "</td><td>" + statusPill(c.published) + "</td>" +
        '<td><div class="row-actions"><a class="btn btn--ghost btn--sm" href="#/categories/edit/' + esc(c.id) + '">Edit</a>' +
        '<button class="btn btn--danger btn--sm" data-del="' + esc(c.id) + '">Delete</button></div></td></tr>';
    }).join("");

    renderShell("categories",
      '<div class="card__head"><h1 style="margin:0">Categories</h1><a class="btn" href="#/categories/new">Add a category</a></div>' +
      '<p class="muted">Categories drive the supply index on the home page and the catalogue filters.</p>' +
      (data.categories.length ? '<table class="list"><thead><tr><th></th><th>Code</th><th>Name</th><th>Items</th><th>Status</th><th></th></tr></thead><tbody>' + rows + "</tbody></table>"
        : '<div class="empty">No categories yet.</div>'));

    bindDelete("categories", "category", function (id) {
      return data.products.filter(function (p) { return p.categoryId === id; }).length;
    });
  }

  function categoryForm(id) {
    var c = id ? data.categories.filter(function (x) { return x.id === id; })[0] : null;
    var isNew = !c;
    if (!c) c = { id: "", name: "", slug: "", code: "", blurb: "", image: "", published: true };

    renderShell("categories",
      '<p class="mono small muted"><a href="#/categories">Categories</a> / ' + (isNew ? "New" : esc(c.name)) + "</p>" +
      "<h1>" + (isNew ? "Add a category" : "Edit category") + "</h1>" +
      '<form id="f" class="card">' +
      '<div class="cols">' + field("Name", text("name", c.name, "Stretch Film")) +
      field("Short code", text("code", c.code, "SF"), "Two or three letters, shown in the supply index.") + "</div>" +
      field("Address slug", text("slug", c.slug, "stretch-film"), "Leave blank to generate from the name.") +
      field("Blurb", area("blurb", c.blurb, 2)) +
      field("Image URL", text("image", c.image, "https://…")) +
      field("Visibility", check("published", c.published, "Published")) +
      '<div class="formbar"><button class="btn" type="submit">Save category</button>' +
      '<a class="btn btn--ghost" href="#/categories">Cancel</a></div></form>');

    document.getElementById("f").addEventListener("submit", function (e) {
      e.preventDefault();
      var v = formValues(this);
      if (!v.name.trim()) return toast("Name is required", true);
      var rec = {
        id: c.id || S.uid("cat"), name: v.name.trim(),
        slug: S.slugify(v.slug || v.name), code: (v.code || v.name.slice(0, 2)).toUpperCase().trim(),
        blurb: v.blurb.trim(), image: v.image.trim(), published: !!v.published
      };
      if (isNew) data.categories.push(rec);
      else data.categories = data.categories.map(function (x) { return x.id === c.id ? rec : x; });
      persist(isNew ? "Category added" : "Category saved");
      go("#/categories");
    });
  }

  /* ---------------- pages ---------------- */

  function pageList() {
    var rows = data.pages.map(function (p) {
      return "<tr><td><b>" + esc(p.title) + "</b><br><span class=\"small muted\">#/page/" + esc(p.slug) + "</span></td>" +
        "<td>" + (p.showInNav ? '<span class="pill">In menu</span>' : "") + "</td>" +
        "<td>" + statusPill(p.published) + "</td>" +
        '<td><div class="row-actions"><a class="btn btn--ghost btn--sm" href="#/pages/edit/' + esc(p.id) + '">Edit</a>' +
        '<button class="btn btn--danger btn--sm" data-del="' + esc(p.id) + '">Delete</button></div></td></tr>';
    }).join("");

    renderShell("pages",
      '<div class="card__head"><h1 style="margin:0">Pages</h1><a class="btn" href="#/pages/new">Create a page</a></div>' +
      '<p class="muted">Standalone pages such as About and Services. Tick “Show in menu” to add one to the main navigation.</p>' +
      (data.pages.length ? '<table class="list"><thead><tr><th>Title</th><th>Menu</th><th>Status</th><th></th></tr></thead><tbody>' + rows + "</tbody></table>"
        : '<div class="empty">No pages yet.</div>'));

    bindDelete("pages", "page");
  }

  function pageForm(id) {
    var p = id ? data.pages.filter(function (x) { return x.id === id; })[0] : null;
    var isNew = !p;
    if (!p) p = { id: "", title: "", slug: "", intro: "", body: "<p></p>", showInNav: false, published: true };

    renderShell("pages",
      '<p class="mono small muted"><a href="#/pages">Pages</a> / ' + (isNew ? "New" : esc(p.title)) + "</p>" +
      "<h1>" + (isNew ? "Create a page" : "Edit page") + "</h1>" +
      '<form id="f" class="card">' +
      '<div class="cols">' + field("Title", text("title", p.title, "About us")) +
      field("Address slug", text("slug", p.slug, "about-us"), "Leave blank to generate from the title.") + "</div>" +
      field("Intro", area("intro", p.intro, 2), "One sentence under the heading.") +
      field("Body", area("body", p.body, 14), "Basic HTML: <p>, <h3>, <ul>, <li>, <strong>, <a href>.") +
      field("Menu", check("showInNav", p.showInNav, "Show in the main menu")) +
      field("Visibility", check("published", p.published, "Published")) +
      '<div class="formbar"><button class="btn" type="submit">Save page</button>' +
      '<a class="btn btn--ghost" href="#/pages">Cancel</a></div></form>');

    document.getElementById("f").addEventListener("submit", function (e) {
      e.preventDefault();
      var v = formValues(this);
      if (!v.title.trim()) return toast("Title is required", true);
      var rec = {
        id: p.id || S.uid("page"), title: v.title.trim(), slug: S.slugify(v.slug || v.title),
        intro: v.intro.trim(), body: v.body, showInNav: !!v.showInNav, published: !!v.published
      };
      if (isNew) data.pages.push(rec);
      else data.pages = data.pages.map(function (x) { return x.id === p.id ? rec : x; });
      persist(isNew ? "Page created" : "Page saved");
      go("#/pages");
    });
  }

  /* ---------------- news ---------------- */

  function newsList() {
    var rows = data.news.slice().sort(function (a, b) { return (b.date || "").localeCompare(a.date || ""); })
      .map(function (n) {
        return "<tr><td><img class=\"thumb\" src=\"" + S.imageFor(n, "NEWS") + "\" alt=\"\"></td>" +
          '<td class="mono small">' + esc(n.date) + "</td>" +
          "<td><b>" + esc(n.title) + "</b><br><span class=\"small muted\">" + esc((n.excerpt || "").slice(0, 70)) + "</span></td>" +
          "<td>" + statusPill(n.published) + "</td>" +
          '<td><div class="row-actions"><a class="btn btn--ghost btn--sm" href="#/news/edit/' + esc(n.id) + '">Edit</a>' +
          '<button class="btn btn--danger btn--sm" data-del="' + esc(n.id) + '">Delete</button></div></td></tr>';
      }).join("");

    renderShell("news",
      '<div class="card__head"><h1 style="margin:0">News</h1><a class="btn" href="#/news/new">Write a post</a></div>' +
      '<p class="muted">Stock arrivals, range changes, delivery notices.</p>' +
      (data.news.length ? '<table class="list"><thead><tr><th></th><th>Date</th><th>Title</th><th>Status</th><th></th></tr></thead><tbody>' + rows + "</tbody></table>"
        : '<div class="empty">No posts yet.</div>'));

    bindDelete("news", "post");
  }

  function newsForm(id) {
    var n = id ? data.news.filter(function (x) { return x.id === id; })[0] : null;
    var isNew = !n;
    if (!n) n = { id: "", title: "", slug: "", date: new Date().toISOString().slice(0, 10), excerpt: "", body: "<p></p>", image: "", published: true };

    renderShell("news",
      '<p class="mono small muted"><a href="#/news">News</a> / ' + (isNew ? "New" : esc(n.title)) + "</p>" +
      "<h1>" + (isNew ? "Write a post" : "Edit post") + "</h1>" +
      '<form id="f" class="card">' +
      '<div class="cols">' + field("Title", text("title", n.title)) +
      field("Date", '<input type="date" name="date" value="' + esc(n.date) + '">') + "</div>" +
      field("Address slug", text("slug", n.slug), "Leave blank to generate from the title.") +
      field("Excerpt", area("excerpt", n.excerpt, 2)) +
      field("Body", area("body", n.body, 12), "Basic HTML.") +
      field("Image URL", text("image", n.image, "https://…")) +
      field("Visibility", check("published", n.published, "Published")) +
      '<div class="formbar"><button class="btn" type="submit">Save post</button>' +
      '<a class="btn btn--ghost" href="#/news">Cancel</a></div></form>');

    document.getElementById("f").addEventListener("submit", function (e) {
      e.preventDefault();
      var v = formValues(this);
      if (!v.title.trim()) return toast("Title is required", true);
      var rec = {
        id: n.id || S.uid("news"), title: v.title.trim(), slug: S.slugify(v.slug || v.title),
        date: v.date, excerpt: v.excerpt.trim(), body: v.body, image: v.image.trim(), published: !!v.published
      };
      if (isNew) data.news.unshift(rec);
      else data.news = data.news.map(function (x) { return x.id === n.id ? rec : x; });
      persist(isNew ? "Post published" : "Post saved");
      go("#/news");
    });
  }

  /* ---------------- home page ---------------- */

  function homeForm() {
    var h = data.home;
    renderShell("home",
      "<h1>Home page</h1><p class=\"muted\">The hero, the numbers strip, the reasons block and the call to action.</p>" +
      '<form id="f"><div class="card"><div class="card__head"><h2>Hero</h2></div>' +
      field("Eyebrow", text("heroEyebrow", h.heroEyebrow)) +
      field("Headline", area("heroTitle", h.heroTitle, 2)) +
      field("Supporting text", area("heroBody", h.heroBody, 3)) +
      '<div class="cols">' + field("Primary button label", text("heroCtaLabel", h.heroCtaLabel)) +
      field("Primary button link", text("heroCtaUrl", h.heroCtaUrl)) + "</div>" +
      '<div class="cols">' + field("Secondary button label", text("heroCtaAltLabel", h.heroCtaAltLabel)) +
      field("Secondary button link", text("heroCtaAltUrl", h.heroCtaAltUrl)) + "</div>" +
      field("Featured product codes", text("featuredSkus", (h.featuredSkus || []).join(", ")), "Comma separated. Falls back to the first four products if left blank.") +
      "</div>" +
      '<div class="card"><div class="card__head"><h2>Numbers strip</h2></div>' +
      pairs("stats", (h.stats || []).map(function (s) { return [s.value, s.label]; }), "Value", "Label") + "</div>" +
      '<div class="card"><div class="card__head"><h2>Reasons block</h2></div>' +
      field("Heading", text("whyTitle", h.whyTitle)) +
      field("Intro", area("whyBody", h.whyBody, 2)) +
      pairs("why", (h.why || []).map(function (w) { return [w.title, w.body]; }), "Heading", "Body") + "</div>" +
      '<div class="card"><div class="card__head"><h2>Call to action</h2></div>' +
      field("Heading", text("ctaTitle", h.ctaTitle)) +
      field("Body", area("ctaBody", h.ctaBody, 2)) + "</div>" +
      '<div class="formbar"><button class="btn" type="submit">Save home page</button>' +
      '<a class="btn btn--ghost" href="' + SITE + '" target="_blank" rel="noopener">Preview site</a></div></form>');

    document.getElementById("f").addEventListener("submit", function (e) {
      e.preventDefault();
      var v = formValues(this);
      data.home = {
        heroEyebrow: v.heroEyebrow, heroTitle: v.heroTitle, heroBody: v.heroBody,
        heroCtaLabel: v.heroCtaLabel, heroCtaUrl: v.heroCtaUrl,
        heroCtaAltLabel: v.heroCtaAltLabel, heroCtaAltUrl: v.heroCtaAltUrl,
        stats: readPairs("stats").map(function (r) { return { value: r[0], label: r[1] }; }),
        whyTitle: v.whyTitle, whyBody: v.whyBody,
        why: readPairs("why").map(function (r) { return { title: r[0], body: r[1] }; }),
        ctaTitle: v.ctaTitle, ctaBody: v.ctaBody,
        featuredSkus: v.featuredSkus.split(",").map(function (s) { return s.trim(); }).filter(Boolean)
      };
      persist("Home page saved");
      homeForm();
    });
  }

  /* ---------------- navigation ---------------- */

  function navForm() {
    renderShell("nav",
      "<h1>Navigation</h1><p class=\"muted\">The main menu. Pages ticked as “Show in menu” are appended automatically.</p>" +
      '<form id="f" class="card">' +
      field("Menu items", pairs("navrows", data.nav.map(function (n) { return [n.label, n.url]; }), "Label", "Link"),
        "Links: #/ for home, #/products, #/news, #/contact, #/page/your-slug, or a full https:// address.") +
      '<div class="formbar"><button class="btn" type="submit">Save menu</button></div></form>');

    document.getElementById("f").addEventListener("submit", function (e) {
      e.preventDefault();
      data.nav = readPairs("navrows").map(function (r, i) {
        return { id: "n" + (i + 1), label: r[0], url: r[1] || "#/", showInNav: true };
      });
      persist("Menu saved");
      navForm();
    });
  }

  /* ---------------- site settings ---------------- */

  function settingsForm() {
    var s = data.site;
    renderShell("settings",
      "<h1>Site settings</h1><p class=\"muted\">Business details used across the header, footer and contact page.</p>" +
      '<form id="f"><div class="card"><div class="card__head"><h2>Identity</h2></div>' +
      '<div class="cols">' + field("Site name", text("name", s.name)) + field("Logo text", text("mark", s.mark), "Three characters or fewer.") + "</div>" +
      '<div class="cols">' + field("Legal name", text("legalName", s.legalName)) + field("Registration number", text("regNo", s.regNo)) + "</div>" +
      field("Tagline", text("tagline", s.tagline)) +
      field("Footer blurb", area("footerBlurb", s.footerBlurb, 2)) + "</div>" +
      '<div class="card"><div class="card__head"><h2>Contact</h2></div>' +
      '<div class="cols">' + field("Email", '<input type="email" name="email" value="' + esc(s.email) + '">') +
      field("Phone", text("phone", s.phone)) + "</div>" +
      '<div class="cols">' + field("WhatsApp number", text("whatsapp", s.whatsapp), "Digits only, with country code.") +
      field("Opening hours", text("hours", s.hours)) + "</div>" +
      field("Location", text("address", s.address)) +
      field("Location note", text("addressNote", s.addressNote)) + "</div>" +
      '<div class="formbar"><button class="btn" type="submit">Save settings</button></div></form>');

    document.getElementById("f").addEventListener("submit", function (e) {
      e.preventDefault();
      var v = formValues(this);
      Object.keys(v).forEach(function (k) { data.site[k] = v[k]; });
      persist("Settings saved");
      settingsForm();
    });
  }

  /* ---------------- enquiries ---------------- */

  function enquiryTable(list, actions) {
    return '<table class="list"><thead><tr><th>Received</th><th>From</th><th>Item</th><th>Message</th>' +
      (actions ? "<th></th>" : "") + "</tr></thead><tbody>" +
      list.map(function (e) {
        return "<tr><td class=\"mono small\">" + esc(new Date(e.at).toLocaleString()) +
          (e.status === "new" ? ' <span class="pill pill--new">New</span>' : "") + "</td>" +
          "<td><b>" + esc(e.name || "—") + "</b><br><span class=\"small muted\">" + esc(e.company || "") + "<br>" +
          esc(e.email || "") + " " + esc(e.phone || "") + "</span></td>" +
          '<td class="mono small">' + esc(e.sku || "—") + "</td>" +
          '<td class="small">' + esc((e.message || "").slice(0, 140)) + "</td>" +
          (actions ? '<td><div class="row-actions">' +
            (e.status === "new" ? '<button class="btn btn--ghost btn--sm" data-read="' + esc(e.id) + '">Mark read</button>' : "") +
            '<button class="btn btn--danger btn--sm" data-del="' + esc(e.id) + '">Delete</button></div></td>' : "") +
          "</tr>";
      }).join("") + "</tbody></table>";
  }

  function enquiryList() {
    renderShell("enquiries",
      '<div class="card__head"><h1 style="margin:0">Enquiries</h1>' +
      (data.enquiries.length ? '<button class="btn btn--danger btn--sm" id="clear">Clear all</button>' : "") + "</div>" +
      '<p class="muted">Submissions from the public contact form. In the live build these also go to ' + esc(data.site.email) + ".</p>" +
      (data.enquiries.length ? enquiryTable(data.enquiries, true)
        : '<div class="empty">Inbox empty. Send a test enquiry from the contact page.</div>'));

    document.querySelectorAll("[data-read]").forEach(function (b) {
      b.addEventListener("click", function () {
        var id = b.getAttribute("data-read");
        data.enquiries = data.enquiries.map(function (e) { return e.id === id ? Object.assign({}, e, { status: "read" }) : e; });
        persist("Marked as read"); enquiryList();
      });
    });
    document.querySelectorAll("[data-del]").forEach(function (b) {
      b.addEventListener("click", function () {
        data.enquiries = data.enquiries.filter(function (e) { return e.id !== b.getAttribute("data-del"); });
        persist("Enquiry deleted"); enquiryList();
      });
    });
    var clear = document.getElementById("clear");
    if (clear) clear.addEventListener("click", function () {
      if (!confirm("Delete every enquiry?")) return;
      data.enquiries = []; persist("Inbox cleared"); enquiryList();
    });
  }

  /* ---------------- import / export ---------------- */

  function dataView() {
    renderShell("data",
      "<h1>Import / export</h1>" +
      '<p class="muted">This mock keeps content in your browser. Export it to move it between machines, hand it to a developer, or commit it as the site\'s starting content.</p>' +
      '<div class="card"><div class="card__head"><h2>Export</h2></div>' +
      '<p class="small muted">Downloads <code>content.json</code> — the whole site as structured data. This file is what gets loaded into Wagtail CRX at build time.</p>' +
      '<div class="topbar__actions"><button class="btn" id="dl">Download content.json</button>' +
      '<button class="btn btn--ghost" id="copy">Copy to clipboard</button></div></div>' +
      '<div class="card"><div class="card__head"><h2>Import</h2></div>' +
      '<p class="small muted">Replaces everything currently stored. Take an export first if you want a way back.</p>' +
      '<input type="file" id="file" accept="application/json"></div>' +
      '<div class="card"><div class="card__head"><h2>Reset</h2></div>' +
      '<p class="small muted">Discards your edits and restores the demo content that ships with the repository.</p>' +
      '<button class="btn btn--danger" id="reset">Reset to demo content</button></div>' +
      '<div class="card"><div class="card__head"><h2>Where this goes next</h2></div>' +
      '<table class="list"><thead><tr><th>Mock</th><th>Wagtail CRX</th></tr></thead><tbody>' +
      [["site", "Website settings / Branding"],
       ["home", "ArticlePage with hero, card and button blocks"],
       ["pages", "ArticlePage under the home page"],
       ["categories", "ArticleIndexPage / product category"],
       ["products", "Product page type with a spec table block"],
       ["news", "ArticlePage under a News index"],
       ["enquiries", "Form page submissions"],
       ["nav", "Navbar snippet"]].map(function (r) {
        return '<tr><td class="mono small">' + r[0] + "</td><td>" + esc(r[1]) + "</td></tr>";
      }).join("") + "</tbody></table></div>");

    document.getElementById("dl").addEventListener("click", function () {
      var blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "content.json";
      a.click();
      URL.revokeObjectURL(a.href);
      toast("content.json downloaded");
    });

    document.getElementById("copy").addEventListener("click", function () {
      var txt = JSON.stringify(data, null, 2);
      if (navigator.clipboard) navigator.clipboard.writeText(txt).then(function () { toast("Copied"); },
        function () { toast("Copy blocked by the browser", true); });
      else toast("Clipboard unavailable in this browser", true);
    });

    document.getElementById("file").addEventListener("change", function (e) {
      var f = e.target.files[0];
      if (!f) return;
      var r = new FileReader();
      r.onload = function () {
        try {
          var parsed = JSON.parse(r.result);
          if (!parsed.products || !parsed.site) throw new Error("shape");
          data = parsed; persist("Content imported"); dataView();
        } catch (err) {
          toast("That file is not valid K2V content", true);
        }
      };
      r.readAsText(f);
    });

    document.getElementById("reset").addEventListener("click", function () {
      if (!confirm("Discard all edits and restore the demo content?")) return;
      data = S.reset(); persist("Reset to demo content"); dataView();
    });
  }

  /* ---------------- delete binding shared by list views ---------------- */

  function bindDelete(key, noun, blockedCount) {
    document.querySelectorAll("[data-del]").forEach(function (b) {
      b.addEventListener("click", function () {
        var id = b.getAttribute("data-del");
        if (blockedCount) {
          var n = blockedCount(id);
          if (n) return toast("Move the " + n + " item" + (n === 1 ? "" : "s") + " in this category first", true);
        }
        if (!confirm("Delete this " + noun + "?")) return;
        data[key] = data[key].filter(function (x) { return x.id !== id; });
        persist(noun.charAt(0).toUpperCase() + noun.slice(1) + " deleted");
        render();
      });
    });
  }

  /* ---------------- router ---------------- */

  function render() {
    if (!S.session()) return renderLogin();
    var parts = (location.hash || "#/").slice(1).split("/").filter(Boolean);
    var s = parts[0] || "";
    var mode = parts[1] || "";
    var id = parts[2] || "";

    if (s === "products") return mode === "new" ? productForm(null) : mode === "edit" ? productForm(id) : productList();
    if (s === "categories") return mode === "new" ? categoryForm(null) : mode === "edit" ? categoryForm(id) : categoryList();
    if (s === "pages") return mode === "new" ? pageForm(null) : mode === "edit" ? pageForm(id) : pageList();
    if (s === "news") return mode === "new" ? newsForm(null) : mode === "edit" ? newsForm(id) : newsList();
    if (s === "home") return homeForm();
    if (s === "nav") return navForm();
    if (s === "settings") return settingsForm();
    if (s === "enquiries") return enquiryList();
    if (s === "data") return dataView();
    return dashboard();
  }

  window.addEventListener("hashchange", render);
  render();
})();
