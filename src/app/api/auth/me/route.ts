import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();

    // 1. Get the token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    // 2. If no token exists, return unauthorized
    if (!token) {
      return NextResponse.json({ success: false, message: "No active session" }, { status: 401 });
    }

    // 3. Verify JWT token
    const secret = process.env.JWT_SECRET || 'devspace-secret-key-123!';
    let decoded: any;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      return NextResponse.json({ success: false, message: "Session expired or invalid" }, { status: 401 });
    }

    // 4. Fetch the user from the database
    const user = await User.findById(decoded.userId).select('-passwordHash');
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
