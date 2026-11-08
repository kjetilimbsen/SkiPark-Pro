import { NextResponse } from 'next/server';

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
    const { imageBase64, mimeType } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'Ingen bildedata mottatt' }, { status: 400 });
    }

    // 1. Spør Google API hvilke modeller som er tilgjengelige
    const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`;
    const listRes = await fetch(listUrl, {
      headers: { 'x-goog-api-key': apiKey }
    });

    if (!listRes.ok) {
      const listErr = await listRes.text();
      return NextResponse.json({ error: `Kunne ikke liste modeller (${listRes.status}): ${listErr}` }, { status: listRes.status });
    }

    const listData = await listRes.json();
    const availableModels = (listData.models || [])
      .filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent'))
      .map(m => m.name.replace(/^models\//, ''));

    if (availableModels.length === 0) {
      return NextResponse.json({ error: 'Ingen tilgjengelige modeller funnet for denne API-nøkkelen.' }, { status: 500 });
    }

    const sortedModels = availableModels.sort((a, b) => {
      const aFlash = a.toLowerCase().includes('flash') ? 1 : 0;
      const bFlash = b.toLowerCase().includes('flash') ? 1 : 0;
      return bFlash - aFlash;
    });

    const prompt = `
Dette er et bilde av enten:
1) En langrennsski med tekst på overflaten eller klistremerke/målelapp (f.eks Kästle RX10, Atomic Redster Skintec, Fischer Speedmax, Madshus).
2) En Skiselector målestasjon-skjerm eller målerapport.

Analyser bildet grundig og trekk ut følgende felt så nøyaktig som mulig:
- brand: Merke (f.eks "Kästle", "Atomic", "Fischer", "Madshus", "Rossignol", "Salomon").
- model: Modellnavn (f.eks "RX 10 2.0", "Redster C9 Skintec", "Speedmax 3D Skate").
- type: "Klassisk", "Skate" eller "Felleski" (hvis Skintec/R-Skin/Twin Skin -> "Felleski").
- lengthCm: Lengde i cm hvis synlig (f.eks 192, 206, 207). Hvis ikke funnet, sett null.
- camberType: Underlag/profil hvis oppgitt (f.eks "Cold", "Plus", "Warm", "Universal").
- grind: Slipestruktur hvis oppgitt på ski eller lapp (f.eks "CW1", "UW-1", "P5-1", "M61").
- weightMin: Anbefalt min løpervekt i kg som tall (f.eks 65 hvis det står "<65-85 kg", eller 85 hvis "MED 85-95").
- weightMax: Anbefalt maks løpervekt i kg som tall (f.eks 85 hvis "<65-85 kg", eller 95 hvis "85-95").
- hbw: Halvvekt spennhøyde i mm hvis oppgitt på klistrelapp eller Skiselector (f.eks 1.29 eller 1.15). Hvis ikke, sett null.
- fbw: Fullvekt spennhøyde i mm hvis oppgitt (f.eks 0.22 eller 0.09). Hvis ikke, sett null.
- pocketFront: Smørelomme foran nullpunkt i cm som tall (f.eks 37.4 eller 38). Hvis ikke, sett null.
- pocketRear: Smørelomme bak nullpunkt i cm som tall (f.eks 26.7 eller 16). Hvis ikke, sett null.

Returner KUN ren, gyldig JSON uten markdown-blokker eller kommentarer, på denne formen:
{
  "brand": "string",
  "model": "string",
  "type": "string",
  "lengthCm": number eller null,
  "camberType": "string",
  "grind": "string",
  "weightMin": number eller null,
  "weightMax": number eller null,
  "hbw": number eller null,
  "fbw": number eller null,
  "pocketFront": number eller null,
  "pocketRear": number eller null
}
`;

    let lastError = null;
    let result = null;

    for (const model of sortedModels) {
      const generateUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

      const response = await fetch(generateUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: mimeType || 'image/jpeg',
                    data: imageBase64
                  }
                }
              ]
            }
          ]
        })
      });

      if (response.ok) {
        result = await response.json();
        break;
      }

      const errText = await response.text();
      lastError = `Modell ${model} feilet (${response.status}): ${errText}`;
    }

    if (!result) {
      return NextResponse.json({ 
        error: `Ingen modeller svarte. Siste feil: ${lastError}` 
      }, { status: 500 });
    }

    let textResponse = result.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();

    const parsedData = JSON.parse(textResponse);
    return NextResponse.json({ data: parsedData });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
