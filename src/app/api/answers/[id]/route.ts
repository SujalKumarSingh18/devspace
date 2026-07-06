import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/dbConnect';
import Answer from '@/models/Answer';
import User from '@/models/User';

// ======================================================================
// DELETE: Remove an Answer (Admin Only)
// ======================================================================
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    // 1. Authenticate user from session cookie
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) {
      return NextResponse.json({ message: "Access Denied: Log in required!" }, { status: 401 });
    }

    // 2. Verify token
    const secret = process.env.JWT_SECRET || 'devspace-secret-key-123!';
    let decoded: any;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      return NextResponse.json({ message: "Access Denied: Invalid session!" }, { status: 401 });
    }

    // 3. Find target answer
    const answer = await Answer.findById(id);
    if (!answer) {
      return NextResponse.json({ message: "Answer not found!" }, { status: 404 });
    }

    // 4. Verify Admin privileges OR Answer ownership
    const activeUser = await User.findById(decoded.userId);
    const isAuthor = answer.author.toString() === decoded.userId;
    const isAdmin = activeUser && activeUser.role === 'admin';

    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ message: "Access Denied: You can only delete your own replies!" }, { status: 403 });
    }

    // 5. Delete Answer
    const deletedAnswer = await Answer.findByIdAndDelete(id);
    

    return NextResponse.json({ 
      success: true, 
      message: "Answer deleted successfully!" 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
