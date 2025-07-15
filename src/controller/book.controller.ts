import { Request, Response } from "express";


const  addBook = (req: Request, res: Response)=>{
const {title, description, userId, price} = req.body
}

export {addBook}