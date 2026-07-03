import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import QuizAttempt from '@/models/QuizAttempt';
import User from '@/models/User';
import Quiz from '@/models/Quiz';

// ======================================================================
// POST: Submit a Quiz Attempt and update User reputation
// ======================================================================
export async function POST(req: Request) {
  try {
    await dbConnect();

    // A. Parse request body
    const { user, quiz, score } = await req.json();

    // B. Validation: Ensure user, quiz, and score (checking number type so 0 is allowed) are provided
    if (!user || !quiz || typeof score !== 'number') {
      return NextResponse.json({ message: "User ID, Quiz ID, and numeric score are required!" }, { status: 400 });
    }

    // C. Validation (Security): Check if User and Quiz actually exist
    const [userExists, quizExists] = await Promise.all([
      User.findById(user),
      Quiz.findById(quiz),
    ]);

    if (!userExists || !quizExists) {
      return NextResponse.json({ message: "User or Quiz does not exist" }, { status: 404 });
    }

    // D. Create Attempt: Save the attempt document to MongoDB
    const attempt = await QuizAttempt.create({ user, quiz, score });

    // E. Gamification: If score is 80% or higher, reward the user!
    let reputationUpdated = false;
    if (score >= 80) {
      // Anti-farm check: Ensure they haven't successfully passed this quiz before
      const alreadyPassed = await QuizAttempt.findOne({
        user,
        quiz,
        score: { $gte: 80 }
      });

      if (!alreadyPassed) {
        // Reuse the already fetched user document (userExists) to avoid a redundant DB query!
        const userDoc = userExists; 
        userDoc.reputation += 50;

        // Add 'quiz-master' badge if they don't have it
        if (!userDoc.badges.includes('quiz-master')) {
          userDoc.badges.push('quiz-master');
        }

        await userDoc.save();
        reputationUpdated = true;
      }
    }

    return NextResponse.json({ 
      message: "Quiz Attempt logged successfully!", 
      attempt, 
      reputationUpdated 
    }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
