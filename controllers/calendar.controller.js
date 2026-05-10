import CalendarEvent from "../models/calender.model.js";
import Project from "../models/project.model.js";
import CALENDAR_MESSAGES from "../utils/messages/calendar.messages.js";


const checkProjectAccess = async (projectId, userId) => {
    const project = await Project.findById(projectId);
    if (!project) return { error: CALENDAR_MESSAGES.ERROR.PROJECT_NOT_FOUND, status: 404 };

    const isOwner = project.owner.toString() === userId.toString();
    const isMember = project.members.some(m => m.user.toString() === userId.toString());

    if (!isOwner && !isMember) {
        return { error: CALENDAR_MESSAGES.ERROR.NOT_MEMBER, status: 403 };
    }
    return { project }; 
};


const createEvent = async (req, res) => {
    try {
        const { projectId } = req.params;
        const {title, description, start, end} = req.body;

        if (!title?.trim()) {
            return res.error(CALENDAR_MESSAGES.ERROR.TITLE_REQUIRED, 400);
        }

        const access = await checkProjectAccess(projectId, req.user._id);
        if (access.error) return res.error(access.error, access.status);

        const startDate = new Date(start);
        const endDate = new Date(end);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return res.error(CALENDAR_MESSAGES.ERROR.DATE_REQUIRED, 400);
        }

        if (endDate <= startDate) {
            return res.error(CALENDAR_MESSAGES.ERROR.INVALID_RANGE, 400);
        }

        const event = await CalendarEvent.create({
            title: title.trim(),
            description,
            start: startDate,
            end: endDate,
            project: projectId,
            creator: req.user._id 
        });

        const newEvent = await CalendarEvent.findById(event._id).populate('creator', 'displayName avatar _id');

        return res.success(CALENDAR_MESSAGES.SUCCESS.CREATE, newEvent, 201);
    } catch (error) {
        return res.error(CALENDAR_MESSAGES.ERROR.SERVER_ERROR, 500, error);
    }
};

const getMyEvents = async (req, res) => {
    try {
        const { projectId } = req.params;

        const access = await checkProjectAccess(projectId, req.user._id);
        if (access.error) return res.error(access.error, access.status);

        const events = await CalendarEvent.find({ project: projectId }).sort('start');
        
        return res.success(CALENDAR_MESSAGES.SUCCESS.FETCH, events);
    } catch (error) {
        return res.error(CALENDAR_MESSAGES.ERROR.SERVER_ERROR, 500, error);
    }
};

const getEventById = async (req, res) => {
    try {
        const { eventId } = req.params;

        const event = await CalendarEvent.findById(eventId)
            .populate('assignedTo creator', 'displayName avatar');

        if(!event) return res.error(CALENDAR_MESSAGES.ERROR.EVENT_NOT_FOUND, 404);
        

        const access = await checkProjectAccess(event.project, req.user._id);
        if (access.error) return res.error(access.error, access.status);

        return res.success(CALENDAR_MESSAGES.SUCCESS.FETCH, event);
    } catch (error) {
        return res.error(CALENDAR_MESSAGES.ERROR.SERVER_ERROR, 500, error);
    }
};

const updateEvent = async (req, res) => {
    try {
        const { eventId } = req.params;

        const event = await CalendarEvent.findById(eventId)
            .populate('creator', 'displayName avatar');
            
        if(!event) return res.error(CALENDAR_MESSAGES.ERROR.EVENT_NOT_FOUND, 404);

        const access = await checkProjectAccess(event.project, req.user._id);
        if (access.error) return res.error(access.error, access.status);

        const updateEvent = await CalendarEvent.findByIdAndUpdate(
            eventId,
            {$set: req.body},
            { returnDocument: 'after', runValidators: true }
        ).populate('creator', 'displayName avatar');

        return res.success(CALENDAR_MESSAGES.SUCCESS.UPDATE, updateEvent);
    } catch (error) {
        return res.error(CALENDAR_MESSAGES.ERROR.SERVER_ERROR, 500, error);
    }
};


const deleteEvent = async (req, res) => {
    try {
        const { eventId } = req.params;

        const event = await CalendarEvent.findById(eventId)
            .populate('creator', 'displayName avatar');
            
        if(!event) return res.error(CALENDAR_MESSAGES.ERROR.EVENT_NOT_FOUND, 404);

        const access = await checkProjectAccess(event.project, req.user._id);
        if (access.error) return res.error(access.error, access.status);

        await event.deleteOne(); 
        return res.success(CALENDAR_MESSAGES.SUCCESS.DELETE);
    } catch (error) {
        return res.error(CALENDAR_MESSAGES.ERROR.SERVER_ERROR, 500, error);
    }
};


export {
    createEvent,
    getMyEvents,
    getEventById,
    updateEvent, 
    deleteEvent
}