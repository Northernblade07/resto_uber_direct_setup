'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BILLING_TYPES,
  CONTRACT_TYPE_OPTIONS,
  INVITE_TYPE_OPTIONS,
  MERCHANT_TYPE_OPTIONS,
} from '@/lib/config';
import { buildOrgPayload, normalizeSubscriber, validateOrgForm } from '@/lib/payloads';
import { apiPost, errorMessage } from '@/lib/client';
import {
  Alert,
  ComboField,
  CopyButton,
  Field,
  FixedValue,
  JsonPanel,
  PhoneInput,
  ResultPanels,
  Spinner,
  StatusBadge,
} from '@/components/ui';

export default function OrgStep({ country, billingKey, form, setForm, token, result, setResult, onCreated, onNext, onReset }) {
  const billing = BILLING_TYPES[billingKey];
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState(false);

  const payload = useMemo(() => buildOrgPayload(form, country, billingKey), [form, country, billingKey]);
  const errors = useMemo(() => validateOrgForm(form, country), [form, country]);
  const hasErrors = Object.keys(errors).length > 0;
  const shownErrors = touched ? errors : {};

  const createdId = result?.ok ? result.data?.organization_id : null;
  const outcomeRef = useRef(null);

  // Bring the new organization_id (or the error) into view when a call finishes.
  useEffect(() => {
    if (result) outcomeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [result]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const setValue = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  async function submit(e) {
    e.preventDefault();
    setTouched(true);
    if (hasErrors || loading || createdId) return;
    setLoading(true);
    const res = await apiPost('/api/uber/organizations', payload, token);
    setLoading(false);
    setResult(res);
    if (res.ok && res.data?.organization_id) onCreated(res.data.organization_id);
  }

  return (
    <div className="step-body">
      <div className="step-intro">
        <h2>Create the organization</h2>
        <p>
          <span className="pill">{country.flag} {country.name}</span>
          <span className="pill">{billing.label}</span>
          <span className="mono muted">POST /v1/direct/organizations</span>
        </p>
      </div>

      <div className="split">
        <form className="card form" onSubmit={submit} noValidate>
          <fieldset disabled={!!createdId}>
            <h3 className="form-section">Organization</h3>
            <Field label="Name" htmlFor="org-name" error={shownErrors.name}>
              <input id="org-name" className="input" value={form.name} onChange={set('name')} placeholder="Blue Moose Bar and Grill" autoComplete="off" />
            </Field>
            <div className="grid-2">
              <FixedValue label="Billing type" value={billing.value} />
              <ComboField id="org-merchant" label="Merchant type" value={form.merchantType} onChange={setValue('merchantType')} options={MERCHANT_TYPE_OPTIONS} error={shownErrors.merchantType} />
            </div>
            {billingKey === 'decentralized' ? (
              <ComboField id="org-contract" label="Contract type" value={form.contractType} onChange={setValue('contractType')} options={CONTRACT_TYPE_OPTIONS} />
            ) : null}

            <h3 className="form-section">Point of contact</h3>
            <Field label="Email" htmlFor="org-email" error={shownErrors.email}>
              <input id="org-email" type="email" className="input" value={form.email} onChange={set('email')} placeholder="owner@restaurant.com" autoComplete="off" />
            </Field>
            <div className="grid-2">
              <Field
                label="Subscriber number"
                htmlFor="org-phone"
                error={shownErrors.subscriber}
                hint={form.subscriber ? `phone_number → ${country.dialCode}${form.subscriber}` : 'Number without the country code'}
              >
                <PhoneInput
                  id="org-phone"
                  dialCode={country.dialCode}
                  length={country.subscriberLength}
                  value={form.subscriber}
                  onChange={(v) => setForm((f) => ({ ...f, subscriber: normalizeSubscriber(v, country) }))}
                />
              </Field>
              <FixedValue label="Country code" value={country.dialCode} hint={`Fixed for ${country.name}`} />
            </div>

            <h3 className="form-section">Address</h3>
            <Field label="Street 1" htmlFor="org-street1" error={shownErrors.street1}>
              <input id="org-street1" className="input" value={form.street1} onChange={set('street1')} placeholder="507 2nd St NW" autoComplete="off" />
            </Field>
            <Field label="Street 2" htmlFor="org-street2" hint="Optional — sent as an empty string when blank">
              <input id="org-street2" className="input" value={form.street2} onChange={set('street2')} placeholder="Ste 3" autoComplete="off" />
            </Field>
            <div className="grid-3">
              <Field label="City" htmlFor="org-city" error={shownErrors.city}>
                <input id="org-city" className="input" value={form.city} onChange={set('city')} placeholder="East Grand Forks" autoComplete="off" />
              </Field>
              <Field label={country.stateLabel} htmlFor="org-state" error={shownErrors.state}>
                <select id="org-state" className="input" value={form.state} onChange={set('state')}>
                  <option value="">Select…</option>
                  {country.states.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </Field>
              <Field label={country.zipLabel} htmlFor="org-zip" error={shownErrors.zipcode}>
                <input id="org-zip" className="input mono" value={form.zipcode} onChange={set('zipcode')} placeholder="56721" autoComplete="off" />
              </Field>
            </div>
            <FixedValue label="Country (ISO2)" value={country.iso2} />

            <h3 className="form-section">Hierarchy &amp; options</h3>
            <ComboField
              id="org-parent"
              label="Parent organization ID"
              value={form.parentOrgId}
              onChange={setValue('parentOrgId')}
              options={country.parentOrgs[billingKey].options}
              error={shownErrors.parentOrgId}
            />
            <ComboField
              id="org-invite"
              label="Onboarding invite type"
              value={form.onboardingInviteType}
              onChange={setValue('onboardingInviteType')}
              options={INVITE_TYPE_OPTIONS}
              error={shownErrors.onboardingInviteType}
            />
          </fieldset>

          <div className="form-footer">
            {touched && hasErrors ? <span className="field-error">Fix the highlighted fields first.</span> : <span />}
            {createdId ? (
              <button type="button" className="btn btn-secondary" onClick={onReset}>
                + Create another organization
              </button>
            ) : (
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <Spinner /> : null} {loading ? 'Creating…' : 'Create organization'}
              </button>
            )}
          </div>
        </form>

        <aside className="sticky">
          <JsonPanel title="Request preview" subtitle="Live — this exact body is sent" data={payload} />
        </aside>
      </div>

      <div ref={outcomeRef} />
      {result && !result.ok ? <Alert>{errorMessage(result)}</Alert> : null}

      {createdId ? (
        <div className="card success-card">
          <div>
            <p className="eyebrow">Organization created</p>
            <p className="big-id mono">{createdId}</p>
          </div>
          <div className="row-actions">
            <CopyButton text={createdId} label="Copy organization_id" />
            <button type="button" className="btn btn-primary" onClick={onNext}>
              Invite admin →
            </button>
          </div>
        </div>
      ) : null}

      {result ? (
        <>
          <div className="result-head">
            <h3>Create organization call</h3>
            <StatusBadge result={result} />
          </div>
          <ResultPanels result={result} />
        </>
      ) : null}
    </div>
  );
}
