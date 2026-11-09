import { NextResponse } from 'next/server';

const POPULAR_SKI_SPOTS = [
  { id: "p-sjusjoen", name: "Sjusjøen", detail: "Ringsaker / Hedmark (Birkebeinerløypa)", lat: 61.15, lon: 10.70 },
  { id: "p-holmenkollen", name: "Holmenkollen", detail: "Oslo (Nordmarka)", lat: 59.96, lon: 10.67 },
  { id: "p-frognerseteren", name: "Frognerseteren / Kongeveien", detail: "Oslo (Nordmarka)", lat: 59.98, lon: 10.68 },
  { id: "p-sorkedalen", name: "Sørkedalen", detail: "Oslo / Bærum (Nordmarka)", lat: 60.02, lon: 10.61 },
  { id: "p-mylla", name: "Mylla", detail: "Lunner (Nordmarka nord)", lat: 60.25, lon: 10.61 },
  { id: "p-ringkollen", name: "Ringkollen", detail: "Ringerike (Krokskogen)", lat: 60.17, lon: 10.36 },
  { id: "p-beitostolen", name: "Beitostølen", detail: "Øystre Slidre / Valdres", lat: 61.25, lon: 8.90 },
  { id: "p-geilo", name: "Geilo", detail: "Hol (Vestlia / Hallingdal)", lat: 60.53, lon: 8.20 },
  { id: "p-trysil", name: "Trysil", detail: "Trysilfjellet", lat: 61.31, lon: 12.26 },
  { id: "p-skeikampen", name: "Skeikampen", detail: "Gausdal", lat: 61.34, lon: 10.09 },
  { id: "p-hafjell", name: "Hafjell / Øyerfjellet", detail: "Øyer / Lillehammer", lat: 61.23, lon: 10.45 },
  { id: "p-kvitfjell", name: "Kvitfjell", detail: "Ringebu", lat: 61.46, lon: 10.13 },
  { id: "p-gala", name: "Gålå", detail: "Sør-Fron (Peer Gynt-veien)", lat: 61.50, lon: 9.80 },
  { id: "p-granasen", name: "Granåsen (Trondheim)", detail: "Trondheim / Bymarka", lat: 63.38, lon: 10.31 },
  { id: "p-norefjell", name: "Norefjell", detail: "Krødsherad", lat: 60.19, lon: 9.59 },
  { id: "p-hemsedal", name: "Hemsedal (Gravset)", detail: "Hemsedal", lat: 60.86, lon: 8.56 },
  { id: "p-hovden", name: "Hovden", detail: "Bykle (Setesdal)", lat: 61.99, lon: 7.35 },
  { id: "p-voss", name: "Voss (Myrkdalen)", detail: "Vestland", lat: 60.85, lon: 6.46 },
  { id: "p-natrudstilen", name: "Natrudstilen (Sjusjøen Arena)", detail: "Ringsaker", lat: 61.11, lon: 10.74 },
  { id: "p-budor", name: "Budor", detail: "Løten (Hedmarksvidda)", lat: 60.94, lon: 11.29 },
  { id: "p-romeriksasene", name: "Romeriksåsene (Brovoll)", detail: "Nannestad / Lunner", lat: 60.27, lon: 10.87 },
  { id: "p-konnerud", name: "Konnerud", detail: "Drammen", lat: 59.72, lon: 10.15 }
];

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get('q') || '').trim();
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');

    // 1. Revers geokoding hvis lat/lon er oppgitt (f.eks. "Bruk min posisjon")
    if (lat && lon) {
      try {
        const revUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&addressdetails=1`;
        const revRes = await fetch(revUrl, {
          headers: { 'User-Agent': 'SkiParkPro/1.0 (kjetil@sportienda.com)' },
          next: { revalidate: 3600 }
        });
        if (revRes.ok) {
          const revData = await revRes.json();
          const addr = revData.address || {};
          const placeName = addr.village || addr.town || addr.municipality || addr.suburb || addr.city || revData.name || "Min posisjon";
          const detail = [addr.county, addr.state, addr.country].filter(Boolean).join(", ");
          return NextResponse.json({
            place: {
              name: placeName,
              detail: detail || "GPS-posisjon",
              lat: parseFloat(lat),
              lon: parseFloat(lon)
            }
          });
        }
      } catch (err) {
        // Fallback
        return NextResponse.json({
          place: {
            name: "Min posisjon",
            detail: `${parseFloat(lat).toFixed(2)}, ${parseFloat(lon).toFixed(2)}`,
            lat: parseFloat(lat),
            lon: parseFloat(lon)
          }
        });
      }
    }

    if (!q) {
      return NextResponse.json({ results: POPULAR_SKI_SPOTS });
    }

    const lowerQ = q.toLowerCase();

    // 2. Søk i populære skidestinasjoner først
    const localMatches = POPULAR_SKI_SPOTS.filter(s =>
      s.name.toLowerCase().includes(lowerQ) ||
      s.detail.toLowerCase().includes(lowerQ)
    );

    // 3. Søk via OpenStreetMap Nominatim for alle andre steder i Norge/Norden
    let osmResults = [];
    try {
      const osmUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&countrycodes=no,se,fi&addressdetails=1&limit=6`;
      const osmRes = await fetch(osmUrl, {
        headers: { 'User-Agent': 'SkiParkPro/1.0 (kjetil@sportienda.com)' },
        next: { revalidate: 300 }
      });
      if (osmRes.ok) {
        const osmData = await osmRes.json();
        osmResults = osmData.map(item => {
          const addr = item.address || {};
          const shortName = item.name || addr.village || addr.town || addr.municipality || addr.city || item.display_name.split(',')[0];
          const detailParts = [addr.municipality, addr.county || addr.state].filter(Boolean);
          const detail = detailParts.length > 0 ? detailParts.join(', ') : item.display_name.split(',').slice(1, 3).join(', ').trim();

          return {
            id: `osm-${item.place_id}`,
            name: shortName,
            detail: detail || "Norge",
            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon)
          };
        });
      }
    } catch (e) {
      // Ignore network errors on Nominatim, fall back to localMatches
    }

    // Kombiner og fjern duplikater
    const combined = [...localMatches];
    const seenCoords = new Set(localMatches.map(m => `${m.lat.toFixed(2)},${m.lon.toFixed(2)}`));

    for (const r of osmResults) {
      const key = `${r.lat.toFixed(2)},${r.lon.toFixed(2)}`;
      if (!seenCoords.has(key)) {
        seenCoords.add(key);
        combined.push(r);
      }
    }

    return NextResponse.json({ results: combined.slice(0, 10) });

  } catch (error) {
    return NextResponse.json({ results: POPULAR_SKI_SPOTS.slice(0, 8), error: error.message });
  }
}
