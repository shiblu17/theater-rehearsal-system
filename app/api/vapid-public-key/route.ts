import { NextResponse } from 'next/server';
import { getVAPIDKeys } from '@/lib/vapid';

export async function GET() {
  try {
    const keys = getVAPIDKeys();
    return NextResponse.json({ publicKey: keys.publicKey });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
