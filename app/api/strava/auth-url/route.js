import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const origin = searchParams.get('origin') || process.env.APP_URL || 'http://localhost:3000';
    const redirectUri = `${origin}/auth/strava/callback`;

    // 1. Sjekk miljøvariabler fra server/Vercel først
    let clientId = process.env.STRAVA_CLIENT_ID;
    let clientSecret = process.env.STRAVA_CLIENT_SECRET;

    // 2. Hvis ikke på server, sjekk om brukeren sendte inn custom credentials
    if (!clientId) {
      clientId = searchParams.get('client_id');
      clientSecret = searchParams.get('client_secret');
    }

    if (!clientId) {
      return NextResponse.json({
        configured: false,
        needsCredentials: true,
        message: 'Strava Client ID mangler. Legg inn STRAVA_CLIENT_ID og STRAVA_CLIENT_SECRET i Vercel, eller oppgi dem i appen.'
      });
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      approval_prompt: 'auto',
      scope: 'read,activity:read_all'
    });

    const stravaAuthUrl = `https://www.strava.com/oauth/authorize?${params.toString()}`;

    const res = NextResponse.json({
      configured: true,
      url: stravaAuthUrl,
      redirectUri
    });

    // Lagre midlertidig i secure cookie slik at callback finner secret
    if (clientSecret) {
      res.cookies.set('strava_client_secret', clientSecret, { path: '/', httpOnly: true, secure: true, maxAge: 3600 });
      res.cookies.set('strava_client_id', clientId, { path: '/', httpOnly: true, secure: true, maxAge: 3600 });
    }

    return res;
  } catch (error) {
    return NextResponse.json({ configured: false, error: error.message }, { status: 500 });
  }
}
