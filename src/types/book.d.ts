// types/book.ts
import { Types } from "mongoose";

export interface IBook {
  title: string;
  description: string;
  userId: Types.ObjectId; // <- Correct type for Mongoose ObjectId ref
  price: number;
  createdAt?: Date;
  updatedAt?: Date;
}
