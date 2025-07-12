import express from 'express';
import { registerUser, verifyUser, generateApiKey, login, getProfile } from '../controller/user.controller';
import { jwtAuth } from '../middleware/apiKey.middleware';

const router = express.Router();

router.post('/register', registerUser);
router.post('/verify/:token', verifyUser);
router.post('/api-key/:username', generateApiKey);
router.post("/login", login)
router.get("/me", jwtAuth, getProfile)
export default router;