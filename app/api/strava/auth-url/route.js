import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const clientId = process.env.STRAVA_CLIENT_ID;
    const clientSecret = process.env.STRAVA_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json({
        configured: false,
        message: 'Strava API-nøkler (STRAVA_CLIENT_ID og STRAVA_CLIENT_SECRET) er ikke konfigurert i miljøvariabler.'
      });
    }

    const { searchParams } = new URL(req.url);
    const origin = searchParams.get('origin') || process.env.APP_URL || 'http://localhost:3000';
    const redirectUri = `${origin}/auth/strava/callback`;

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      approval_prompt: 'auto',
      scope: 'read,activity:read_all'
    });

    const stravaAuthUrl = `https://www.strava.com/oauth/authorize?${params.toString()}`;

    return NextResponse.json({
      configured: true,
      url: stravaAuthUrl,
      redirectUri
    });

  } catch (error) {
    return NextResponse.json({ configured: false, error: error.message }, { status: 500 });
  }
}
