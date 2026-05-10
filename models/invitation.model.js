import mongoose from "mongoose";

const invitationSchema = new mongoose.Schema({
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    inviter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    invitee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    inviteeEmail: {
        type: String,
        required: [true, 'Invitee email is required'],
        trim: true,
        lowercase: true
    },
    role: {
        type: String,
        enum: ['editor', 'viewer'],
        default: 'viewer'
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'declined'],
        default: 'pending'
    },
    token: String, 
    expiresAt: Date
}, { 
    timestamps: true
});

const Invitation = mongoose.model('Invitation', invitationSchema);
export default Invitation;