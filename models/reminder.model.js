import mongoose from "mongoose";

const reminderSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Reminder title is required'],
        trim: true
    },
    remindAt: {
        type: Date,
        required: [true, 'Remind at date is required']
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null    
    },
    status: {
        type: String,
        enum: ['pending', 'sent', 'cancelled'],
        default: 'pending'
    }
},{ timestamps: true });

// Index to optimize queries for upcoming reminders
reminderSchema.index({ remindAt: 1, status: 1 });
// Index to optimize queries for reminders within a project
reminderSchema.index({ project: 1 });

const Reminder = mongoose.model('Reminder', reminderSchema);
export default Reminder;