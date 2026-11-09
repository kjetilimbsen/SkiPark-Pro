import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    let token = '';

    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      const cookies = req.headers.get('cookie') || '';
      const match = cookies.match(/strava_token=([^;]+)/);
      if (match) token = match[1];
    }

    if (!token) {
      return NextResponse.json({
        error: 'Ingen Strava-tilgangsnøkkel funnet. Vennligst koble til Strava først.'
      }, { status: 401 });
    }

    // Hent de siste 40 aktivitetene fra Strava
    const stravaRes = await fetch('https://www.strava.com/api/v3/athlete/activities?per_page=40', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!stravaRes.ok) {
      if (stravaRes.status === 401) {
        return NextResponse.json({ error: 'Strava-tokenet har utløpt. Koble til på nytt.' }, { status: 401 });
      }
      const errText = await stravaRes.text();
      return NextResponse.json({ error: `Strava API feilet (${stravaRes.status}): ${errText}` }, { status: stravaRes.status });
    }

    const rawActivities = await stravaRes.json();

    // Formater aktiviteter for SkiPark Pro
    const activities = (rawActivities || []).map(act => {
      const distanceKm = Math.round((act.distance / 1000) * 10) / 10;
      const startDate = act.start_date_local ? act.start_date_local.split('T')[0] : '';
      const movingTimeMinutes = Math.round(act.moving_time / 60);

      return {
        id: `strava-${act.id}`,
        title: act.name,
        distanceKm,
        type: act.sport_type || act.type || 'Ski',
        date: startDate || 'Nylig',
        movingTimeMinutes,
        elevationGain: Math.round(act.total_elevation_gain || 0)
      };
    });

    return NextResponse.json({
      activities,
      totalCount: activities.length
    });

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
