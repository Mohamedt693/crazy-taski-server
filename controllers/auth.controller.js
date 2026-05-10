import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import crypto from 'crypto';
import jwt from "jsonwebtoken"; 
import AUTH_MESSAGES from "../utils/messages/auth.messages.js";
import { generateAccessToken, generateRefreshToken } from "../utils/functions/generateTokens.js";
import sendEmail from "../utils/functions/sendEmail.js";

const register = async (req, res) => {
    try {
        const { displayName, email, password } = req.body;

        const isUserExists = await User.findOne({ email });

        if(isUserExists) {
            return res.error(AUTH_MESSAGES.ERROR.USER_EXISTS, 400)
        };

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            displayName,
            email,
            password: hashedPassword
        });

        const accessToken = generateAccessToken(newUser._id);
        const refreshToken = generateRefreshToken(newUser._id);

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', 
            sameSite: 'Strict', 
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        return res.success(AUTH_MESSAGES.SUCCESS.REGISTERED, {
            user: {
                id: newUser._id,
                displayName: newUser.displayName,
                email: newUser.email
            },
            accessToken
        }, 201)
    } catch (error) {
        return res.error(AUTH_MESSAGES.ERROR.SERVER_ERROR, 500, error);
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.error(AUTH_MESSAGES.ERROR.INVALID_CREDENTIALS, 401);
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.error(AUTH_MESSAGES.ERROR.INVALID_CREDENTIALS, 401);
        }

        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', 
            sameSite: 'Strict', 
            maxAge: 7 * 24 * 60 * 60 * 1000 
        });

        return res.success(AUTH_MESSAGES.SUCCESS.LOGGED_IN, {
            user: {
                id: user._id,
                displayName: user.displayName,
                email: user.email
            },
            accessToken
        });

    } catch (error) {
        return res.error(AUTH_MESSAGES.ERROR.SERVER_ERROR, 500, error);
    }
};

const forgotPassword = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.error(AUTH_MESSAGES.ERROR.USER_NOT_FOUND, 404);
        };

        const resetToken = crypto.randomBytes(32).toString('hex');

        user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

        await user.save({ validateBeforeSave: false });

        const resetURL = `http://localhost:5173/reset-password/${resetToken}`;
        const message = AUTH_MESSAGES.EMAIL_TEMPLATES.FORGOT_PASSWORD_BODY(resetURL);

        try {
            await sendEmail({
                email: user.email,
                subject: AUTH_MESSAGES.EMAIL_TEMPLATES.FORGOT_PASSWORD_SUBJECT,
                message,
            });

            return res.success(AUTH_MESSAGES.SUCCESS.PASSWORD_RESET_LINK_SENT);

        } catch (error) {
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save({ validateBeforeSave: false });
            
            return res.error(AUTH_MESSAGES.ERROR.EMAIL_SEND_FAILED, 500, error);
        }
    } catch (error) {
        return res.error(AUTH_MESSAGES.ERROR.SERVER_ERROR, 500, error);
    }
};

const resetPassword = async (req, res) => {
    try {
        const hashedToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() } 
        });

        if (!user) {
            return res.error(AUTH_MESSAGES.ERROR.RESET_TOKEN_INVALID, 400);
        }

        const { password } = req.body;
        if (!password) {
            return res.error(AUTH_MESSAGES.ERROR.PASSWORD_TOO_SHORT, 400); 
        }

        user.password = await bcrypt.hash(password, 10);
        user.passwordResetToken = undefined; 
        user.passwordResetExpires = undefined;

        await user.save();

        return res.success(AUTH_MESSAGES.SUCCESS.PASSWORD_UPDATED);

    } catch (error) {
        return res.error(AUTH_MESSAGES.ERROR.SERVER_ERROR, 500, error);
    }
};

const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password"); 

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.success(AUTH_MESSAGES.SUCCESS.LOGGED_IN, {user});

    } catch (error) {
        return res.error(AUTH_MESSAGES.ERROR.SERVER_ERROR, 500, error);
    }
};

const refresh = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.error(AUTH_MESSAGES.ERROR.UNAUTHORIZED, 401);
        }

        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
            if (err) {
                return res.error("Refresh token expired", 403); 
            }

            const accessToken = generateAccessToken(decoded.id);

            return res.success("Token refreshed successfully", { accessToken });
        });

    } catch (error) {
        return res.error(AUTH_MESSAGES.ERROR.SERVER_ERROR, 500, error);
    }
};

const logout = async (req, res) => {
    try {
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict'
        });

        return res.success("Logged out successfully! See you soon.");
    } catch (error) {
        return res.error(AUTH_MESSAGES.ERROR.SERVER_ERROR, 500, error);
    }
};


export { register, login, refresh, logout, getMe, forgotPassword, resetPassword };