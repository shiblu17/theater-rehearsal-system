import { NextResponse } from 'next/server';
import { getSessionMember, clearSession } from '@/lib/auth';

export async function GET() {
  try {
    const member = await getSessionMember();
    if (!member) {
      return NextResponse.json({ authenticated: false });
    }
    return NextResponse.json({ authenticated: true, member });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await clearSession();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
