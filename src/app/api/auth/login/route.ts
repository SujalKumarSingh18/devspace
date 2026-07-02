import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    // 1. Connect to the database
    await dbConnect();

    // 2. Parse email and password from the request JSON
    const { email, password } = await req.json();

    // 3. Validation: Check if both email and password are provided
    if (!email || !password) {
      return NextResponse.json({
        message: "Email & Password are required!"
      }, { status: 400 });
    }

    // 4. Find User: Search MongoDB for a user with the provided email.
    // Note: Always AWAIT database queries, otherwise you get a Promise/Query object, not the document!
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({
        message: "Invalid email or password"
      }, { status: 401 });
    }

    // 5. Compare Passwords: Use bcrypt.compare() to check if the input password matches the stored passwordHash
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({
        message: "Invalid email or password"
      }, { status: 401 });
    }

    // 6. Return success: If it matches, return a 200 OK response with the user info
    return NextResponse.json({ 
      message: "Login successful!", 
      user: { 
        username: user.username, 
        email: user.email 
      } 
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
