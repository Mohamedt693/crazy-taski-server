import Note from "../models/note.model.js";
import Project from "../models/project.model.js";
import NOTE_MESSAGES from "../utils/messages/notes.messages.js";


const checkProjectAccess = async (projectId, userId) => {
    const project = await Project.findById(projectId);
    if (!project) return { error: NOTE_MESSAGES.ERROR.PROJECT_NOT_FOUND, status: 404 };

    const isOwner = project.owner.toString() === userId.toString();
    const isMember = project.members.some(m => m.user.toString() === userId.toString());

    if (!isOwner && !isMember) {
        return { error: NOTE_MESSAGES.ERROR.NOT_MEMBER, status: 403 };
    }
    return { project }; 
};

const createNote = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { title, content, assignedTo, dueDate } = req.body;

        if (!title) return res.error(NOTE_MESSAGES.ERROR.TITLE_REQUIRED, 400);
        if (!content) return res.error(NOTE_MESSAGES.ERROR.CONTENT_REQUIRED, 400);

        const access = await checkProjectAccess(projectId, req.user._id);
        if (access.error) return res.error(access.error, access.status);

        const note = await Note.create({
            title,
            content,
            project: projectId,
            assignedTo: assignedTo || req.user._id,
            creator: req.user._id,
            dueDate
        });

        const newNote = await Note.findById(note._id)
            .populate('creator', 'displayName avatar _id')
            .populate('assignedTo', 'displayName avatar _id');

        return res.success(NOTE_MESSAGES.SUCCESS.CREATE, newNote, 201);
    } catch (error) {
        return res.error(NOTE_MESSAGES.ERROR.SERVER_ERROR, 500, error);
    }
};

const getProjectNotes = async (req, res) => {
    try {
        const { projectId } = req.params;

        const access = await checkProjectAccess(projectId, req.user._id);
        if (access.error) return res.error(access.error, access.status);

        const notes = await Note.find({ project: projectId })
            .populate('assignedTo creator', 'displayName avatar')
            .sort('-createdAt');

        return res.success(NOTE_MESSAGES.SUCCESS.FETCH,  notes );
    } catch (error) {
        return res.error(NOTE_MESSAGES.ERROR.SERVER_ERROR, 500, error);
    }
};

const getNoteById = async (req, res) => {
    try {
        const { noteId } = req.params;
        const note = await Note.findById(noteId)
            .populate('assignedTo creator', 'displayName avatar');

        if (!note) return res.error(NOTE_MESSAGES.ERROR.NOT_FOUND, 404);

        const access = await checkProjectAccess(note.project, req.user._id);
        if (access.error) return res.error(access.error, access.status);

        return res.success(NOTE_MESSAGES.SUCCESS.DETAIL, note );
    } catch (error) {
        return res.error(NOTE_MESSAGES.ERROR.SERVER_ERROR, 500, error);
    }
};

const updateNote = async (req, res) => {
    try {
        const { noteId } = req.params;
        let { assignedTo } = req.body;

        const note = await Note.findById(noteId);
        if (!note) return res.error(NOTE_MESSAGES.ERROR.NOT_FOUND, 404);

        const access = await checkProjectAccess(note.project, req.user._id);
        if (access.error) return res.error(access.error, access.status);

        if (!assignedTo) {
            assignedTo = req.user._id;
        } else {
            const isMember = access.project.members.some(m => m.user.toString() === assignedTo.toString());
            const isOwner = access.project.owner.toString() === assignedTo.toString();

            if (!isMember && !isOwner) {
                return res.error("Target user is not a member of this project", 403);
            }
        }

        const updatedNote = await Note.findByIdAndUpdate(
            noteId,
            { 
                $set: { 
                    ...req.body, 
                    assignedTo: assignedTo 
                } 
            },
            { returnDocument: 'after', runValidators: true }
        )
            .populate('assignedTo', 'displayName avatar')
            .populate('assignedTo', 'displayName avatar _id');

        return res.success(NOTE_MESSAGES.SUCCESS.UPDATE, updatedNote );
    } catch (error) {
        return res.error(NOTE_MESSAGES.ERROR.SERVER_ERROR, 500, error);
    }
};

const deleteNote = async (req, res) => {
    try {
        const { noteId } = req.params;
        const note = await Note.findById(noteId);
        if (!note) return res.error(NOTE_MESSAGES.ERROR.NOT_FOUND, 404);

        const access = await checkProjectAccess(note.project, req.user._id);
        if (access.error) return res.error(access.error, access.status);

        await note.deleteOne();
        return res.success(NOTE_MESSAGES.SUCCESS.DELETE);
    } catch (error) {
        return res.error(NOTE_MESSAGES.ERROR.SERVER_ERROR, 500, error);
    }
};

export {
    createNote,
    getProjectNotes,
    getNoteById,
    updateNote,
    deleteNote
}