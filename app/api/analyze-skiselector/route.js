import { NextResponse } from 'next/server';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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

Returner KUN gyldig JSON uten markdown-formatering eller backticks:
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

    // Aktive, gyldige modeller i API-et
    const modelsToTry = [
      'gemini-2.5-flash',
      'gemini-1.5-flash'
    ];

    let lastError = null;
    let result = null;

    for (const model of modelsToTry) {
      // Prøv inntil 2 ganger per modell hvis Google svarer 503 (midlertidig overbelastning)
      for (let attempt = 0; attempt < 2; attempt++) {
        if (attempt > 0) {
          await sleep(1500); // Vent 1,5 sekunder før retry
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

        const response = await fetch(url, {
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
            ],
            generationConfig: {
              temperature: 0.1
            }
          })
        });

        if (response.ok) {
          result = await response.json();
          break;
        }

        const errText = await response.text();
        lastError = `Modell ${model} feilet (${response.status}): ${errText}`;

        // Hvis det ikke er overbelastning (503) eller rate limit (429), gå videre
        if (response.status !== 503 && response.status !== 429) {
          break;
        }
      }

      if (result) break;
    }

    if (!result) {
      return NextResponse.json({ error: `Kunne ikke fullføre bildeanalysen. ${lastError}` }, { status: 503 });
    }

    let textResponse = result.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();

    const parsedData = JSON.parse(textResponse);
    return NextResponse.json({ data: parsedData });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
