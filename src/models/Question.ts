import mongoose, { Schema, model, models } from 'mongoose';

interface IQuestion {
    title: string;
    content: string;
    tags: string[];
    author: mongoose.Types.ObjectId;
    upvotes: mongoose.Types.ObjectId[];
    downvotes: mongoose.Types.ObjectId[];
    views: number;
    createdAt: Date; 
}

const QuestionSchema = new Schema<IQuestion>({
    title: {
        type: String,
        required: true,
        index: true,
    },
    content: {
        type: String,
        required: true,
    },
    tags: [{
        type: String,
        index: true, 
    }],
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    upvotes: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }],
    downvotes: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }],
    views: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Question = models.Question || model<IQuestion>('Question', QuestionSchema);

export default Question;