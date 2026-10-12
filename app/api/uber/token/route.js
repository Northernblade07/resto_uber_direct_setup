import { UBER_AUTH_URL, forward, localError, mask } from '@/lib/uber';

// POST /api/uber/token — client_credentials login. Credentials come from .env.local.
export async function POST() {
  const clientId = process.env.UBER_CLIENT_ID;
  const clientSecret = process.env.UBER_CLIENT_SECRET;
  const scope = process.env.UBER_SCOPE || 'direct.organizations';

  if (!clientId || !clientSecret) {
    return localError('UBER_CLIENT_ID and UBER_CLIENT_SECRET are missing. Add them to .env.local and restart the dev server.', 500);
  }

  const form = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'client_credentials',
    scope,
  });

  const result = await forward(UBER_AUTH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form,
  });

  return Response.json({
    ...result,
    request: {
      method: 'POST',
      url: UBER_AUTH_URL,
      contentType: 'application/x-www-form-urlencoded',
      // The secret is masked so the copied request is safe to paste around.
      body: { client_id: clientId, client_secret: mask(clientSecret), grant_type: 'client_credentials', scope },
    },
  });
}
