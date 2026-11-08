import { NextResponse } from 'next/server';

export const maxDuration = 30;

function parseSkiText(text) {
  const result = {
    brand: null,
    model: null,
    type: "Klassisk",
    lengthCm: null,
    camberType: "Universal",
    grind: "Standard",
    weightMin: null,
    weightMax: null,
    hbw: null,
    fbw: null,
    pocketFront: null,
    pocketRear: null
  };

  if (!text) return result;

  const t = text.replace(/,/g, '.');

  // Merker
  const brands = ["Kästle", "Kaestle", "Fischer", "Madshus", "Rossignol", "Atomic", "Salomon", "Peltonen"];
  for (const b of brands) {
    if (new RegExp(`\\b${b}\\b`, 'i').test(t)) {
      result.brand = b === "Kaestle" ? "Kästle" : b;
      break;
    }
  }

  // Modeller
  if (/RX\s*10(\s*2\.0)?/i.test(t)) result.model = "RX 10 2.0";
  else if (/Speedmax/i.test(t)) result.model = "Speedmax 3D";
  else if (/Redline/i.test(t)) result.model = "Redline 3.0";
  else if (/Redster/i.test(t)) result.model = "Redster";
  else if (/Delta/i.test(t)) result.model = "Delta Sport";

  // Stilart
  if (/skate|skating/i.test(t)) result.type = "Skate";
  else if (/skin|skintec|r-skin|twin\s*skin/i.test(t)) result.type = "Felleski";
  else if (/classic|klassisk/i.test(t)) result.type = "Klassisk";

  // Lengde (typisk 180-210 cm)
  const lengthMatch = t.match(/\b(18[0-9]|19[0-9]|20[0-9]|21[0])\s*(cm)?\b/i);
  if (lengthMatch) result.lengthCm = Number(lengthMatch[1]);

  // Vekt (f.eks 70-80 kg, <65-85 kg, el.l.)
  const weightRangeMatch = t.match(/(\d{2,3})\s*[-–/]\s*(\d{2,3})\s*kg/i);
  if (weightRangeMatch) {
    result.weightMin = Number(weightRangeMatch[1]);
    result.weightMax = Number(weightRangeMatch[2]);
  } else {
    const singleWeightMatch = t.match(/(\d{2,3})\s*kg/i);
    if (singleWeightMatch) {
      result.weightMin = Number(singleWeightMatch[1]) - 5;
      result.weightMax = Number(singleWeightMatch[1]) + 5;
    }
  }

  // HBW (halvvekt spennhøyde, f.eks HBW 1.29 eller HBW: 1.15)
  const hbwMatch = t.match(/HBW\s*[:=]?\s*(\d+\.\d+)/i) || t.match(/\b1\.\d{2}\b/);
  if (hbwMatch) result.hbw = Number(hbwMatch[1] || hbwMatch[0]);

  // FBW (fullvekt spennhøyde, f.eks FBW 0.22)
  const fbwMatch = t.match(/FBW\s*[:=]?\s*(\d+\.\d+)/i) || t.match(/\b0\.\d{2}\b/);
  if (fbwMatch) result.fbw = Number(fbwMatch[1] || fbwMatch[0]);

  // Smørelommer (lomme foran/bak)
  const pocketFrontMatch = t.match(/(?:lomme\s*foran|front|pocket\s*front)\s*[:=]?\s*(\d+)/i);
  if (pocketFrontMatch) result.pocketFront = Number(pocketFrontMatch[1]);

  const pocketRearMatch = t.match(/(?:lomme\s*bak|rear|back|pocket\s*rear)\s*[:=]?\s*(\d+)/i);
  if (pocketRearMatch) result.pocketRear = Number(pocketRearMatch[1]);

  // Slipestruktur
  const grindMatch = t.match(/\b([A-Z]{1,3}\s*[-]?\s*\d{1,2}|M61|P5-1|CW1|UW-1)\b/i);
  if (grindMatch) result.grind = grindMatch[0].toUpperCase();

  return result;
}

export async function POST(req) {
  try {
    const rawKey = process.env.GEMINI_API_KEY;
    if (!rawKey) {
      return NextResponse.json(
        { error: 'API-nøkkel mangler i Environment Variables på Vercel.' },
        { status: 500 }
      );
    }

    const apiKey = rawKey.trim();
    const body = await req.json();

    let images = [];
    if (Array.isArray(body.images) && body.images.length > 0) {
      images = body.images;
    } else if (body.imageBase64) {
      images = [{ imageBase64: body.imageBase64, mimeType: body.mimeType || 'image/jpeg' }];
    }

    if (images.length === 0) {
      return NextResponse.json({ error: 'Ingen bildedata mottatt' }, { status: 400 });
    }

    // Google Cloud Vision Text Detection REST API
    const visionUrl = `https://vision.googleapis.com/v1/images:annotate?key=${encodeURIComponent(apiKey)}`;

    const requests = images.map(img => ({
      image: { content: img.imageBase64 },
      features: [{ type: 'TEXT_DETECTION' }]
    }));

    const visionRes = await fetch(visionUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requests })
    });

    if (!visionRes.ok) {
      const errText = await visionRes.text();
      return NextResponse.json({ error: `Vision OCR feilet (${visionRes.status}): ${errText}` }, { status: visionRes.status });
    }

    const visionData = await visionRes.json();

    // Slå sammen all oppdaget tekst fra bildene
    let combinedRawText = "";
    (visionData.responses || []).forEach(res => {
      if (res.fullTextAnnotation && res.fullTextAnnotation.text) {
        combinedRawText += "\n" + res.fullTextAnnotation.text;
      }
    });

    if (!combinedRawText.trim()) {
      return NextResponse.json({ 
        error: "Fant ingen lesbar tekst på bildene. Prøv å ta et bilde tettere på klistrelappen eller tuppen." 
      }, { status: 422 });
    }

    // Trekk ut data med regelbasert parsing
    const parsed = parseSkiText(combinedRawText);

    return NextResponse.json({ 
      data: parsed,
      rawText: combinedRawText.trim()
    });

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
