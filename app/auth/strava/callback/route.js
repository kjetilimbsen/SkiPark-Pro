import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error || !code) {
      return new Response(`
        <!DOCTYPE html>
        <html>
          <body style="font-family:system-ui;text-align:center;padding:40px;background:#f8fafc;color:#0f172a;">
            <h2>❌ Strava-innlogging avbrutt</h2>
            <p style="color:#64748b;">${error || 'Ingen autorisasjonskode mottatt fra Strava.'}</p>
            <script>
              setTimeout(() => window.close(), 3000);
            </script>
          </body>
        </html>
      `, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }

    const clientId = process.env.STRAVA_CLIENT_ID;
    const clientSecret = process.env.STRAVA_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return new Response(`
        <!DOCTYPE html>
        <html>
          <body style="font-family:system-ui;text-align:center;padding:40px;background:#f8fafc;color:#0f172a;">
            <h2>⚠️ Strava API-nøkler mangler</h2>
            <p>Vennligst legg til STRAVA_CLIENT_ID og STRAVA_CLIENT_SECRET i miljøvariablene.</p>
          </body>
        </html>
      `, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }

    // Bytt authorization_code mot access_token hos Strava
    const tokenRes = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code'
      })
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      return new Response(`
        <!DOCTYPE html>
        <html>
          <body style="font-family:system-ui;text-align:center;padding:40px;background:#f8fafc;color:#0f172a;">
            <h2>❌ Strava token-feil (${tokenRes.status})</h2>
            <p>${errText}</p>
          </body>
        </html>
      `, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }

    const tokenData = await tokenRes.json();
    const athleteName = tokenData.athlete ? `${tokenData.athlete.firstname} ${tokenData.athlete.lastname}` : 'Strava-bruker';

    const safePayload = JSON.stringify({
      type: 'OAUTH_AUTH_SUCCESS',
      service: 'strava',
      token: tokenData.access_token,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: tokenData.expires_at,
      athlete: {
        id: tokenData.athlete?.id,
        name: athleteName,
        firstname: tokenData.athlete?.firstname || athleteName,
        lastname: tokenData.athlete?.lastname || '',
        profile: tokenData.athlete?.profile_medium || tokenData.athlete?.profile
      }
    });

    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Strava tilkoblet</title>
        </head>
        <body style="font-family:system-ui;text-align:center;padding:40px;background:#fff7ed;color:#9a3412;">
          <div style="max-width:360px;margin:40px auto;background:#fff;padding:30px;border-radius:18px;box-shadow:0 10px 25px rgba(0,0,0,0.08);border:1px solid #fed7aa;">
            <div style="font-size:40px;margin-bottom:12px;">✅</div>
            <h3 style="margin:0 0 8px 0;color:#c2410c;">Tilkoblet Strava!</h3>
            <p style="font-size:14px;color:#7c2d12;margin:0 0 16px 0;">Velkommen, <strong>${athleteName}</strong>. Vindu lukkes straks...</p>
          </div>
          <script>
            try {
              if (window.opener) {
                window.opener.postMessage(${safePayload}, '*');
                setTimeout(() => window.close(), 600);
              } else {
                window.location.href = '/';
              }
            } catch(e) {
              window.close();
            }
          </script>
        </body>
      </html>
    `, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Set-Cookie': `strava_token=${tokenData.access_token}; Path=/; HttpOnly; SameSite=None; Secure; Max-Age=2592000`
      }
    });

  } catch (err) {
    return new Response(`Error: ${err.message}`, { status: 500 });
  }
}
