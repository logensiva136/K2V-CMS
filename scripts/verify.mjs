// Headless integration check of the CMS loop (no browser available).
// Bundles the app with esbuild and drives it inside jsdom:
//   render public -> edit via store -> assert public updates -> route to products
//   -> render admin -> type in a field -> assert store + public update.
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

const dom = new JSDOM("<!doctype html><html><body><div id='pub'></div><div id='adm'></div></body></html>", {
  url: "http://localhost/",
  pretendToBeVisual: true,
});
const { window } = dom;
for (const k of ["window", "document", "HTMLElement", "HTMLInputElement", "Node", "Event", "CustomEvent", "HashChangeEvent", "localStorage", "FileReader", "getComputedStyle", "requestAnimationFrame", "cancelAnimationFrame"]) {
  try { globalThis[k] = window[k]; } catch { /* getter-only global */ }
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
window.scrollTo = () => {};
window.Element.prototype.scrollIntoView = () => {};

const entry = `
export { default as React } from "react";
export { act } from "react";
export { createRoot } from "react-dom/client";
export { App } from "${root.replace(/\\/g, "/")}/src/public/App.jsx";
export { Admin } from "${root.replace(/\\/g, "/")}/src/admin/Admin.jsx";
export * as store from "${root.replace(/\\/g, "/")}/src/store.js";
`;

const out = await build({
  stdin: { contents: entry, resolveDir: root, loader: "js" },
  bundle: true, format: "cjs", platform: "node", jsx: "automatic",
  packages: "external", write: false,
  loader: { ".js": "jsx", ".jsx": "jsx", ".css": "empty" },
});
const bundlePath = resolve(root, "node_modules/.cache/_verify_bundle.cjs");
writeFileSync(bundlePath, out.outputFiles[0].text);
const { React, act, createRoot, App, Admin, store } = createRequire(resolve(root, "package.json"))(bundlePath);

const pub = createRoot(document.getElementById("pub"));
const adm = createRoot(document.getElementById("adm"));
const pubEl = document.getElementById("pub");
const admEl = document.getElementById("adm");

await act(async () => { pub.render(React.createElement(App)); });
check("public renders hero body", /one supplier, one purchase order/i.test(pubEl.textContent));
check("public renders a featured category card", /Bubble Wrap/.test(pubEl.textContent));
check("theme var applied to :root", document.documentElement.style.getPropertyValue("--navy") === "#123c70");

await act(async () => { store.update("hero.title", "HEADLESS EDIT OK"); });
check("edit via store updates the public view", pubEl.textContent.includes("HEADLESS EDIT OK"));

await act(async () => { store.update("theme.red", "#00aa88"); });
check("theme colour edit updates --red", document.documentElement.style.getPropertyValue("--red") === "#00aa88");

await act(async () => {
  window.location.hash = "#/products";
  window.dispatchEvent(new window.HashChangeEvent("hashchange"));
});
check("routing to #/products shows the catalogue", /Product catalogue/.test(pubEl.textContent));
check("catalogue lists a product", /Hand Stretch Film 500mm/.test(pubEl.textContent));

await act(async () => {
  window.location.hash = "#/";
  window.dispatchEvent(new window.HashChangeEvent("hashchange"));
});

await act(async () => { adm.render(React.createElement(Admin)); });
check("admin renders theme panel by default", /Brand colours/.test(admEl.textContent));
check("admin preview iframe points at site root", !!admEl.querySelector('iframe[src="../"]'));

// switch to Hero panel and type into the first text input
const heroBtn = [...admEl.querySelectorAll("button")].find((b) => b.textContent.trim() === "Hero");
await act(async () => { heroBtn.dispatchEvent(new window.Event("click", { bubbles: true })); });
const input = admEl.querySelector('input[type="text"]');
check("admin Hero panel has a text input", !!input);
await act(async () => {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
  setter.call(input, "TYPED IN ADMIN");
  input.dispatchEvent(new window.Event("input", { bubbles: true }));
});
check("typing in admin persists to the store", store.getContent().hero.eyebrow === "TYPED IN ADMIN" || JSON.stringify(store.getContent()).includes("TYPED IN ADMIN"));

await act(async () => {
  window.location.hash = "#/";
  window.dispatchEvent(new window.HashChangeEvent("hashchange"));
});
check("admin edit is reflected on the public view", pubEl.textContent.includes("TYPED IN ADMIN"));

await act(async () => { store.resetContent(); });
check("reset restores default hero title", store.getContent().hero.title === "Everything the floor and the office");

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
