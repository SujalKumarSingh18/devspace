import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Quiz from '@/models/Quiz';

// ======================================================================
// 1. GET: Fetch all quizzes
// ======================================================================
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
