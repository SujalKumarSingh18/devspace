import mongoose , { Schema , model , models } from 'mongoose';

interface IAnswer {
    content: string;
    question: mongoose.Types.ObjectId;
    author: mongoose.Types.ObjectId;
    upvotes: mongoose.Types.ObjectId[];
    downvotes: mongoose.Types.ObjectId[];
    isAccepted: boolean;
    createdAt: Date;
}

const AnswerSchema = new Schema<IAnswer>({
    content: {
        type: String,
        required: true,
    },
    question: {
        type: Schema.Types.ObjectId,
        ref: 'Question',
        required: true,
        index: true,
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    upvotes: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        index: true,
    }],
    downvotes: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        index: true,
    }],
    isAccepted: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
})

const Answer = models.Answer || model<IAnswer>('Answer' , AnswerSchema);

export default Answer;