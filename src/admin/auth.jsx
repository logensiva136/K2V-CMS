import { createContext, useContext, useEffect, useRef, useState } from "react";
import { authApi } from "./api.js";

const AuthContext = createContext({ mode: "local-only", username: null, logout: async () => {} });
export const useAuthContext = () => useContext(AuthContext);

/* Gates the admin app behind the /api/auth/* contract (see README.md).
   If no backend answers at all, falls back to today's local-only mode
   instead of locking the editor out — keeps working on plain static hosting. */
export function AuthGate({ children }) {
  const [phase, setPhase] = useState("checking");
  const [username, setUsername] = useState(null);
  const [checkError, setCheckError] = useState("");

  async function check() {
    setPhase("checking");
    try {
      const data = await authApi.status();
      if (!data.hasAdmin) setPhase("setup");
      else if (!data.authenticated) setPhase("login");
      else {
        setUsername(data.username || null);
        setPhase("authenticated");
      }
    } catch (e) {
      if (e.network || e.status === 404) setPhase("no-backend");
      else {
        setCheckError(e.message);
        setPhase("error");
      }
    }
  }

  useEffect(() => {
    check();
  }, []);

  async function logout() {
    try {
      await authApi.logout();
    } catch {
      /* server unreachable — still drop the local session view */
    }
    setUsername(null);
    setPhase("login");
  }

  if (phase === "checking") return <Splash text="Checking session…" />;
  if (phase === "error")
    return (
      <Splash text={`Could not reach the login service: ${checkError}`}>
        <button className="primary" onClick={check}>
          Try again
        </button>
      </Splash>
    );
  if (phase === "setup") return <Setup onDone={check} />;
  if (phase === "login") return <Login onDone={check} />;

  const mode = phase === "no-backend" ? "local-only" : "server";
  return <AuthContext.Provider value={{ mode, username, logout }}>{children}</AuthContext.Provider>;
}

function Splash({ text, children }) {
  return (
    <div className="authscreen">
      <div className="authcard">
        <p className="authcard__status">{text}</p>
        {children}
      </div>
    </div>
  );
}

function Brand() {
  return (
    <div className="authcard__brand">
      <span className="cms__mark">K2V</span>
      <div>
        K2V CMS
        <small>Site content editor</small>
      </div>
    </div>
  );
}

function Setup({ onDone }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (username.trim().length < 3) return setError("Username must be at least 3 characters.");
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== confirm) return setError("Passwords do not match.");
    setBusy(true);
    try {
      await authApi.setup(username.trim(), password);
      onDone();
    } catch (e) {
      setError(e.message || "Could not create the admin account.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="authscreen">
      <form className="authcard" onSubmit={submit}>
        <Brand />
        <h1>Set up the admin account</h1>
        <p className="authcard__lede">
          No admin account exists yet. Create the one account that can edit this site — this screen
          only ever runs once.
        </p>
        <label className="fld">
          <span className="fld__label">Username</span>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} autoFocus autoComplete="username" />
        </label>
        <label className="fld">
          <span className="fld__label">Password</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
          <span className="fld__hint">At least 8 characters.</span>
        </label>
        <label className="fld">
          <span className="fld__label">Confirm password</span>
          <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
        </label>
        {error && <p className="authcard__error">{error}</p>}
        <button className="primary" type="submit" disabled={busy}>
          {busy ? "Creating account…" : "Create admin account"}
        </button>
      </form>
    </div>
  );
}

const LOCKOUT_AFTER = 5;
const LOCKOUT_SECONDS = 30;

function Login({ onDone }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [fails, setFails] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(0);
  const [, forceTick] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!lockedUntil) return;
    timerRef.current = setInterval(() => forceTick((n) => n + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [lockedUntil]);

  const remaining = Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000));
  const locked = remaining > 0;

  async function submit(e) {
    e.preventDefault();
    if (locked) return;
    setError("");
    setBusy(true);
    try {
      await authApi.login(username.trim(), password);
      setFails(0);
      onDone();
    } catch (e) {
      const next = fails + 1;
      setFails(next);
      if (next >= LOCKOUT_AFTER) {
        setLockedUntil(Date.now() + LOCKOUT_SECONDS * 1000);
        setError(`Too many attempts. Try again in ${LOCKOUT_SECONDS}s.`);
      } else {
        setError(e.status === 401 ? "Incorrect username or password." : e.message || "Login failed.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="authscreen">
      <form className="authcard" onSubmit={submit}>
        <Brand />
        <h1>Log in</h1>
        <label className="fld">
          <span className="fld__label">Username</span>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} autoFocus autoComplete="username" />
        </label>
        <label className="fld">
          <span className="fld__label">Password</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        </label>
        {error && <p className="authcard__error">{locked ? `Too many attempts. Try again in ${remaining}s.` : error}</p>}
        <button className="primary" type="submit" disabled={busy || locked}>
          {busy ? "Signing in…" : "Log in"}
        </button>
      </form>
    </div>
  );
}
