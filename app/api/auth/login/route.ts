import { NextResponse } from 'next/server';
import { getMembers } from '@/lib/db';
import { setSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { roll, password } = await request.json();
    
    if (!roll || !password) {
      return NextResponse.json({ error: 'রোল নম্বর এবং পাসওয়ার্ড প্রদান করুন।' }, { status: 400 });
    }
    
    const members = await getMembers();
    const member = members.find(m => m.roll === roll.trim());
    
    if (!member) {
      return NextResponse.json({ error: 'এই রোল নম্বরটি তালিকায় পাওয়া যায়নি।' }, { status: 404 });
    }
    
    // Check password (fallback to default 'roktokorobi52' if empty or missing in DB)
    const expectedPassword = member.password || 'roktokorobi52';
    if (expectedPassword !== password) {
      return NextResponse.json({ error: 'ভুল পাসওয়ার্ড। দয়া করে আবার চেষ্টা করুন।' }, { status: 401 });
    }
    
    // Set cookie session
    await setSession(member.roll);
    
    return NextResponse.json({ success: true, member });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
