import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

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

    // 6. Generate JWT Token
    const secret = process.env.JWT_SECRET || 'devspace-secret-key-123!';
    const token = jwt.sign(
      { userId: user._id, username: user.username, email: user.email, role: user.role },
      secret,
      { expiresIn: '1d' }
    );

    // 7. Set HTTP-only Cookie
    const cookieStore = await cookies();
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/'
    });

    // 8. Return success: Return user details and success message
    return NextResponse.json({ 
      message: "Login successful!", 
      user: { 
        username: user.username, 
        email: user.email,
        role: user.role
      } 
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
