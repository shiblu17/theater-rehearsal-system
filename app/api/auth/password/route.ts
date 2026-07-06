import { NextResponse } from 'next/server';
import { getSessionRoll } from '@/lib/auth';
import { updateMemberPassword } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const roll = await getSessionRoll();
    if (!roll) {
      return NextResponse.json({ error: 'অননুমোদিত অ্যাক্সেস। দয়া করে লগইন করুন।' }, { status: 401 });
    }
    
    const { newPassword } = await request.json();
    if (!newPassword || newPassword.trim().length < 4) {
      return NextResponse.json({ error: 'পাসওয়ার্ডটি অন্তত ৪ অক্ষরের হতে হবে।' }, { status: 400 });
    }
    
    const success = await updateMemberPassword(roll, newPassword.trim());
    if (!success) {
      return NextResponse.json({ error: 'পাসওয়ার্ড পরিবর্তন করতে ব্যর্থ হয়েছে।' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
