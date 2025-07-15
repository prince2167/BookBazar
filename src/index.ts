import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser'
import connectDB from './utils/db';

// import routes
import userRoutes from './route/user.route';
import bookRoutes from './route/book.route';

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
app.use('/api/v1/book', bookRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
