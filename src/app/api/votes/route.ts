import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Question from '@/models/Question';
import Answer from '@/models/Answer';
import User from '@/models/User';

// ======================================================================
// POST: Upvote or Downvote a Question or Answer
// ======================================================================
export async function POST(req: Request) {
  try {
    await dbConnect();

    // A. Parse request parameters
    const { targetType, targetId, userId, voteType } = await req.json();

    // B. Validation: Check if fields exist
    if (!targetType || !targetId || !userId || !voteType) {
      return NextResponse.json({ message: "Missing required fields!" }, { status: 400 });
    }

    if (targetType !== 'question' && targetType !== 'answer') {
      return NextResponse.json({ message: "Invalid target type!" }, { status: 400 });
    }

    if (voteType !== 'upvote' && voteType !== 'downvote') {
      return NextResponse.json({ message: "Invalid vote type!" }, { status: 400 });
    }

    // Verify User exists
    const userExists = await User.findById(userId);
    if (!userExists) {
      return NextResponse.json({ message: "User not found!" }, { status: 404 });
    }

    // C. Retrieve Target Document
    let doc: any;
    if (targetType === 'question') {
      doc = await Question.findById(targetId);
    } else {
      doc = await Answer.findById(targetId);
    }

    if (!doc) {
      return NextResponse.json({ message: "Target document not found!" }, { status: 404 });
    }

    // Convert arrays of ObjectIds to simple string arrays for easy manipulation
    const upvotesStr = doc.upvotes.map((id: any) => id.toString());
    const downvotesStr = doc.downvotes.map((id: any) => id.toString());

    // ======================================================================
    // D. Implement Upvote & Downvote Array Toggling
    // ======================================================================
    if (voteType === 'upvote') {
      if (upvotesStr.includes(userId)) {
        doc.upvotes.pull(userId);
      } else {
        doc.upvotes.push(userId);
        doc.downvotes.pull(userId); // Mutual exclusion
      }
    } else if (voteType === 'downvote') {
      if (downvotesStr.includes(userId)) {
        doc.downvotes.pull(userId);
      } else {
        doc.downvotes.push(userId);
        doc.upvotes.pull(userId); // Mutual exclusion
      }
    }

    // E. Save updated document to MongoDB
    await doc.save();

    return NextResponse.json({ 
      success: true, 
      message: "Vote registered successfully!", 
      upvotes: doc.upvotes, 
      downvotes: doc.downvotes 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
