import express from 'express';
import { login, checkAdminSession, logout } from '../controllers/adminAuthController.js';

const router = express.Router();

// All routes are public
router.post('/login', login);
router.get('/check-session', checkAdminSession);
router.get('/logout', logout);

export default router; 