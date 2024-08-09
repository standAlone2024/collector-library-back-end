import express from 'express';
import { register, login, test } from '../controllers/authController';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/test', test);

export default router;