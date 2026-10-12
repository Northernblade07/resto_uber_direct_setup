'use client';

import { useEffect, useRef, useState } from 'react';
import { copyText } from '@/lib/client';

export function CopyButton({ text, label = 'Copy', className = '' }) {
  const [state, setState] = useState('idle');
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  async function onCopy() {
    const ok = await copyText(typeof text === 'string' ? text : JSON.stringify(text, null, 2));
    setState(ok ? 'copied' : 'failed');
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState('idle'), 1600);
  }

  return (
    <button type="button" className={`btn btn-ghost btn-sm ${state === 'copied' ? 'is-copied' : ''} ${className}`} onClick={onCopy}>
      {state === 'copied' ? '✓ Copied' : state === 'failed' ? 'Copy failed' : label}
    </button>
  );
}

export function Field({ label, htmlFor, hint, error, badge, children }) {
  return (
    <div className={`field ${error ? 'has-error' : ''}`}>
      <div className="field-head">
        <label htmlFor={htmlFor}>{label}</label>
        {badge ? <span className={`tag tag-${badge}`}>{badge}</span> : null}
      </div>
      {children}
      {error ? <p className="field-error">{error}</p> : hint ? <p className="field-hint">{hint}</p> : null}
    </div>
  );
}

/** A value fixed by the country / billing choice. Shown, but not editable. */
export function FixedValue({ label, value, hint }) {
  return (
    <Field label={label} hint={hint} badge="fixed">
      <div className="fixed-value">{value}</div>
    </Field>
  );
}

/**
 * Dropdown of preset values, with a "Custom value…" option that turns it into a
 * free-text input (prefilled with the current value so it can be tweaked).
 */
export function ComboField({ id, label, value, onChange, options, hint, error }) {
  const isPreset = options.some((o) => o.value === value);
  const [custom, setCustom] = useState(!isPreset && value !== '');

  return (
    <Field label={label} htmlFor={id} hint={hint} error={error} badge={custom ? 'custom' : 'preset'}>
      <div className="combo">
        {custom ? (
          <input
            id={id}
            className="input mono"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Type a value"
            autoComplete="off"
            spellCheck={false}
          />
        ) : (
          <select
            id={id}
            className="input mono"
            value={isPreset ? value : ''}
            onChange={(e) => {
              if (e.target.value === '__custom__') setCustom(true);
              else onChange(e.target.value);
            }}
          >
            {!isPreset ? <option value="">Select…</option> : null}
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label || o.value}
              </option>
            ))}
            <option value="__custom__">✎ Custom value…</option>
          </select>
        )}
        {custom ? (
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => {
              setCustom(false);
              if (!options.some((o) => o.value === value)) onChange(options[0]?.value ?? '');
            }}
          >
            Presets
          </button>
        ) : null}
      </div>
    </Field>
  );
}

export function PhoneInput({ id, dialCode, value, onChange, length }) {
  return (
    <div className="phone">
      <span className="phone-prefix">+{dialCode}</span>
      <input
        id={id}
        className="input mono"
        inputMode="numeric"
        autoComplete="off"
        placeholder={`${length} digits`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

// ---- JSON viewing ----

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function highlight(json) {
  return escapeHtml(json).replace(
    /("(\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g,
    (m) => {
      let cls = 'num';
      if (m.startsWith('"')) cls = m.endsWith(':') ? 'key' : 'str';
      else if (m === 'true' || m === 'false') cls = 'bool';
      else if (m === 'null') cls = 'null';
      return `<span class="j-${cls}">${m}</span>`;
    },
  );
}

export function JsonBlock({ data }) {
  const text = JSON.stringify(data ?? null, null, 2);
  return <pre className="json" dangerouslySetInnerHTML={{ __html: highlight(text) }} />;
}

export function JsonPanel({ title, subtitle, data, actions }) {
  return (
    <section className="panel">
      <header className="panel-head">
        <div>
          <h3>{title}</h3>
          {subtitle ? <p className="panel-sub mono">{subtitle}</p> : null}
        </div>
        <div className="panel-actions">
          {actions}
          <CopyButton text={JSON.stringify(data ?? null, null, 2)} />
        </div>
      </header>
      <JsonBlock data={data} />
    </section>
  );
}

export function StatusBadge({ result }) {
  if (!result) return null;
  const good = result.ok;
  return (
    <span className={`status ${good ? 'status-ok' : 'status-err'}`}>
      {result.status ? `HTTP ${result.status}` : 'No response'}
      {typeof result.durationMs === 'number' && result.durationMs > 0 ? ` · ${result.durationMs} ms` : ''}
    </span>
  );
}

/** Response + request side by side, each copyable. */
export function ResultPanels({ result }) {
  if (!result) return null;
  const req = result.request;
  return (
    <div className="result-grid">
      <JsonPanel title="Response" subtitle={result.status ? `HTTP ${result.status}` : 'no response'} data={result.data} />
      {req ? <JsonPanel title="Request body" subtitle={`${req.method} ${req.url}`} data={req.body} /> : null}
    </div>
  );
}

export function Alert({ kind = 'error', children }) {
  return <div className={`alert alert-${kind}`}>{children}</div>;
}

export function Spinner() {
  return <span className="spinner" aria-hidden="true" />;
}
