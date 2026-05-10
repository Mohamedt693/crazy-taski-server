import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, 'Project name is required'], 
        trim: true,
        maxlength: [50, 'Project name cannot exceed 50 characters']
    },
    
    description: { 
        type: String,
        maxlength: [500, 'Description cannot exceed 500 characters'],
        default: ''
    },

    owner: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },

    members: [
        {
            user: { 
                type: mongoose.Schema.Types.ObjectId, 
                ref: 'User' 
            },
            role: { 
                type: String, 
                enum: ['owner', 'editor', 'viewer'], 
                default: 'viewer' 
            },
            joinedAt: { 
                type: Date, 
                default: Date.now 
            }
        }
    ],

    settings: {
        canMembersInvite: { 
            type: Boolean, 
            default: false 
        },
    }

}, { 
    timestamps: true 
});

projectSchema.index({ owner: 1 });
projectSchema.index({ 'members.user': 1 });

// if project is deleted, also delete all associated tasks, notes, and reminders .. etc
projectSchema.pre('deleteOne', { document: true, query: false }, async function () {
    const projectId = this._id;

    await mongoose.model('Task').deleteMany({ project: projectId });
    await mongoose.model('Note').deleteMany({ project: projectId });
    // await mongoose.model('Reminder').deleteMany({ project: projectId });
});

const Project = mongoose.model('Project', projectSchema);
export default Project;