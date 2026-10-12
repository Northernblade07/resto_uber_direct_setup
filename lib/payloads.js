// Builds the exact JSON bodies Uber expects, and validates the forms behind them.

import { BILLING_TYPES } from './config';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function emptyOrgForm(country, billingKey) {
  const billing = BILLING_TYPES[billingKey];
  return {
    name: '',
    merchantType: 'MERCHANT_TYPE_RESTAURANT',
    email: '',
    subscriber: '',
    street1: '',
    street2: '',
    city: '',
    state: '',
    zipcode: '',
    contractType: billing.defaults.contractType,
    parentOrgId: country.parentOrgs[billingKey].default,
    onboardingInviteType: billing.defaults.onboardingInviteType,
  };
}

/** Keeps what the user typed, but resets the billing-specific defaults. */
export function switchOrgBilling(form, country, billingKey) {
  const fresh = emptyOrgForm(country, billingKey);
  if (!form) return fresh;
  return {
    ...form,
    contractType: fresh.contractType,
    parentOrgId: fresh.parentOrgId,
    onboardingInviteType: fresh.onboardingInviteType,
  };
}

export function emptyAdminForm() {
  return { email: '', firstName: '', lastName: '', subscriber: '', role: 'ROLE_ADMIN' };
}

/**
 * Keeps digits only. If someone pastes the number with the country code in front
 * (e.g. "+1 (778) 681-7688"), the leading dial code is dropped.
 */
export function normalizeSubscriber(raw, country) {
  let digits = String(raw || '').replace(/\D/g, '');
  if (digits.length > country.subscriberLength && digits.startsWith(country.dialCode)) {
    digits = digits.slice(country.dialCode.length);
  }
  return digits.slice(0, country.subscriberLength);
}

export function phoneDetails(subscriber, country) {
  return {
    phone_number: `${country.dialCode}${subscriber}`,
    country_code: country.dialCode,
    subscriber_number: subscriber,
  };
}

export function buildOrgPayload(form, country, billingKey) {
  const billing = BILLING_TYPES[billingKey];
  const info = {
    name: form.name.trim(),
    billing_type: billing.value,
    merchant_type: form.merchantType.trim(),
    point_of_contact: {
      email: form.email.trim(),
      phone_details: phoneDetails(form.subscriber, country),
    },
  };
  if (form.contractType.trim()) info.contract_type = form.contractType.trim();
  info.address = {
    street1: form.street1.trim(),
    street2: form.street2.trim(),
    city: form.city.trim(),
    state: form.state.trim(),
    zipcode: form.zipcode.trim(),
    country_iso2: country.iso2,
  };
  return {
    info,
    hierarchy_info: { parent_organization_id: form.parentOrgId.trim() },
    options: { onboarding_invite_type: form.onboardingInviteType.trim() },
  };
}

export function buildInvitePayload(form, country) {
  return {
    user_details: {
      email: form.email.trim(),
      first_name: form.firstName.trim(),
      last_name: form.lastName.trim(),
      phone_details: phoneDetails(form.subscriber, country),
    },
    roles: [form.role.trim()],
  };
}

function required(errors, form, key, message) {
  if (!String(form[key] || '').trim()) errors[key] = message;
}

function checkPhone(errors, form, country) {
  if (form.subscriber.length !== country.subscriberLength) {
    errors.subscriber = `Enter the ${country.subscriberLength}-digit number without the country code`;
  }
}

function checkEmail(errors, form) {
  if (!EMAIL_RE.test(form.email.trim())) errors.email = 'Enter a valid email';
}

export function validateOrgForm(form, country) {
  const errors = {};
  required(errors, form, 'name', 'Organization name is required');
  checkEmail(errors, form);
  checkPhone(errors, form, country);
  required(errors, form, 'street1', 'Street address is required');
  required(errors, form, 'city', 'City is required');
  required(errors, form, 'state', `${country.stateLabel} is required`);
  required(errors, form, 'zipcode', `${country.zipLabel} is required`);
  required(errors, form, 'merchantType', 'Merchant type is required');
  required(errors, form, 'parentOrgId', 'Parent organization ID is required');
  required(errors, form, 'onboardingInviteType', 'Onboarding invite type is required');
  return errors;
}

export function validateAdminForm(form, country) {
  const errors = {};
  checkEmail(errors, form);
  required(errors, form, 'firstName', 'First name is required');
  required(errors, form, 'lastName', 'Last name is required');
  checkPhone(errors, form, country);
  required(errors, form, 'role', 'Role is required');
  return errors;
}
