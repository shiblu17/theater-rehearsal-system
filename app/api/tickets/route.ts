import { NextRequest, NextResponse } from 'next/server';
import { getTickets, bookTicket, updateTicket, deleteTicket } from '@/lib/db';

export async function GET() {
  try {
    const tickets = await getTickets();
    return NextResponse.json(tickets);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, seats } = body;

    if (!name || !email || !phone || !seats) {
      return NextResponse.json({ error: 'সবগুলো তথ্য সঠিকভাবে পূরণ করুন।' }, { status: 400 });
    }

    const ticket = await bookTicket({
      name,
      email,
      phone,
      seats: parseInt(seats, 10)
    });

    return NextResponse.json({ success: true, ticket });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, email, phone, seats, is_verified } = body;

    if (!id) {
      return NextResponse.json({ error: 'টিকিট আইডি প্রয়োজন।' }, { status: 400 });
    }

    const ticket = await updateTicket(id, { name, email, phone, seats: parseInt(seats, 10), is_verified });
    return NextResponse.json({ success: true, ticket });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'টিকিট আপডেট করা যায়নি।' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'আইডি প্রয়োজন।' }, { status: 400 });
    }

    await deleteTicket(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'টিকিট ডিলিট করা যায়নি।' }, { status: 500 });
  }
}
