const REMINDER_MESSAGES = {
    SUCCESS: {
        CREATE: "Reminder scheduled successfully! We'll notify you. 🔔",
        FETCH: "Reminders loaded. Don't miss your deadlines! 📅",
        DETAIL: "Reminder details retrieved successfully.",
        UPDATE: "Reminder updated. New time is set! ⏳",
        DELETE: "Reminder removed. Keep it focused. 🗑️",
        COMPLETED: "Reminder marked as done. Great job! ✅",
    },
    ERROR: {
        REMINDER_NOT_FOUND: "Reminder not found. It might have already triggered.",
        PROJECT_NOT_FOUND: "The project for this reminder does not exist.",
        UNAUTHORIZED: "You don't have permission to modify this reminder.",
        TITLE_REQUIRED: "Please provide a title for your reminder.",
        INVALID_DATE: "Please set a valid date and time in the future.",
        PAST_DATE: "You can't set a reminder for a time that has already passed.",
        PROJECT_REQUIRED: "This reminder must be linked to a project.",
        NOT_MEMBER: "You cannot set reminders in a project you are not a member of.",
        SERVER_ERROR: "Something went wrong with the reminder. Please try again.",
    },
};

export default REMINDER_MESSAGES;