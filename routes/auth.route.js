import express from 'express';
import passport from 'passport';
import { 
    register, 
    login, 
    logout, 
    refresh, 
    getMe, 
    resetPassword, 
    forgotPassword 
} from '../controllers/auth.controller.js';
import { generateAccessToken, generateRefreshToken } from '../utils/functions/generateTokens.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/google', passport.authenticate('google', { 
    scope: ['profile', 'email'],
    prompt: 'select_account'
}));

router.get('/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login', session: false }), 
    (req, res) => {
        const user = req.user;

        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 
        });

        res.redirect(`${process.env.CLIENT_URL}/auth-success?token=${accessToken}`);
    }
);

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword);

export default router;