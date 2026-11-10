import { NextResponse } from 'next/server';
import { getSharedSki, saveSharedSki, setTransferStatus } from '../../../../lib/skiStorage.js';

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);

    // Dersom klienten sendte med encoded data i lenken (f.eks. ved første deling), lagre/oppdater i cachen
    const encodedData = searchParams.get('d');
    if (encodedData) {
      try {
        const decoded = JSON.parse(Buffer.from(encodedData, 'base64url').toString('utf-8'));
        if (decoded && decoded.id === id) {
          saveSharedSki(decoded);
        }
      } catch (e) {}
    }

    const ski = getSharedSki(id);
    if (!ski) {
      return NextResponse.json({ error: 'Fant ikke skiparet' }, { status: 404 });
    }

    // Masker overføringskoden i offentlig GET slik at tilfeldige aldri kan se koden!
    const publicSki = {
      ...ski,
      transferActive: Boolean(ski.transferActive),
      transferCode: undefined // HEMMELIG: vises kun til eier ved aktivering
    };

    return NextResponse.json({
      ski: publicSki,
      transferActive: Boolean(ski.transferActive)
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const { ski, transferActive, transferCode } = body;

    let saved = null;
    if (ski) {
      saved = saveSharedSki({ ...ski, id });
    }

    let transferResult = null;
    if (typeof transferActive === 'boolean') {
      transferResult = setTransferStatus(id, transferActive, transferCode);
    }

    const currentSki = getSharedSki(id);

    return NextResponse.json({
      success: true,
      ski: currentSki,
      transferActive: transferResult ? transferResult.transferActive : Boolean(currentSki?.transferActive),
      transferCode: transferResult ? transferResult.transferCode : currentSki?.transferCode
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
