'use client';

import { useState } from 'react';
import { apiPost, errorMessage, saveAuth, timeLeft } from '@/lib/client';
import { Alert, ResultPanels, Spinner, StatusBadge } from '@/components/ui';

export default function AuthStep({ auth, onAuth, onClear, onContinue }) {
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(null);

  async function login() {
    setLoading(true);
    setFailed(null);
    const result = await apiPost('/api/uber/token');
    setLoading(false);
    if (result.ok && result.data?.access_token) {
      onAuth(saveAuth(result));
    } else {
      setFailed(result);
    }
  }

  const shown = failed || auth?.result || null;

  return (
    <div className="step-body">
      <div className="step-intro">
        <h2>Authenticate with Uber</h2>
        <p>
          Gets an access token with the <code>client_credentials</code> grant. The token lasts about 30 days and is
          saved in this browser, so you only need to do this again when it expires.
        </p>
      </div>

      <div className="card auth-card">
        {auth ? (
          <div className="auth-state">
            <span className="dot-live" aria-hidden="true" />
            <div>
              <strong>Token active</strong>
              <p className="muted">
                Expires {new Date(auth.expiresAt).toLocaleString()} · {timeLeft(auth.expiresAt)}
              </p>
            </div>
          </div>
        ) : (
          <div className="auth-state">
            <span className="dot-idle" aria-hidden="true" />
            <div>
              <strong>No token yet</strong>
              <p className="muted">Credentials are read from <code>.env.local</code> on the server.</p>
            </div>
          </div>
        )}

        <div className="row-actions">
          {auth ? (
            <>
              <button type="button" className="btn btn-ghost" onClick={onClear} disabled={loading}>
                Clear token
              </button>
              <button type="button" className="btn btn-secondary" onClick={login} disabled={loading}>
                {loading ? <Spinner /> : null} Get new token
              </button>
              <button type="button" className="btn btn-primary" onClick={onContinue}>
                Continue →
              </button>
            </>
          ) : (
            <button type="button" className="btn btn-primary" onClick={login} disabled={loading}>
              {loading ? <Spinner /> : null} {loading ? 'Authenticating…' : 'Get access token'}
            </button>
          )}
        </div>
      </div>

      {failed ? <Alert>{errorMessage(failed)}</Alert> : null}

      {shown ? (
        <>
          <div className="result-head">
            <h3>Auth call</h3>
            <StatusBadge result={shown} />
          </div>
          <ResultPanels result={shown} />
        </>
      ) : null}
    </div>
  );
}
