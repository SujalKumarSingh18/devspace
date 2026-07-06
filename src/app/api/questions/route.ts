import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Question from '@/models/Question';
import User from '@/models/User';

// ======================================================================
// 1. GET: Fetch all questions (with populated author details)
// ======================================================================
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();

    // ======================================================================
    // TODO: Sort questions by creation date in descending order (newest first!)
    // ======================================================================
    // Hint: Chain .sort({ createdAt: -1 }) onto the Question.find() query
    
    const questions = await Question.find().sort({createdAt: -1}).populate('author', 'username');
    return NextResponse.json({ success: true, questions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ======================================================================
// 2. POST: Create a new question
// ======================================================================
export async function POST(req: Request) {
  try {
    await dbConnect();

    // Parse the body: title, content, tags, author
    // Hint: author is the ObjectId of the User who writes the question
    const { title, content, tags, author } = await req.json();
    

    // Validation: Ensure title, content, and author are provided
    if (!title || !content || !tags || !author){
      return NextResponse.json({
        message: "Please provide all the required fields"
      }, {status: 400});
    }

    // Validation (Security): Check if the author's user ID actually exists in the database
    // Hint: const userExists = await User.findById(author);
    const userExists = await User.findById(author);
    if (!userExists){
      return NextResponse.json({
        message: "Invalid User ID"
      }, {status: 400});
    }

    
    
    // Create question: Save to database using the Question model
    const newQuestion = await Question.create({
      title, content, tags, author
    });
    
    // ======================================================================
    // TODO: Award reputation to the author for asking a question (+10 XP)
    // ======================================================================
    // 1. Increment userExists.reputation by 10
    // 2. Save the updated user document (await userExists.save())
    userExists.reputation += 10;
    await userExists.save();
    // Return success response with status 201
    return NextResponse.json({ success: true, message: "Question Created Successfully", question: newQuestion }, {status: 201});

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
