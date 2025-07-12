import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import { IUser } from '../types/user';


const userSchema = new Schema<IUser>(
    {
        firstName: {
            type: String,
            required: true,
        },
        lastName: String,
        email: {
            type: String,
            required: true,
            unique: true,
        },
        username: {
            type: String,
            required: true,
            unique: true,
            match: /^[a-zA-Z0-9_]{3,30}$/,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user',
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        verificationToken: String,
        passwordResetToken: String,
        passwordResetExpires: Date,
        apiKey: { type: String, unique: true, sparse: true },
    },
    {
        timestamps: true,
    }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const hashed = await bcrypt.hash(this.password, 10);
    this.password = hashed;
    next();
});

const User = mongoose.model<IUser>('User', userSchema);

export default User;
