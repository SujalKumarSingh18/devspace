import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Question from '@/models/Question';
import User from '@/models/User';

// ======================================================================
// 1. GET: Fetch all questions (with populated author details)
// ======================================================================
export async function GET() {
  try {
    await dbConnect();

    // Query database: Find all questions, populate the 'author' field selecting only 'username'
    // Hint: const questions = await Question.find().populate('author', 'username');
    const questions = await Question.find().populate('author', 'username');
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
    await Question.create({
      title, content, tags, author
    });

    // Return success response with status 201
    return NextResponse.json({ message: "Question Created Successfully" }, {status: 201});

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
