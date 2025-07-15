import mongoose, { Schema } from 'mongoose';
import { IBook } from '../types/book';

const bookSchema = new Schema<IBook>(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User', // Reference to User model
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Book = mongoose.model<IBook>('Book', bookSchema);

export default Book;
