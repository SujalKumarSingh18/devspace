import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Answer from '@/models/Answer';
import Question from '@/models/Question';
import User from '@/models/User';

// ======================================================================
// 1. GET: Fetch all answers for a specific question
// ======================================================================
export async function GET(req: Request) {
  try {
    await dbConnect();

    // A. Parse the questionId query parameter from the URL
    const { searchParams } = new URL(req.url);
    const questionId = searchParams.get('questionId');

    // Validation: If questionId query param is missing, return 400 Bad Request
    if (!questionId) {
      return NextResponse.json({ message: "questionId query parameter is required!" }, { status: 400 });
    }

    // B. Query database: Find all answers matching the questionId and populate 'author'
    // Hint: const answers = await Answer.find({ question: questionId }).populate('author', 'username');
    const answers = await Answer.find({question: questionId }).populate('author', 'username');
    

    // Return the answers in a JSON response
    return NextResponse.json({ answers, success: true });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ======================================================================
// 2. POST: Post an answer to a question
// ======================================================================
export async function POST(req: Request) {
  try {
    await dbConnect();

    // A. Parse the request body: content, question (ID), author (ID)
    const {content, question, author} = await req.json();
    

    // B. Validation: Ensure content, question, and author are provided
    if (!content || !question || !author){
      return NextResponse.json({message: "Missing Field(s)"}, {status: 400},);
    }
    

    // C. Validation (Security): Ensure both the target Question AND the User (author) exist
    // Hint: Use Promise.all() to run both findById queries concurrently for efficiency!
    // const [questionExists, userExists] = await Promise.all([
    //   Question.findById(question),
    //   User.findById(author)
    // ]);
    const [questionExists, userExists] = await Promise.all([
      Question.findById(question),
      User.findById(author),
    ]);
    if (!questionExists || !userExists){
      return NextResponse.json({
        message: "User or Question doesn't exist!"},
        {status: 400,
      });
    }
    

    // D. Create Answer: Save to database using the Answer model
    const newAnswer = await Answer.create({ content, question, author });

    // Return success response with status 201
    return NextResponse.json({ message: "Answer posted successfully!", answer: newAnswer }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
