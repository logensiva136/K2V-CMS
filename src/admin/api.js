// Client for the auth API described in README.md ("Admin authentication").
// Any backend (PHP or Node) that implements this contract works here unchanged.
import { API_BASE } from "../store.js";

async function request(path, opts = {}) {
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      credentials: "include",
      headers: opts.body ? { "Content-Type": "application/json" } : undefined,
      ...opts,
    });
  } catch (e) {
    const err = new Error("Could not reach the server.");
    err.network = true;
    throw err;
  }
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* empty or non-JSON body */
  }
  if (!res.ok) {
    const err = new Error((data && data.error) || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

export const authApi = {
  status: () => request("/auth/status"),
  setup: (username, password) =>
    request("/auth/setup", { method: "POST", body: JSON.stringify({ username, password }) }),
  login: (username, password) =>
    request("/auth/login", { method: "POST", body: JSON.stringify({ username, password }) }),
  logout: () => request("/auth/logout", { method: "POST" }),
};
