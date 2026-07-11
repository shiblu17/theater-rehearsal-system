export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getRehearsalNotes, addRehearsalNote, updateRehearsalNote, deleteRehearsalNote } from '@/lib/db';

export async function GET() {
  try {
    const notes = await getRehearsalNotes();
    return NextResponse.json(notes);
  } catch (error) {
    return NextResponse.json({ error: 'নির্দেশক ডায়েরি লোড করতে সমস্যা হয়েছে।' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { content } = await request.json();
    if (!content) {
      return NextResponse.json({ error: 'মন্তব্য খালি রাখা যাবে না।' }, { status: 400 });
    }

    const note = await addRehearsalNote(content);
    return NextResponse.json(note);
  } catch (error) {
    return NextResponse.json({ error: 'নির্দেশক ডায়েরি পোস্ট করতে সমস্যা হয়েছে।' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, content } = body;

    if (!id || !content) {
      return NextResponse.json({ error: 'আইডি এবং মন্তব্য প্রয়োজন।' }, { status: 400 });
    }

    const note = await updateRehearsalNote(id, content);
    return NextResponse.json({ success: true, note });
  } catch (error) {
    return NextResponse.json({ error: 'নির্দেশক ডায়েরি আপডেট করতে সমস্যা হয়েছে।' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'আইডি প্রয়োজন।' }, { status: 400 });
    }

    await deleteRehearsalNote(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'নির্দেশক ডায়েরি ডিলিট করতে সমস্যা হয়েছে।' }, { status: 500 });
  }
}
