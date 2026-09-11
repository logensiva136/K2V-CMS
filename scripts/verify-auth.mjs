// Headless check of the admin auth flow (AuthGate: no-backend fallback,
// onboarding, login, lockout, logout) against an in-memory fake /api backend
// implementing the contract documented in README.md.
import { build } from "esbuild";
import { JSDOM } from "jsdom";
import { writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const results = [];
const check = (name, cond) => {
  results.push({ name, ok: !!cond });
  console.log(`${cond ? "PASS" : "FAIL"}  ${name}`);
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const dom = new JSDOM("<!doctype html><html><body><div id='app'></div></body></html>", {
  url: "http://localhost/admin/",
  pretendToBeVisual: true,
});
const { window } = dom;
for (const k of ["window", "document", "HTMLElement", "HTMLInputElement", "Node", "Event", "getComputedStyle", "requestAnimationFrame", "cancelAnimationFrame"]) {
  try { globalThis[k] = window[k]; } catch { /* getter-only global */ }
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
window.scrollTo = () => {};

/* ---- fake backend, in-memory, implements the /api contract from README ---- */
let adminUser = null;
let sessionActive = false;
let contentStore = null;
let loginAttempts = 0;

function jsonResponse(status, data) {
  return { ok: status >= 200 && status < 300, status, json: async () => data };
}

window.fetch = globalThis.fetch = async (url, opts = {}) => {
  const path = String(url).replace(/^https?:\/\/[^/]+/, "").replace(/^\/api/, "");
  const method = opts.method || "GET";
  const body = opts.body ? JSON.parse(opts.body) : null;

  if (path === "/auth/status" && method === "GET") return jsonResponse(200, { hasAdmin: !!adminUser, authenticated: sessionActive });
  if (path === "/auth/setup" && method === "POST") {
    if (adminUser) return jsonResponse(400, { error: "Admin already exists" });
    adminUser = { username: body.username, password: body.password };
    sessionActive = true;
    return jsonResponse(200, { ok: true });
  }
  if (path === "/auth/login" && method === "POST") {
    loginAttempts++;
    if (!adminUser || adminUser.username !== body.username || adminUser.password !== body.password) {
      return jsonResponse(401, { error: "Invalid credentials" });
    }
    sessionActive = true;
    return jsonResponse(200, { ok: true });
  }
  if (path === "/auth/logout" && method === "POST") {
    sessionActive = false;
    return jsonResponse(200, { ok: true });
  }
  if (path === "/content" && method === "GET") return contentStore ? jsonResponse(200, contentStore) : jsonResponse(404, {});
  if (path === "/content" && method === "POST") {
    if (!sessionActive) return jsonResponse(401, { error: "Not logged in" });
    contentStore = body;
    return jsonResponse(200, { ok: true });
  }
  return jsonResponse(404, { error: "not found" });
};

const entry = `
export { default as React } from "react";
export { act } from "react";
export { createRoot } from "react-dom/client";
export { AuthGate } from "${root.replace(/\\/g, "/")}/src/admin/auth.jsx";
export { Admin } from "${root.replace(/\\/g, "/")}/src/admin/Admin.jsx";
`;

const out = await build({
  stdin: { contents: entry, resolveDir: root, loader: "js" },
  bundle: true, format: "cjs", platform: "node", jsx: "automatic",
  packages: "external", write: false,
  loader: { ".js": "jsx", ".jsx": "jsx", ".css": "empty" },
});
const bundlePath = resolve(root, "node_modules/.cache/_verify_auth_bundle.cjs");
writeFileSync(bundlePath, out.outputFiles[0].text);
const { React, act, createRoot, AuthGate, Admin } = createRequire(resolve(root, "package.json"))(bundlePath);

const app = document.getElementById("app");
let root_ = createRoot(app);

// Simulates a fresh page load: unmount + a new root, so AuthGate's effect
// re-runs and no component-local state (lockout timers etc.) leaks between
// "visits" the way it would if we just re-rendered onto the same root.
async function freshMount() {
  await act(async () => { root_.unmount(); });
  root_ = createRoot(app);
  await act(async () => { root_.render(React.createElement(AuthGate, null, React.createElement(Admin))); });
  await act(async () => { await sleep(10); });
}

function setVal(input, value) {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
  setter.call(input, value);
  input.dispatchEvent(new window.Event("input", { bubbles: true }));
}
const q = (sel) => app.querySelector(sel);
const qa = (sel) => [...app.querySelectorAll(sel)];
const submit = async () => {
  await act(async () => {
    q("form").dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true }));
  });
};

// 1. No admin yet -> should show the onboarding/setup screen
await freshMount();
check("no admin yet -> setup screen shown", /Set up the admin account/.test(app.textContent));

// weak password rejected client-side
setVal(qa('input[type="text"]')[0], "owner");
setVal(qa('input[type="password"]')[0], "short");
setVal(qa('input[type="password"]')[1], "short");
await submit();
check("setup rejects a short password", /at least 8 characters/i.test(app.textContent));

// create the account for real
setVal(qa('input[type="text"]')[0], "owner");
setVal(qa('input[type="password"]')[0], "correct horse battery");
setVal(qa('input[type="password"]')[1], "correct horse battery");
await submit();
await act(async () => { await sleep(10); });
check("setup with a valid password logs in and shows the CMS", /Theme &amp; colours|Theme & colours/.test(app.textContent) && !!q(".cms"));
check("setup only runs once (admin now exists)", !!adminUser);

// 2. Log out -> back to login screen
const logoutBtn = qa("button").find((b) => /Log out/.test(b.textContent));
check("logout button present once authenticated", !!logoutBtn);
await act(async () => { logoutBtn.dispatchEvent(new window.Event("click", { bubbles: true })); });
await act(async () => { await sleep(10); });
check("logout returns to the login screen", /^Log in$/m.test(app.querySelector("h1")?.textContent || "") || /Log in/.test(app.textContent));

// 3. Wrong password -> error, no session
setVal(qa('input[type="text"]')[0], "owner");
setVal(qa('input[type="password"]')[0], "wrong-password");
await submit();
await act(async () => { await sleep(10); });
check("wrong password shows an error and does not log in", /Incorrect username or password/.test(app.textContent) && !sessionActive);

// 4. Lock out after repeated failures
for (let i = 0; i < 4; i++) {
  setVal(qa('input[type="text"]')[0], "owner");
  setVal(qa('input[type="password"]')[0], "still-wrong");
  await submit();
  await act(async () => { await sleep(10); });
}
check("repeated failed logins lock the form", /Too many attempts/.test(app.textContent) && qa('button[type="submit"]')[0]?.disabled === true);

// 5. A fresh page load clears the client-side lockout; correct creds log in
await freshMount();
setVal(qa('input[type="text"]')[0], "owner");
setVal(qa('input[type="password"]')[0], "correct horse battery");
await submit();
await act(async () => { await sleep(10); });
check("correct credentials log back in", !!q(".cms") && !!qa("button").find((b) => /Log out/.test(b.textContent)));

// 6. No backend at all (simulate GitHub Pages / no /api deployed) -> falls back to local-only, doesn't lock the editor out
window.fetch = globalThis.fetch = async () => jsonResponse(404, {});
await freshMount();
check("no backend -> falls back to local-only mode instead of locking out", !!q(".cms") && /local-only mode/.test(app.textContent));

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
