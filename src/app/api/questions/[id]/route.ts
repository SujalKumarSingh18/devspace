import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/dbConnect';
import Question from '@/models/Question';
import User from '@/models/User';
import Answer from '@/models/Answer';


// ======================================================================
// GET: Fetch a single Question by ID (populated with author details)
// ======================================================================
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    // A. Await the params Promise to get the dynamic question ID
    const { id } = await params;

    // B. Query database: Find the question by ID and populate its 'author' field (username)
    // Hint: const question = await Question.findById(id).populate('author', 'username');
    const question = await Question.findById(id).populate('author', 'username');

    // C. Validation: If question is not found, return 404 Not Found
    if (!question){
      return NextResponse.json({error: "Question not found"}, {status: 404});
    }

    // D. Return success response with the fetched question document
    return NextResponse.json({ success: true, question}, {status: 200});

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ======================================================================
// DELETE: Remove a Question and all its answers (Admin Only)
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

    // 3. Find target question
    const question = await Question.findById(id);
    if (!question) {
      return NextResponse.json({ message: "Question not found!" }, { status: 404 });
    }

    // 4. Verify Admin privileges OR Question ownership
    const activeUser = await User.findById(decoded.userId);
    const isAuthor = question.author.toString() === decoded.userId;
    const isAdmin = activeUser && activeUser.role === 'admin';

    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ message: "Access Denied: You can only delete your own questions!" }, { status: 403 });
    }

    // 5. Delete Question and cascade delete its Answer replies
    const questionDeleted = await Question.findByIdAndDelete(id);
    const answersDeleted = await Answer.deleteMany({ question: id });
    

    return NextResponse.json({ 
      success: true, 
      message: "Question and all its answers deleted successfully!" 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
