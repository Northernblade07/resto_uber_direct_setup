'use client';

import { useEffect, useState } from 'react';
import { BILLING_TYPES, getCountry } from '@/lib/config';
import { emptyAdminForm, emptyOrgForm, switchOrgBilling } from '@/lib/payloads';
import { clearAuth, loadAuth, timeLeft } from '@/lib/client';
import { BillingStep, CountryStep } from './steps/ChoiceSteps';
import AuthStep from './steps/AuthStep';
import OrgStep from './steps/OrgStep';
import AdminStep from './steps/AdminStep';

const STEPS = ['Country', 'Billing', 'Authenticate', 'Organization', 'Admin'];

export default function Wizard() {
  const [step, setStep] = useState(0);
  const [countryCode, setCountryCode] = useState(null);
  const [billingKey, setBillingKey] = useState(null);
  const [auth, setAuth] = useState(null);

  const [orgForm, setOrgForm] = useState(null);
  const [orgResult, setOrgResult] = useState(null);
  const [orgId, setOrgId] = useState('');
  const [adminForm, setAdminForm] = useState(emptyAdminForm);
  const [adminResult, setAdminResult] = useState(null);
  // Bumped to remount a form (and its dropdown state) when it is reset.
  const [orgKey, setOrgKey] = useState(0);
  const [adminKey, setAdminKey] = useState(0);

  useEffect(() => {
    setAuth(loadAuth());
  }, []);

  const country = getCountry(countryCode);
  const billing = billingKey ? BILLING_TYPES[billingKey] : null;
  const authValid = !!auth && auth.expiresAt > Date.now();

  function canEnter(i) {
    if (i === 0) return true;
    if (i === 1) return !!country;
    if (i === 2) return !!country && !!billing;
    return !!country && !!billing && authValid;
  }

  function go(i) {
    if (canEnter(i)) {
      setStep(i);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function selectCountry(code) {
    if (code !== countryCode) {
      setCountryCode(code);
      setBillingKey(null);
      setOrgForm(null);
      setOrgResult(null);
      setAdminResult(null);
    }
    setStep(1);
  }

  function selectBilling(key) {
    if (key !== billingKey) {
      setBillingKey(key);
      setOrgForm((prev) => switchOrgBilling(prev, country, key));
      setOrgResult(null);
      setOrgKey((k) => k + 1);
    }
    setStep(authValid ? 3 : 2);
  }

  function resetOrg() {
    setOrgForm(emptyOrgForm(country, billingKey));
    setOrgResult(null);
    setOrgKey((k) => k + 1);
  }

  function resetAdmin() {
    setAdminForm(emptyAdminForm());
    setAdminResult(null);
    setAdminKey((k) => k + 1);
  }

  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">D</span>
          <div>
            <h1>Uber Direct Setup</h1>
            <p>Internal onboarding tool</p>
          </div>
        </div>
        <div className="topbar-meta">
          {country ? <span className="pill">{country.flag} {country.code}</span> : null}
          {billing ? <span className="pill">{billing.label}</span> : null}
          <span className={`pill ${authValid ? 'pill-live' : 'pill-off'}`}>
            <span className={authValid ? 'dot-live' : 'dot-idle'} aria-hidden="true" />
            {authValid ? `Token · ${timeLeft(auth.expiresAt)}` : 'No token'}
          </span>
        </div>
      </header>

      <nav aria-label="Progress">
        <ol className="stepper">
          {STEPS.map((label, i) => {
            const state = i === step ? 'current' : i < step ? 'done' : 'todo';
            return (
              <li key={label} className={`step step-${state}`}>
                <button type="button" onClick={() => go(i)} disabled={!canEnter(i)} aria-current={i === step ? 'step' : undefined}>
                  <span className="step-dot">{state === 'done' ? '✓' : i + 1}</span>
                  <span className="step-label">{label}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <main className="content" key={step}>
        {step === 0 ? <CountryStep value={countryCode} onSelect={selectCountry} /> : null}

        {step === 1 && country ? <BillingStep country={country} value={billingKey} onSelect={selectBilling} /> : null}

        {step === 2 ? (
          <AuthStep
            auth={authValid ? auth : null}
            onAuth={setAuth}
            onClear={() => {
              clearAuth();
              setAuth(null);
            }}
            onContinue={() => go(3)}
          />
        ) : null}

        {step === 3 && orgForm ? (
          <OrgStep
            key={orgKey}
            country={country}
            billingKey={billingKey}
            form={orgForm}
            setForm={setOrgForm}
            token={auth?.token}
            result={orgResult}
            setResult={setOrgResult}
            onCreated={(id) => {
              setOrgId(id);
              resetAdmin();
            }}
            onNext={() => go(4)}
            onReset={resetOrg}
          />
        ) : null}

        {step === 4 ? (
          <AdminStep
            key={adminKey}
            country={country}
            orgId={orgId}
            setOrgId={setOrgId}
            form={adminForm}
            setForm={setAdminForm}
            token={auth?.token}
            result={adminResult}
            setResult={setAdminResult}
            onInviteAnother={resetAdmin}
            onNewSetup={() => {
              resetOrg();
              resetAdmin();
              setOrgId('');
              go(3);
            }}
          />
        ) : null}

        {step > 0 ? (
          <div className="back-row">
            <button type="button" className="btn btn-link" onClick={() => go(step - 1)}>
              ← Back to {STEPS[step - 1].toLowerCase()}
            </button>
          </div>
        ) : null}
      </main>
    </div>
  );
}
