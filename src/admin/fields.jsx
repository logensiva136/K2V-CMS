import { useRef, useState } from "react";
import { getContent, update } from "../store.js";

/* Read a value at a dotted path from current content */
export function at(path) {
  return path.split(".").reduce((o, k) => (o == null ? o : o[k]), getContent());
}

export function setAt(path, value) {
  update(path, value);
}

export function Field({ label, hint, children }) {
  return (
    <label className="fld">
      <span className="fld__label">{label}</span>
      {children}
      {hint && <span className="fld__hint">{hint}</span>}
    </label>
  );
}

export function Text({ path, label, hint, placeholder }) {
  return (
    <Field label={label} hint={hint}>
      <input
        type="text"
        value={at(path) ?? ""}
        placeholder={placeholder}
        onChange={(e) => setAt(path, e.target.value)}
      />
    </Field>
  );
}

export function Area({ path, label, hint, rows = 3 }) {
  return (
    <Field label={label} hint={hint}>
      <textarea rows={rows} value={at(path) ?? ""} onChange={(e) => setAt(path, e.target.value)} />
    </Field>
  );
}

export function Select({ path, label, hint, options }) {
  return (
    <Field label={label} hint={hint}>
      <select value={at(path) ?? ""} onChange={(e) => setAt(path, e.target.value)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

export function Toggle({ path, label }) {
  const v = !!at(path);
  return (
    <label className="tgl">
      <input type="checkbox" checked={v} onChange={(e) => setAt(path, e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

export function Color({ path, label }) {
  const v = at(path) || "#000000";
  return (
    <label className="clr">
      <input type="color" value={v} onChange={(e) => setAt(path, e.target.value)} />
      <span className="clr__name">{label}</span>
      <input
        className="clr__hex"
        type="text"
        value={v}
        onChange={(e) => setAt(path, e.target.value)}
      />
    </label>
  );
}

const MAX_INLINE = 600 * 1024; // ~600KB dataURL — warn beyond this

export function ImageInput({ path, label, hint }) {
  const value = at(path) || "";
  const fileRef = useRef(null);
  const [warn, setWarn] = useState("");

  function onFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result);
      setWarn(url.length > MAX_INLINE ? "Large image — consider a hosted URL to keep the content file small." : "");
      setAt(path, url);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  return (
    <div className="img-fld">
      <span className="fld__label">{label}</span>
      <div className="img-fld__row">
        <div className="img-fld__preview">
          {value ? <img src={value} alt="" /> : <span>no image</span>}
        </div>
        <div className="img-fld__controls">
          <input
            type="text"
            placeholder="Paste an image URL"
            value={value.startsWith("data:") ? "" : value}
            onChange={(e) => setAt(path, e.target.value)}
            disabled={value.startsWith("data:")}
          />
          <div className="img-fld__btns">
            <button type="button" onClick={() => fileRef.current?.click()}>
              Upload
            </button>
            {value && (
              <button type="button" onClick={() => { setAt(path, ""); setWarn(""); }}>
                Clear
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />
        </div>
      </div>
      {value.startsWith("data:") && <span className="fld__hint">Uploaded image stored in the content file. Clear to enter a URL.</span>}
      {warn && <span className="fld__hint fld__hint--warn">{warn}</span>}
      {hint && !warn && <span className="fld__hint">{hint}</span>}
    </div>
  );
}

/* Repeater: edits an array at `path`. renderItem(idxPath, item, index) */
export function Repeater({ path, label, hint, itemLabel, makeItem, renderItem, minItems = 0 }) {
  const list = at(path) || [];

  function mutate(fn) {
    const next = list.map((x) => ({ ...x }));
    fn(next);
    setAt(path, next);
  }

  return (
    <div className="rep">
      <div className="rep__top">
        <span className="fld__label">{label}</span>
        <button type="button" onClick={() => mutate((n) => n.push(makeItem()))}>
          + Add {itemLabel}
        </button>
      </div>
      {hint && <span className="fld__hint">{hint}</span>}
      {list.map((item, i) => (
        <div className="rep__item" key={item.id ?? i}>
          <div className="rep__item-head">
            <strong>
              {itemLabel} {i + 1}
            </strong>
            <div className="rep__item-actions">
              <button type="button" disabled={i === 0} onClick={() => mutate((n) => { [n[i - 1], n[i]] = [n[i], n[i - 1]]; })}>
                ↑
              </button>
              <button type="button" disabled={i === list.length - 1} onClick={() => mutate((n) => { [n[i + 1], n[i]] = [n[i], n[i + 1]]; })}>
                ↓
              </button>
              <button
                type="button"
                className="danger"
                disabled={list.length <= minItems}
                onClick={() => mutate((n) => n.splice(i, 1))}
              >
                Delete
              </button>
            </div>
          </div>
          {renderItem(`${path}.${i}`, item, i)}
        </div>
      ))}
      {list.length === 0 && <p className="rep__empty">None yet. Use “Add {itemLabel}”.</p>}
    </div>
  );
}

export function Num({ path, label, hint, min = 0, max = 99 }) {
  return (
    <Field label={label} hint={hint}>
      <input
        type="number"
        min={min}
        max={max}
        value={at(path) ?? 0}
        onChange={(e) => setAt(path, Math.max(min, Math.min(max, +e.target.value || 0)))}
      />
    </Field>
  );
}

/* Edits an array of plain strings at `path` */
export function StringList({ path, label, hint, itemLabel = "item", placeholder }) {
  const list = at(path) || [];
  const mutate = (fn) => {
    const next = [...list];
    fn(next);
    setAt(path, next);
  };
  return (
    <div className="rep">
      <div className="rep__top">
        <span className="fld__label">{label}</span>
        <button type="button" onClick={() => mutate((n) => n.push(""))}>
          + Add {itemLabel}
        </button>
      </div>
      {hint && <span className="fld__hint">{hint}</span>}
      {list.map((val, i) => (
        <div className="strrow" key={i}>
          <input
            type="text"
            value={val}
            placeholder={placeholder}
            onChange={(e) => mutate((n) => (n[i] = e.target.value))}
          />
          <button type="button" disabled={i === 0} onClick={() => mutate((n) => { [n[i - 1], n[i]] = [n[i], n[i - 1]]; })}>↑</button>
          <button type="button" disabled={i === list.length - 1} onClick={() => mutate((n) => { [n[i + 1], n[i]] = [n[i], n[i + 1]]; })}>↓</button>
          <button type="button" className="danger" onClick={() => mutate((n) => n.splice(i, 1))}>×</button>
        </div>
      ))}
    </div>
  );
}

export function Group({ title, children }) {
  return (
    <section className="grp">
      {title && <h3 className="grp__title">{title}</h3>}
      <div className="grp__body">{children}</div>
    </section>
  );
}
