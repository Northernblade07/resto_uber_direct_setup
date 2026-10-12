import { UBER_API_BASE, bearerFrom, forward, localError, readJson } from '@/lib/uber';

const ORG_ID_PATTERN = /^[A-Za-z0-9-]{8,64}$/;

// POST /api/uber/organizations/:orgId/invite — invites an admin to the organization.
export async function POST(request, { params }) {
  const { orgId } = await params;

  const token = bearerFrom(request);
  if (!token) return localError('No access token. Authenticate first (step 3).', 401);
  if (!ORG_ID_PATTERN.test(orgId || '')) return localError(`"${orgId}" is not a valid organization ID.`);

  const body = await readJson(request);
  if (!body || typeof body !== 'object') return localError('Request body must be JSON.');

  const url = `${UBER_API_BASE}/organizations/${orgId}/memberships/invite`;
  const result = await forward(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  return Response.json({ ...result, request: { method: 'POST', url, body } });
}
