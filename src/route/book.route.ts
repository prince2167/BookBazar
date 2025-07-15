import express from "express"
import {addBook} from "../controller/book.controller"
import { isAdmin } from "../middleware/isAdmin";
import { jwtAuth } from "../middleware/apiKey.middleware";

const router = express.Router();

router.post("/add/book",isAdmin,jwtAuth, addBook);

export default router