import { useSyncExternalStore } from "react";
import { DEFAULT_CONTENT, CONTENT_VERSION } from "./content/defaults.js";

const KEY = "k2v_site_content";

const clone = (o) =>
  typeof structuredClone === "function"
    ? structuredClone(o)
    : JSON.parse(JSON.stringify(o));

// Fill in any keys added to DEFAULT_CONTENT since a copy was saved, without
// touching values the editor has changed. Arrays are taken as-is from the save.
function withDefaults(base, saved) {
  if (Array.isArray(base)) return Array.isArray(saved) ? saved : clone(base);
  if (base && typeof base === "object") {
    const out = {};
    const keys = new Set([...Object.keys(base), ...Object.keys(saved || {})]);
    for (const k of keys) {
      if (saved && k in saved && !(k in base)) out[k] = saved[k];
      else if (saved && k in saved) out[k] = withDefaults(base[k], saved[k]);
      else out[k] = clone(base[k]);
    }
    return out;
  }
  return saved === undefined ? clone(base) : saved;
}

let current = readInitial();
const listeners = new Set();

function readInitial() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.version === CONTENT_VERSION) {
        return withDefaults(DEFAULT_CONTENT, parsed);
      }
    }
  } catch {
    /* unreadable storage — fall through to defaults */
  }
  return clone(DEFAULT_CONTENT);
}

function emit() {
  for (const l of listeners) l();
}

export function getContent() {
  return current;
}

export function setContent(next) {
  current = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch (e) {
    // Quota exceeded — most likely a large uploaded image. Keep the in-memory
    // copy so the session still works; the editor surfaces the warning.
    console.warn("K2V CMS: could not persist content", e);
  }
  emit();
}

// Immutable-ish update by dotted path, e.g. update("hero.title", "New")
export function update(path, value) {
  const next = clone(current);
  const parts = path.split(".");
  let node = next;
  for (let i = 0; i < parts.length - 1; i++) node = node[parts[i]];
  node[parts[parts.length - 1]] = value;
  setContent(next);
}

export function resetContent() {
  setContent(clone(DEFAULT_CONTENT));
}

export function exportContent() {
  const blob = new Blob([JSON.stringify(current, null, 2)], {
    type: "application/json",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "k2v-content.json";
  a.click();
  URL.revokeObjectURL(a.href);
}

export function importContent(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (!parsed || typeof parsed !== "object") throw new Error("not an object");
        setContent(withDefaults(DEFAULT_CONTENT, { ...parsed, version: CONTENT_VERSION }));
        resolve();
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

function subscribe(cb) {
  listeners.add(cb);
  const onStorage = (e) => {
    if (e.key === KEY) {
      current = readInitial();
      emit();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function useContent() {
  return useSyncExternalStore(subscribe, getContent, getContent);
}

export { KEY as STORAGE_KEY };
