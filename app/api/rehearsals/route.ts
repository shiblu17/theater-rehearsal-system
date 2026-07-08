import { NextResponse } from 'next/server';
import { getRehearsals, addRehearsal, deleteRehearsal, updateRehearsal } from '@/lib/db';

export async function GET() {
  try {
    const rehearsals = await getRehearsals();
    return NextResponse.json(rehearsals);
  } catch (error) {
    return NextResponse.json({ error: 'মহড়া শিডিউল লোড করতে সমস্যা হয়েছে।' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, date, time, description, required_cast } = body;

    if (!date || !time) {
      return NextResponse.json({ error: 'তারিখ এবং সময় অবশ্যই প্রদান করুন।' }, { status: 400 });
    }

    const finalTitle = title && title.trim() ? title.trim() : 'মহড়া';
    const finalRequiredCast = required_cast && required_cast.trim() ? required_cast.trim() : 'সকল কুশীলব';

    const rehearsal = await addRehearsal({ 
      title: finalTitle, 
      date, 
      time, 
      description, 
      required_cast: finalRequiredCast 
    });
    return NextResponse.json(rehearsal);
  } catch (error) {
    return NextResponse.json({ error: 'মহড়া শিডিউল তৈরি করতে সমস্যা হয়েছে।' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, title, date, time, description, required_cast } = body;

    if (!id) {
      return NextResponse.json({ error: 'আইডি প্রয়োজন।' }, { status: 400 });
    }

    const rehearsal = await updateRehearsal(id, { title, date, time, description, required_cast });
    return NextResponse.json({ success: true, rehearsal });
  } catch (error) {
    return NextResponse.json({ error: 'মহড়া শিডিউল আপডেট করতে সমস্যা হয়েছে।' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'আইডি প্রয়োজন।' }, { status: 400 });
    }

    await deleteRehearsal(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'মহড়া শিডিউল ডিলিট করতে সমস্যা হয়েছে।' }, { status: 500 });
  }
}
