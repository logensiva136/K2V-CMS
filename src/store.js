import { useSyncExternalStore } from "react";
import { DEFAULT_CONTENT, CONTENT_VERSION } from "./content/defaults.js";

const KEY = "k2v_site_content";
const API_BASE = "/api";

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

let initialSource = "defaults";
let current = readInitial();
// Where `current` last came from, and whether the last write reached the
// server. The admin UI surfaces this; the public site only reads `source`.
let sync = { source: initialSource, saveState: "idle", error: null };
const listeners = new Set();
const syncListeners = new Set();

function readInitial() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.version === CONTENT_VERSION) {
        initialSource = "local";
        return withDefaults(DEFAULT_CONTENT, parsed);
      }
    }
  } catch {
    /* unreadable storage — fall through to defaults */
  }
  initialSource = "defaults";
  return clone(DEFAULT_CONTENT);
}

function emit() {
  for (const l of listeners) l();
}

function setSync(patch) {
  sync = { ...sync, ...patch };
  for (const l of syncListeners) l();
}

export function getContent() {
  return current;
}

export function getSyncState() {
  return sync;
}

/* Update local state + cache without POSTing back to the server — used when
   we've just received a copy FROM the server, or from a same-origin tab. */
function applyLocally(next, source) {
  current = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch (e) {
    console.warn("K2V CMS: could not persist content locally", e);
  }
  if (source) setSync({ source });
  emit();
}

export function setContent(next) {
  applyLocally(next, "local");
  syncToServer(next);
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

/* --- server sync (no-op if there is no /api backend, e.g. GitHub Pages) --- */

let hydrated = false;

async function hydrateFromServer() {
  try {
    const res = await fetch(`${API_BASE}/content`, { credentials: "include" });
    if (!res.ok) return; // no backend deployed here yet — stay on local/defaults
    const data = await res.json();
    if (!data || typeof data !== "object") return;
    applyLocally(withDefaults(DEFAULT_CONTENT, { ...data, version: CONTENT_VERSION }), "server");
  } catch {
    /* offline, or no /api on this host — silently keep the local copy */
  }
}

export function refreshFromServer() {
  return hydrateFromServer();
}

let saveTimer = null;
async function syncToServer(next) {
  // Debounce so fast typing in the admin doesn't fire a request per keystroke.
  clearTimeout(saveTimer);
  setSync({ saveState: "saving", error: null });
  saveTimer = setTimeout(async () => {
    try {
      const res = await fetch(`${API_BASE}/content`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      if (res.status === 401) {
        setSync({ saveState: "unauthorized", error: "Not logged in — this change is only saved in your browser." });
        return;
      }
      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      setSync({ saveState: "saved", source: "server", error: null });
    } catch {
      // No backend, or offline — the change is still safe in localStorage.
      setSync({ saveState: "offline", error: null });
    }
  }, 400);
}

if (typeof window !== "undefined" && !hydrated) {
  hydrated = true;
  hydrateFromServer();
}

function subscribe(cb) {
  listeners.add(cb);
  const onStorage = (e) => {
    if (e.key === KEY) {
      applyLocally(readInitial(), "local");
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

export function useSyncState() {
  return useSyncExternalStore(
    (cb) => {
      syncListeners.add(cb);
      return () => syncListeners.delete(cb);
    },
    getSyncState,
    getSyncState
  );
}

export { KEY as STORAGE_KEY, API_BASE };
