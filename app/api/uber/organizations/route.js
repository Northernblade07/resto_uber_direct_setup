import { UBER_API_BASE, bearerFrom, forward, localError, readJson } from '@/lib/uber';

// POST /api/uber/organizations — creates a centralised or decentralised organization.
export async function POST(request) {
  const token = bearerFrom(request);
  if (!token) return localError('No access token. Authenticate first (step 3).', 401);

  const body = await readJson(request);
  if (!body || typeof body !== 'object') return localError('Request body must be JSON.');

  const url = `${UBER_API_BASE}/organizations`;
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
