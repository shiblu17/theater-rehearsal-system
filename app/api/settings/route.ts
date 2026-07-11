export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getSystemSettings, updateSystemSettings } from '@/lib/db';

export async function GET() {
  try {
    const settings = await getSystemSettings();
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: 'সেটিংস লোড করতে সমস্যা হয়েছে।' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { morning_cutoff, afternoon_cutoff, session_transition } = body;

    if (!morning_cutoff || !afternoon_cutoff || !session_transition) {
      return NextResponse.json({ error: 'প্রয়োজনীয় ফিল্ডগুলো পূরণ করুন।' }, { status: 400 });
    }

    const settings = await updateSystemSettings({ morning_cutoff, afternoon_cutoff, session_transition });
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: 'সেটিংস আপডেট করতে সমস্যা হয়েছে।' }, { status: 500 });
  }
}
