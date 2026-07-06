import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/dbConnect';
import Quiz from '@/models/Quiz';
import User from '@/models/User';

// ======================================================================
// 1. GET: Fetch all quizzes
// ======================================================================
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();

    // Query database: Fetch all quiz documents
    const quizzes = await Quiz.find();

    return NextResponse.json({ success: true, quizzes });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ======================================================================
// 2. POST: Create a new quiz
// ======================================================================
export async function POST(req: Request) {
  try {
    await dbConnect();

    // 1. Get the token from cookies
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
      return NextResponse.json({ message: "Access Denied: Session expired or invalid!" }, { status: 401 });
    }

    // 3. Fetch active user and verify admin role
    const activeUser = await User.findById(decoded.userId);
    if (!activeUser || activeUser.role !== 'admin') {
      return NextResponse.json({ message: "Access Denied: Admin privileges required to create quizzes!" }, { status: 403 });
    }

    // A. Parse the request body
    const { title, description, questions, difficulty, xpReward } = await req.json();

    // B. Validation: Ensure title, questions, and xpReward exist (description is optional!)
    if (!title || !questions || !xpReward) {
      return NextResponse.json({ message: "Title, questions, and xpReward are required!" }, { status: 400 });
    }

    // Ensure questions array contains at least one question
    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ message: "Please provide at least one question!" }, { status: 400 });
    }

    // C. Create Quiz: Save the quiz to MongoDB
    const newQuiz = await Quiz.create({
      title,
      description: description || '',
      questions,
      difficulty: difficulty || 'medium',
      xpReward,
    });

    return NextResponse.json({ message: "Quiz created successfully!", quiz: newQuiz }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
