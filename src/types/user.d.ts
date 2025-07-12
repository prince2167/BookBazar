export interface IUser extends Document {
    firstName: string;
    lastName?: string;
    email: string;
    username: string;
    password: string;
    role?: 'user' | 'admin';
    isVerified: boolean;
    verificationToken?: string;
    passwordResetToken?: string;
    passwordResetExpires?: Date;
    apiKey?: string;
}
