import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser'
import connectDB from './utils/db';

// import routes
import userRoutes from './route/user.route';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
    cors({
        origin: process.env.BASE_URL,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    })
);
app.use(cookieParser())

connectDB();

app.get('/', (_req, res) => {
    res.send('Welcome to BookBazar API');
});

app.use('/api/v1/user', userRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
