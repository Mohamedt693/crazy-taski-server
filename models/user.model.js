import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    displayName: { 
        type: String, 
        required: [true, 'Name is required'] 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        trim: true,
        lowercase: true,
    },
    password: { 
        type: String, 
        minlength: 6,
        select: false
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true 
    },
    avatar: { 
        type: String 
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
}, { timestamps: true });

export default mongoose.model('User', userSchema);