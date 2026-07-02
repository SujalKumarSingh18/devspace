import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    // 1. Connect to the database
    await dbConnect();

    // 2. Parse username, email, and password from the request JSON
    const { username, email, password } = await req.json();

    // 3. Validation: check if all three fields exist
    if (!username || !email || !password) {
      return NextResponse.json({
        message: "Username, Email, and Password are required!",
      }, { status: 400 });
    }

    // 4. Check database: Check if a user already exists with the same email OR username
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return NextResponse.json({
        message: "User with this username or email already exists",
      }, { status: 400 });
    }

    // 5. Hash password: Use bcrypt.hash() with a salt round of 12
    const hashedPassword = await bcrypt.hash(password, 12);

    // 6. Create user: Save username, email, and passwordHash to MongoDB
    // Note: The field name in our User schema is passwordHash, not password!
    await User.create({
      username,
      email,
      passwordHash: hashedPassword,
    });

    // 7. Return a success response with a 201 status code
    return NextResponse.json({ message: "User registered successfully!" }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
