export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getAttendanceLogs, updateAttendance, deleteAttendance } from '@/lib/db';

export async function GET() {
  try {
    const logs = await getAttendanceLogs();
    return NextResponse.json(logs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status, is_late } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'আইডি এবং স্ট্যাটাস প্রয়োজন।' }, { status: 400 });
    }

    const log = await updateAttendance(id, { status, is_late });
    return NextResponse.json({ success: true, log });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'হাজিরা রেকর্ড আপডেট করা যায়নি।' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'আইডি প্রয়োজন।' }, { status: 400 });
    }

    await deleteAttendance(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'হাজিরা রেকর্ড ডিলিট করা যায়নি।' }, { status: 500 });
  }
}
