import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Question from '@/models/Question';


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
