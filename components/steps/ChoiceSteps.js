'use client';

import { BILLING_TYPES, COUNTRIES } from '@/lib/config';

export function CountryStep({ value, onSelect }) {
  return (
    <div className="step-body">
      <div className="step-intro">
        <h2>Which country is this setup for?</h2>
        <p>The country fixes the phone country code and the address country for every request.</p>
      </div>
      <div className="tiles">
        {COUNTRIES.map((c) => (
          <button
            key={c.code}
            type="button"
            className={`tile ${value === c.code ? 'is-selected' : ''}`}
            disabled={!c.enabled}
            onClick={() => onSelect(c.code)}
          >
            <span className="tile-flag" aria-hidden="true">{c.flag}</span>
            <span className="tile-title">{c.name}</span>
            <span className="tile-meta">{c.enabled ? `+${c.dialCode} · ${c.iso2}` : 'Coming soon'}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function BillingStep({ country, value, onSelect }) {
  return (
    <div className="step-body">
      <div className="step-intro">
        <h2>Centralised or decentralised billing?</h2>
        <p>
          This sets <code>billing_type</code> and the defaults for the onboarding invite and contract type in {country.name}.
        </p>
      </div>
      <div className="tiles tiles-2">
        {Object.values(BILLING_TYPES).map((b) => (
          <button
            key={b.key}
            type="button"
            className={`tile tile-left ${value === b.key ? 'is-selected' : ''}`}
            onClick={() => onSelect(b.key)}
          >
            <span className="tile-title">{b.label}</span>
            <span className="tile-code mono">{b.value}</span>
            <span className="tile-desc">{b.blurb}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
