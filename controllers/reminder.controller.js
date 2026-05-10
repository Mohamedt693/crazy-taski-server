import Reminder from "../models/reminder.model.js";
import Project from "../models/project.model.js";
import REMINDER_MESSAGES from "../utils/messages/reminders.messages.js";


const checkProjectAccess = async (projectId, userId) => {
    const project = await Project.findById(projectId);
    if (!project) return { error: REMINDER_MESSAGES.ERROR.PROJECT_NOT_FOUND, status: 404 };

    const isOwner = project.owner.toString() === userId.toString();
    const isMember = project.members.some(m => m.user.toString() === userId.toString());

    if (!isOwner && !isMember) {
        return { error: REMINDER_MESSAGES.ERROR.NOT_MEMBER, status: 403 };
    }
    return { project }; 
};

const createReminder = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { title, remindAt } = req.body;

        if (!title?.trim()) return res.error(REMINDER_MESSAGES.ERROR.TITLE_REQUIRED, 400);
        
        const reminderDate = new Date(remindAt);
        if (isNaN(reminderDate.getTime()) || reminderDate <= new Date()) {
            return res.error(REMINDER_MESSAGES.ERROR.PAST_DATE, 400);
        }

        const access = await checkProjectAccess(projectId, req.user._id);
        if (access.error) return res.error(access.error, access.status);

        const reminder = await Reminder.create({
            title: title.trim(),
            remindAt: reminderDate,
            project: projectId,
            creator: req.user._id
        });

        const newReminder = await Reminder.findById(reminder._id).populate('creator', 'displayName avatar _id');

        return res.success(REMINDER_MESSAGES.SUCCESS.CREATE, newReminder, 201);
    } catch (error) {
        return res.error(REMINDER_MESSAGES.ERROR.SERVER_ERROR, 500, error);
    }
};

const getProjectReminders = async (req, res) => {
    try {
        const { projectId } = req.params;

        const access = await checkProjectAccess(projectId, req.user._id);
        if (access.error) return res.error(access.error, access.status);

        const reminders = await Reminder.find({ 
            project: projectId, 
            status: 'pending' 
        }).sort('remindAt');
        return res.success(REMINDER_MESSAGES.SUCCESS.FETCH, reminders );
    } catch (error) {
        return res.error(REMINDER_MESSAGES.ERROR.SERVER_ERROR, 500, error);
    }
};

const getReminderById = async (req, res) => {
    try {
        const { reminderId } = req.params;
        
        const reminder = await Reminder.findById(reminderId)
            .populate('assignedTo creator', 'displayName avatar');

        if (!reminder) {
            return res.error(REMINDER_MESSAGES.ERROR.REMINDER_NOT_FOUND, 404);
        }

        const access = await checkProjectAccess(reminder.project, req.user._id);
        if (access.error) return res.error(access.error, access.status);

        return res.success(REMINDER_MESSAGES.SUCCESS.FETCH, reminder );
    } catch (error) {
        return res.error(REMINDER_MESSAGES.ERROR.SERVER_ERROR, 500, error);
    }
};

const updateReminder = async (req, res) => {
    try {
        const { reminderId } = req.params;
        
        const reminder = await Reminder.findById(reminderId);
        if (!reminder) return res.error(REMINDER_MESSAGES.ERROR.REMINDER_NOT_FOUND, 404);

        const access = await checkProjectAccess(reminder.project, req.user._id);
        if (access.error) return res.error(access.error, access.status);

        const updatedReminder = await Reminder.findByIdAndUpdate(
            reminderId,
            { $set: req.body }, 
            { returnDocument: 'after', runValidators: true }
        ).populate('assignedTo creator', 'displayName avatar');

        return res.success(REMINDER_MESSAGES.SUCCESS.UPDATE, updatedReminder );
    } catch (error) {
        return res.error(REMINDER_MESSAGES.ERROR.SERVER_ERROR, 500, error);
    }
};

const deleteReminder = async (req, res) => {
    try {
        const { reminderId } = req.params;
        const reminder = await Reminder.findById(reminderId);
        if (!reminder) return res.error(REMINDER_MESSAGES.ERROR.REMINDER_NOT_FOUND, 404);

        const access = await checkProjectAccess(reminder.project, req.user._id);
        if (access.error) return res.error(access.error, access.status);

        await reminder.deleteOne(); 
        return res.success(REMINDER_MESSAGES.SUCCESS.DELETE);
    } catch (error) {
        return res.error(REMINDER_MESSAGES.ERROR.SERVER_ERROR, 500, error);
    }
};

export { 
    createReminder, 
    getProjectReminders, 
    getReminderById, 
    updateReminder, 
    deleteReminder 
};