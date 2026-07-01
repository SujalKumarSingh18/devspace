import mongoose, { Schema, model, models } from 'mongoose';

interface IQuizAttempt {
    user: mongoose.Types.ObjectId;
    quiz: mongoose.Types.ObjectId;
    score: number;
    completedAt: Date;
}

const QuizAttemptSchema = new Schema<IQuizAttempt>({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    quiz: {
        type: Schema.Types.ObjectId,
        ref: 'Quiz',
        required: true,
    },
    score: {
        type: Number,
        required: true,
    },
    completedAt: {
        type: Date,
        default: Date.now,
    }
});

const QuizAttempt = models.QuizAttempt || model<IQuizAttempt>('QuizAttempt', QuizAttemptSchema);

export default QuizAttempt;