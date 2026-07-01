import mongoose, { Schema, model, models } from 'mongoose';

interface IQuizQuestion {
    questionText: string;
    options: string[];
    correctOptionIndex: number;
}

interface IQuiz {
    title: string;
    description?: string;
    questions: IQuizQuestion[];
    difficulty: 'easy' | 'medium' | 'hard';
    xpReward: number;
    createdAt: Date;
}

const QuizSchema = new Schema<IQuiz>({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    questions: [{
        questionText: {
            type: String,
            required: true,
        },
        options: [{
            type: String,
            required: true,
        }],
        correctOptionIndex: {
            type: Number,
            required: true,
        },
    }],
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium',
    },
    xpReward: {
        type: Number,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Quiz = models.Quiz || model<IQuiz>('Quiz', QuizSchema);

export default Quiz;