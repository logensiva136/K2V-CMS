/* K2V CMS mock — content store.
   Persists to localStorage. Falls back to memory if storage is blocked
   (private mode, sandboxed preview) so nothing hard-fails.
   Swap this file for real API calls when moving to Wagtail CRX. */
(function (global) {
  "use strict";

  var KEY = "k2v_cms_content";
  var SESSION_KEY = "k2v_cms_session";
  var mem = {};

  var safe = {
    get: function (k) { try { return global.localStorage.getItem(k); } catch (e) { return k in mem ? mem[k] : null; } },
    set: function (k, v) { try { global.localStorage.setItem(k, v); } catch (e) { mem[k] = v; } },
    del: function (k) { try { global.localStorage.removeItem(k); } catch (e) { delete mem[k]; } }
  };

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function uid(prefix) {
    return (prefix || "id") + "-" + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-3);
  }

  function slugify(s) {
    return String(s || "").toLowerCase().trim()
      .replace(/['"]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "").slice(0, 60) || uid("page");
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  /* Deterministic SVG placeholder so the mock never shows a broken image.
     Admin can paste a real image URL on any record to override it. */
  function placeholder(label, code) {
    var hues = ["#F2A413", "#2E7D8F", "#C8352B", "#5B6C4F", "#7A5C9E", "#B36A2E"];
    var seed = 0, s = String(label || "K2V");
    for (var i = 0; i < s.length; i++) seed = (seed * 31 + s.charCodeAt(i)) % 997;
    var accent = hues[seed % hues.length];
    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 360">' +
      '<rect width="480" height="360" fill="#151C24"/>' +
      '<g opacity="0.14">' +
      '<path d="M-120 360 L120 0 M-40 360 L200 0 M40 360 L280 0 M120 360 L360 0 M200 360 L440 0 M280 360 L520 0 M360 360 L600 0" stroke="' + accent + '" stroke-width="26"/>' +
      '</g>' +
      '<rect x="24" y="24" width="432" height="312" fill="none" stroke="' + accent + '" stroke-opacity="0.45" stroke-width="2"/>' +
      '<text x="44" y="70" font-family="ui-monospace,Menlo,monospace" font-size="17" letter-spacing="2" fill="' + accent + '">' + esc(code || "K2V") + '</text>' +
      '<text x="44" y="315" font-family="Helvetica,Arial,sans-serif" font-weight="700" font-size="26" fill="#F4F5F2">' + esc((label || "").slice(0, 26)) + '</text>' +
      '</svg>';
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }

  var Store = {
    uid: uid, slugify: slugify, esc: esc, clone: clone, placeholder: placeholder,

    load: function () {
      var raw = safe.get(KEY);
      if (raw) {
        try {
          var d = JSON.parse(raw);
          if (d && d.version === global.K2V_SEED.version) return d;
        } catch (e) { /* corrupt payload — fall through to seed */ }
      }
      return clone(global.K2V_SEED);
    },

    save: function (data) {
      data.updatedAt = new Date().toISOString();
      safe.set(KEY, JSON.stringify(data));
      return data;
    },

    reset: function () { safe.del(KEY); return clone(global.K2V_SEED); },

    isDirty: function () { return !!safe.get(KEY); },

    /* Session is mock only — see README. Never use this pattern for real auth. */
    login: function (user, pass) {
      if (user === "admin" && pass === "k2v2026") {
        safe.set(SESSION_KEY, JSON.stringify({ user: user, at: Date.now() }));
        return true;
      }
      return false;
    },
    logout: function () { safe.del(SESSION_KEY); },
    session: function () {
      try { return JSON.parse(safe.get(SESSION_KEY) || "null"); } catch (e) { return null; }
    },

    /* --- read helpers shared by site and admin --- */
    categoryOf: function (data, product) {
      return data.categories.filter(function (c) { return c.id === product.categoryId; })[0] || null;
    },
    productsIn: function (data, categoryId) {
      return data.products.filter(function (p) { return p.published && p.categoryId === categoryId; });
    },
    imageFor: function (rec, code) {
      return rec && rec.image ? rec.image : placeholder(rec ? (rec.name || rec.title) : "K2V", code);
    }
  };

  global.K2VStore = Store;
})(window);
