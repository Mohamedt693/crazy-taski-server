const CALENDAR_MESSAGES = {
    SUCCESS: {
        CREATE: "Event added to your calendar successfully! 🗓️",
        FETCH: "Calendar events loaded successfully.",
        UPDATE: "Event updated successfully! ✨",
        DELETE: "Event removed from your calendar. 🗑️",
    },
    ERROR: {
        EVENT_NOT_FOUND: "Event not found.",
        PROJECT_NOT_FOUND: "The project for this event does not exist.",
        NOT_MEMBER: "You cannot set reminders in a project you are not a member of.",
        INVALID_RANGE: "End time must be after the start time.",
        TITLE_REQUIRED: "Event title is required.",
        DATE_REQUIRED: "Start and end dates are required.",
        NOT_AUTHORIZED: "You are not authorized to manage this event.",
        SERVER_ERROR: "Internal server error while processing calendar data.",
    },
};

export default CALENDAR_MESSAGES;