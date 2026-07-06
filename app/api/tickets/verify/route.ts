import { NextResponse } from 'next/server';
import { verifyTicket } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { ticketId } = await request.json();
    if (!ticketId) {
      return NextResponse.json({ error: 'টিকিট আইডি প্রয়োজন।' }, { status: 400 });
    }

    const ticket = await verifyTicket(ticketId);
    return NextResponse.json({ success: true, ticket });
  } catch (error: any) {
    console.error('Error verifying ticket:', error);
    return NextResponse.json({ error: error.message || 'টিকিট যাচাই করতে সমস্যা হয়েছে।' }, { status: 500 });
  }
}
