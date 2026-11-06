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

    // 1. Spør Google API hvilke modeller som er aktive og støtter generateContent
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

    // Sorter slik at flash-modeller prioriteres først
    const sortedModels = availableModels.sort((a, b) => {
      const aFlash = a.toLowerCase().includes('flash') ? 1 : 0;
      const bFlash = b.toLowerCase().includes('flash') ? 1 : 0;
      return bFlash - aFlash;
    });

    const prompt = `
Dette er et bilde av en Skiselector målestasjon-skjerm eller målerapport for langrennsski.
Analyser bildet og trekk ut følgende data med høy presisjon:
- brand: Merke (f.eks Fischer, Madshus, Rossignol, Salomon, Atomic). Hvis usikker, sett "Ukjent".
- model: Modellnavn hvis synlig (f.eks "Redline Classic", "Speedmax Skate").
- type: "Klassisk", "Skate" eller "Felleski".
- hbw: Halvvekt spennhøyde i millimeter som tall (f.eks 1.18).
- fbw: Fullvekt spennhøyde i millimeter som tall (f.eks 0.22).
- pocketFront: Smørelomme foran nullpunkt i cm som tall (f.eks 38).
- pocketRear: Smørelomme bak nullpunkt i cm som tall (f.eks 16).
- lengthCm: Lengde i cm hvis synlig (f.eks 191 eller 207).
- weightMin: Anbefalt min løpervekt i kg som tall.
- weightMax: Anbefalt maks løpervekt i kg som tall.

Returner KUN ren JSON uten markdown-formatering, ingen backticks, kun dette JSON-objektet:
{
  "brand": "string",
  "model": "string",
  "type": "string",
  "hbw": number,
  "fbw": number,
  "pocketFront": number,
  "pocketRear": number,
  "lengthCm": number,
  "weightMin": number,
  "weightMax": number
}
`;

    let lastError = null;
    let result = null;

    // 2. Prøv modellene som faktisk eksisterer på kontoen
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
        error: `Ingen av de tilgjengelige modellene (${sortedModels.join(', ')}) svarte. Siste feil: ${lastError}` 
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
