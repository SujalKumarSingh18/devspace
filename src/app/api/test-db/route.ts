import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import QuizAttempt from '@/models/QuizAttempt';
import Quiz from '@/models/Quiz';

export async function GET() {
  try {
    await dbConnect();
    const users = await User.find();
    const attempts = await QuizAttempt.find().populate('user', 'username').populate('quiz', 'title');
    const quizzes = await Quiz.find();
    
    return NextResponse.json({
      success: true,
      users,
      attempts,
      quizzes
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
