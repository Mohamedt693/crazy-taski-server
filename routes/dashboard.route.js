import express from 'express';
import { getHomeData } from '../controllers/dashboard.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/home', protect, getHomeData);

export default router;