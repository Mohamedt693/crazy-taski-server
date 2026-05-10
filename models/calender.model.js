import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Event title is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    start: {
        type: Date,
        required: [true, 'Start date and time are required']
    },
    end: {
        type: Date,
        required: [true, 'End date and time are required']
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    }
}, {
    timestamps: true
});

eventSchema.index({ creator: 1, start: 1 });

const CalendarEvent = mongoose.model('CalendarEvent', eventSchema);
export default CalendarEvent;