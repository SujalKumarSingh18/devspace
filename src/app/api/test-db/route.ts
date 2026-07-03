import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function GET() {
  try {
    // 1. Attempt to connect to the database
    console.log("Testing database connection...");
    await dbConnect();
    
    // 2. Perform a simple query using our User model
    const count = await User.countDocuments();
    
    return NextResponse.json({
      success: true,
      message: "Database connected and queried successfully!",
      userCount: count
    });
  } catch (error: any) {
    console.error("Database test failed:", error);
    return NextResponse.json({
      success: false,
      message: "Database connection failed!",
      error: error.message
    }, { status: 500 });
  }
}
