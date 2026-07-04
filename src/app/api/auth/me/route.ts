import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function GET() {
  try {
    await dbConnect();

    // Fetch the first user found in your database to act as the current logged-in user
    const user = await User.findOne();
    if (!user) {
      return NextResponse.json({ message: "No user found in the database. Please register a user first." }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
