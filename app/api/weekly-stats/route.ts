export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getWeeklyStats } from '@/lib/db';

export async function GET() {
  try {
    const stats = await getWeeklyStats();
    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json({ error: 'সাপ্তাহিক পরিসংখ্যান লোড করতে সমস্যা হয়েছে।' }, { status: 500 });
  }
}
