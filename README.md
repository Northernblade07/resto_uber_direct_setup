# Uber Direct Setup

Internal tool for onboarding merchants to Uber Direct: pick a country and billing type, authenticate, create the organization, then invite its admin. Built with Next.js 16 (App Router) and plain JavaScript. No database.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000.

Credentials live in `.env.local` (already filled in; see `.env.example` for the keys). They are only read on the server — the browser never sees the client secret.

## Flow

1. **Country** — United States is live; Canada and Australia are placeholders.
2. **Billing** — Centralised or decentralised. Sets `billing_type` and the defaults below.
3. **Authenticate** — `POST https://auth.uber.com/oauth/v2/token` (client_credentials). The token lasts ~30 days and is saved in the browser, so this step is usually skipped automatically.
4. **Organization** — `POST https://api.uber.com/v1/direct/organizations`. Live request preview; on success the `organization_id` is shown with a copy button.
5. **Admin** — `POST https://api.uber.com/v1/direct/organizations/{organization_id}/memberships/invite`. The org ID is prefilled but editable, so you can also invite into an existing org.

Every call shows its response and request body, each with a Copy button.

| Field | Centralised default | Decentralised default |
|---|---|---|
| `billing_type` | `BILLING_TYPE_CENTRALIZED` (fixed) | `BILLING_TYPE_DECENTRALIZED` (fixed) |
| `contract_type` | omitted | `CONTRACT_TYPE_PARENT` |
| `options.onboarding_invite_type` | `ONBOARDING_INVITE_TYPE_INVALID` | `ONBOARDING_INVITE_TYPE_EMAIL` |
| `hierarchy_info.parent_organization_id` | `f13c85f2-…-cf5794868793` | `f13c85f2-…-cf5794868793` |

Dropdown fields have a **✎ Custom value…** option that turns them into a text input. Country code (`1`) and `country_iso2` (`US`) are fixed by the country; `phone_number` is built as country code + subscriber number. Pasting `+1 (786) 431-9825` into a phone field is cleaned to `7864319825`.

## Project layout

```
app/
  page.js, layout.js, globals.css
  api/uber/token/route.js                         → Uber OAuth
  api/uber/organizations/route.js                 → create organization
  api/uber/organizations/[orgId]/invite/route.js  → invite admin
components/
  Wizard.js           step state and navigation
  steps/*.js          one file per step
  ui.js               fields, dropdown-or-custom input, JSON panels, copy buttons
lib/
  config.js           countries, billing types, preset values  ← edit this to add countries
  payloads.js         builds and validates the request bodies
  client.js           browser helpers (API calls, token storage, clipboard)
  uber.js             server helpers (calls Uber, masks secrets)
```

## Adding a country

In `lib/config.js`, fill in the country's entry (`iso2`, `dialCode`, `subscriberLength`, `states`, `parentOrgs`) and set `enabled: true`. Nothing else needs to change unless that country's request bodies differ.
