import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
    title : {
        type: String,
        required: [true, 'Note title is required'],
        trim: true
    },
    content: {
        type: String,
        required: [true, 'Note content is required'],
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
    dueDate: {
        type: Date
    }
}, { 
    timestamps: true 
});

// Index to optimize queries for notes within a project and their creation time
noteSchema.index({ project: 1, createdAt: -1 });

const Note = mongoose.model('Note', noteSchema);
export default Note;