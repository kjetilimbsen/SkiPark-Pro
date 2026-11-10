import { NextResponse } from 'next/server';
import { claimSkiWithCode } from '../../../../lib/skiStorage.js';

export async function POST(req) {
  try {
    const body = await req.json();
    const { skiId, code } = body;

    if (!skiId || !code) {
      return NextResponse.json(
        { success: false, error: 'Både skiId og overføringskode må oppgis.' },
        { status: 400 }
      );
    }

    const result = claimSkiWithCode(skiId, code);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '✓ Eierskifte godkjent! Skiparet er overført til din stall.',
      ski: result.ski
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
