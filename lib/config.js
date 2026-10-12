// All country- and billing-specific values live here.
// To add a country later: fill in its entry and set `enabled: true`.

const US_STATES = [
  ['AL', 'Alabama'], ['AK', 'Alaska'], ['AZ', 'Arizona'], ['AR', 'Arkansas'], ['CA', 'California'],
  ['CO', 'Colorado'], ['CT', 'Connecticut'], ['DE', 'Delaware'], ['DC', 'District of Columbia'],
  ['FL', 'Florida'], ['GA', 'Georgia'], ['HI', 'Hawaii'], ['ID', 'Idaho'], ['IL', 'Illinois'],
  ['IN', 'Indiana'], ['IA', 'Iowa'], ['KS', 'Kansas'], ['KY', 'Kentucky'], ['LA', 'Louisiana'],
  ['ME', 'Maine'], ['MD', 'Maryland'], ['MA', 'Massachusetts'], ['MI', 'Michigan'], ['MN', 'Minnesota'],
  ['MS', 'Mississippi'], ['MO', 'Missouri'], ['MT', 'Montana'], ['NE', 'Nebraska'], ['NV', 'Nevada'],
  ['NH', 'New Hampshire'], ['NJ', 'New Jersey'], ['NM', 'New Mexico'], ['NY', 'New York'],
  ['NC', 'North Carolina'], ['ND', 'North Dakota'], ['OH', 'Ohio'], ['OK', 'Oklahoma'], ['OR', 'Oregon'],
  ['PA', 'Pennsylvania'], ['PR', 'Puerto Rico'], ['RI', 'Rhode Island'], ['SC', 'South Carolina'],
  ['SD', 'South Dakota'], ['TN', 'Tennessee'], ['TX', 'Texas'], ['UT', 'Utah'], ['VT', 'Vermont'],
  ['VA', 'Virginia'], ['WA', 'Washington'], ['WV', 'West Virginia'], ['WI', 'Wisconsin'], ['WY', 'Wyoming'],
].map(([value, label]) => ({ value, label: `${value} — ${label}` }));

const US_PARENT_ORGS = [
  { value: 'f13c85f2-6422-4929-bff4-cf5794868793', label: 'f13c85f2-6422-4929-bff4-cf5794868793 · US parent' },
  { value: '0164b8c9-3632-4ece-8aa9-2feba7452f87', label: '0164b8c9-3632-4ece-8aa9-2feba7452f87 · from decentralised sample' },
];

export const COUNTRIES = [
  {
    code: 'US',
    name: 'United States',
    flag: '🇺🇸',
    enabled: true,
    iso2: 'US',
    dialCode: '1',
    subscriberLength: 10,
    stateLabel: 'State',
    zipLabel: 'ZIP code',
    states: US_STATES,
    parentOrgs: {
      centralized: { options: US_PARENT_ORGS, default: US_PARENT_ORGS[0].value },
      decentralized: { options: US_PARENT_ORGS, default: US_PARENT_ORGS[0].value },
    },
  },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', enabled: false },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', enabled: false },
];

export function getCountry(code) {
  return COUNTRIES.find((c) => c.code === code) || null;
}

export const BILLING_TYPES = {
  centralized: {
    key: 'centralized',
    label: 'Centralised',
    value: 'BILLING_TYPE_CENTRALIZED',
    blurb: 'Billing is handled at the parent organization. No onboarding invite is sent by default.',
    defaults: { onboardingInviteType: 'ONBOARDING_INVITE_TYPE_INVALID', contractType: '' },
  },
  decentralized: {
    key: 'decentralized',
    label: 'Decentralised',
    value: 'BILLING_TYPE_DECENTRALIZED',
    blurb: 'Each merchant handles its own billing. The point of contact gets an onboarding email by default.',
    defaults: { onboardingInviteType: 'ONBOARDING_INVITE_TYPE_EMAIL', contractType: 'CONTRACT_TYPE_PARENT' },
  },
};

export const INVITE_TYPE_OPTIONS = [
  { value: 'ONBOARDING_INVITE_TYPE_EMAIL', label: 'ONBOARDING_INVITE_TYPE_EMAIL · email invite' },
  { value: 'ONBOARDING_INVITE_TYPE_INVALID', label: 'ONBOARDING_INVITE_TYPE_INVALID · no invite' },
];

export const MERCHANT_TYPE_OPTIONS = [{ value: 'MERCHANT_TYPE_RESTAURANT', label: 'MERCHANT_TYPE_RESTAURANT' }];

export const CONTRACT_TYPE_OPTIONS = [{ value: 'CONTRACT_TYPE_PARENT', label: 'CONTRACT_TYPE_PARENT' }];

export const ROLE_OPTIONS = [{ value: 'ROLE_ADMIN', label: 'ROLE_ADMIN' }];
