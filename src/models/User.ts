import { Schema, model, models } from 'mongoose';

interface IUser {
    username: string;
    email: string;
    passwordHash: string;
    reputation: number;
    badges: string[];
    themePreference: 'light' | 'dark' | 'system';
    location?: string;
    createdAt: Date;
}

const UserSchema = new Schema<IUser>({
    username: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    passwordHash: {
        type: String,
        required: true,
    },
    reputation: {
        type: Number,
        default: 0,
    },
    badges: {
        type: [String],
        default: [],
    },
    themePreference: {
        type: String,
        enum: ['light', 'dark', 'system'],
        default: 'system',
    },
    location: {
        type: String,
        default: '',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const User = models.User || model<IUser>('User', UserSchema);

export default User;
