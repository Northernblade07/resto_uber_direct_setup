'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ROLE_OPTIONS } from '@/lib/config';
import { buildInvitePayload, normalizeSubscriber, validateAdminForm } from '@/lib/payloads';
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

const ORG_ID_PATTERN = /^[A-Za-z0-9-]{8,64}$/;

export default function AdminStep({ country, orgId, setOrgId, form, setForm, token, result, setResult, onInviteAnother, onNewSetup }) {
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState(false);

  const payload = useMemo(() => buildInvitePayload(form, country), [form, country]);
  const errors = useMemo(() => {
    const e = validateAdminForm(form, country);
    if (!ORG_ID_PATTERN.test(orgId.trim())) e.orgId = 'Enter the organization_id from the previous step';
    return e;
  }, [form, country, orgId]);
  const hasErrors = Object.keys(errors).length > 0;
  const shownErrors = touched ? errors : {};
  const invited = !!result?.ok;
  const outcomeRef = useRef(null);

  useEffect(() => {
    if (result) outcomeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [result]);

  const endpoint = `https://api.uber.com/v1/direct/organizations/${orgId.trim() || '{organization_id}'}/memberships/invite`;
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setTouched(true);
    if (hasErrors || loading || invited) return;
    setLoading(true);
    const res = await apiPost(`/api/uber/organizations/${encodeURIComponent(orgId.trim())}/invite`, payload, token);
    setLoading(false);
    setResult(res);
  }

  return (
    <div className="step-body">
      <div className="step-intro">
        <h2>Invite the organization admin</h2>
        <p className="mono muted endpoint">
          POST {endpoint}
          <CopyButton text={endpoint} label="Copy URL" />
        </p>
      </div>

      <div className="split">
        <form className="card form" onSubmit={submit} noValidate>
          <fieldset disabled={invited}>
            <h3 className="form-section">Organization</h3>
            <Field label="Organization ID" htmlFor="adm-org" error={shownErrors.orgId} hint="Filled in from the organization you just created — paste another to invite into an existing org">
              <input
                id="adm-org"
                className="input mono"
                value={orgId}
                onChange={(e) => setOrgId(e.target.value)}
                placeholder="b04c3127-7ec1-4655-a75e-be049b9fcccb"
                autoComplete="off"
                spellCheck={false}
              />
            </Field>

            <h3 className="form-section">Admin details</h3>
            <div className="grid-2">
              <Field label="First name" htmlFor="adm-first" error={shownErrors.firstName}>
                <input id="adm-first" className="input" value={form.firstName} onChange={set('firstName')} placeholder="Michael" autoComplete="off" />
              </Field>
              <Field label="Last name" htmlFor="adm-last" error={shownErrors.lastName}>
                <input id="adm-last" className="input" value={form.lastName} onChange={set('lastName')} placeholder="Sansour" autoComplete="off" />
              </Field>
            </div>
            <Field label="Email" htmlFor="adm-email" error={shownErrors.email}>
              <input id="adm-email" type="email" className="input" value={form.email} onChange={set('email')} placeholder="admin@company.com" autoComplete="off" />
            </Field>
            <div className="grid-2">
              <Field
                label="Subscriber number"
                htmlFor="adm-phone"
                error={shownErrors.subscriber}
                hint={form.subscriber ? `phone_number → ${country.dialCode}${form.subscriber}` : 'Number without the country code'}
              >
                <PhoneInput
                  id="adm-phone"
                  dialCode={country.dialCode}
                  length={country.subscriberLength}
                  value={form.subscriber}
                  onChange={(v) => setForm((f) => ({ ...f, subscriber: normalizeSubscriber(v, country) }))}
                />
              </Field>
              <FixedValue label="Country code" value={country.dialCode} hint={`Fixed for ${country.name}`} />
            </div>
            <ComboField id="adm-role" label="Role" value={form.role} onChange={(v) => setForm((f) => ({ ...f, role: v }))} options={ROLE_OPTIONS} error={shownErrors.role} />
          </fieldset>

          <div className="form-footer">
            {touched && hasErrors ? <span className="field-error">Fix the highlighted fields first.</span> : <span />}
            {invited ? (
              <button type="button" className="btn btn-secondary" onClick={onInviteAnother}>
                + Invite another admin
              </button>
            ) : (
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <Spinner /> : null} {loading ? 'Sending invite…' : 'Send admin invite'}
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

      {invited ? (
        <div className="card success-card">
          <div>
            <p className="eyebrow">Admin invited</p>
            <p className="success-line">
              {form.firstName} {form.lastName} · {form.email}
            </p>
            <p className="muted mono small">org {orgId.trim()}</p>
          </div>
          <div className="row-actions">
            <CopyButton text={orgId.trim()} label="Copy organization_id" />
            <button type="button" className="btn btn-primary" onClick={onNewSetup}>
              Start a new setup
            </button>
          </div>
        </div>
      ) : null}

      {result ? (
        <>
          <div className="result-head">
            <h3>Invite admin call</h3>
            <StatusBadge result={result} />
          </div>
          <ResultPanels result={result} />
        </>
      ) : null}
    </div>
  );
}
