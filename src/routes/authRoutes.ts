import express from 'express';
import { register, login, test, silent_refresh, logout } from '../controllers/authController';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/silent-refresh', silent_refresh);
router.post('/test', test);

export default router;