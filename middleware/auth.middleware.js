import jwt from 'jsonwebtoken';
import User from '../models/user.model.js'

export const responseHandler = (req, res, next) => {
    res.success = (message, data = {}, statusCode = 200) => {
        return res.status(statusCode).json({
            success: true,
            message,
            data
        });
    };

    res.error = (message, statusCode = 500, error = null) => {
        return res.status(statusCode).json({
            success: false,
            message,
            error: error ? error.message : null
        });
    };

    next();
};


export const protect = async (req, res, next) => {
    try {
        let token = req.headers.authorization?.split(" ")[1]; // Bearer <token>

        if (!token) {
            return res.status(401).json({ message: "You are not logged in" });
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const currentUser = await User.findById(decoded.id).select('-password');

        if (!currentUser) {
            return res.status(401).json({ message: "The user belonging to this token no longer exists." });
        }

        req.user = currentUser;
        next();
    } catch (error) {
        res.status(401).json({ message: "Token expired or invalid" });
    }
};