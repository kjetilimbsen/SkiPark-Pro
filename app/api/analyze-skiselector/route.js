import { NextResponse } from 'next/server';

export const maxDuration = 30; // Sikrer at Vercel gir funksjonen god tid

export async function POST(req) {
  try {
    const rawKey = process.env.GEMINI_API_KEY;
    if (!rawKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY mangler i Environment Variables på Vercel.' },
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

    const prompt = `
Dette er 1 eller flere bilder av samme langrennsski (f.eks tupp med fabrikat, og bakski med modell, lengde og målelapp).
Kombiner informasjonen fra bildene til ett felles JSON-objekt:
- brand: Merke (f.eks "Kästle", "Atomic", "Fischer", "Madshus", "Rossignol", "Salomon").
- model: Modellnavn (f.eks "RX 10 2.0", "Redster C9 Skintec", "Speedmax 3D Skate").
- type: "Klassisk", "Skate" eller "Felleski" (hvis Skintec/R-Skin -> "Felleski").
- lengthCm: Lengde i cm hvis synlig (f.eks 192, 206, 207). Ellers null.
- camberType: Profil (f.eks "Cold", "Plus", "Warm", "Universal").
- grind: Slipestruktur hvis oppgitt (f.eks "CW1", "UW-1", "P5-1", "M61").
- weightMin: Min utøvervekt i kg som tall (f.eks 65 hvis "<65-85 kg", eller 85 hvis "85-95").
- weightMax: Maks utøvervekt i kg som tall (f.eks 85 hvis "<65-85 kg", eller 95 hvis "85-95").
- hbw: Halvvekt spennhøyde i mm hvis oppgitt (f.eks 1.29). Ellers null.
- fbw: Fullvekt spennhøyde i mm hvis oppgitt (f.eks 0.22). Ellers null.
- pocketFront: Smørelomme foran nullpunkt i cm som tall (f.eks 37.4). Ellers null.
- pocketRear: Smørelomme bak nullpunkt i cm som tall (f.eks 26.7 eller 16). Ellers null.

Returner KUN ren JSON uten markdown eller backticks:
{
  "brand": "string",
  "model": "string",
  "type": "string",
  "lengthCm": number,
  "camberType": "string",
  "grind": "string",
  "weightMin": number,
  "weightMax": number,
  "hbw": number,
  "fbw": number,
  "pocketFront": number,
  "pocketRear": number
}
`;

    const parts = [{ text: prompt }];
    images.forEach(img => {
      parts.push({
        inlineData: {
          mimeType: img.mimeType || 'image/jpeg',
          data: img.imageBase64
        }
      });
    });

    // Rask modellrekke: prøv standard flash direkte uten omveier
    const candidateModels = ['gemini-2.5-flash', 'gemini-1.5-flash'];
    let lastError = null;
    let result = null;

    for (const model of candidateModels) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({ contents: [{ parts }] })
      });

      if (response.ok) {
        result = await response.json();
        break;
      }

      const errText = await response.text();
      lastError = `${model} feilet (${response.status}): ${errText}`;
    }

    if (!result) {
      return NextResponse.json({ error: `Kunne ikke analysere bildene: ${lastError}` }, { status: 500 });
    }

    let textResponse = result.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();

    const parsedData = JSON.parse(textResponse);
    return NextResponse.json({ data: parsedData });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
