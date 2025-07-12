import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async (): Promise<void> => {
    try {
        const MONGO_URI = process.env.MONGO_URI as string;
        if (!MONGO_URI) {
            throw new Error('⚠️ MONGO_URI is not defined in environment variables');
        }

        await mongoose.connect(MONGO_URI);
        console.log('✅ MongoDB connected');
    } catch (error) {
        console.error('❌ Failed to connect to MongoDB:', (error as Error).message);
        process.exit(1);
    }
};

export default connectDB;
