import { NextResponse } from 'next/server';
import { getMembers, createOrUpdateMember, deleteMember } from '@/lib/db';

export async function GET() {
  try {
    const members = await getMembers();
    return NextResponse.json(members);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { roll, name, role, character_name, avatar_url, id } = body;

    if (!roll || !name || !role) {
      return NextResponse.json({ error: 'রোল, নাম এবং ভূমিকা আবশ্যক।' }, { status: 400 });
    }

    const member = await createOrUpdateMember({ id, roll, name, role, character_name, avatar_url });
    return NextResponse.json({ success: true, member });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'কুশীলব তথ্য সেভ করা যায়নি।' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'আইডি প্রয়োজন।' }, { status: 400 });
    }

    await deleteMember(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'কুশীলব ডিলিট করা যায়নি।' }, { status: 500 });
  }
}
