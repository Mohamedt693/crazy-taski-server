const TASK_MESSAGES = {
    SUCCESS: {
        CREATE: "Task added successfully! Let's get it done. 📝",
        FETCH: "Tasks loaded. Time to be productive!",
        DETAIL: "Task details retrieved successfully.",
        UPDATE: "Task updated. Keeping things on track! ✅",
        STATUS_CHANGED: "Task status moved forward! 🚀",
        DELETE: "Task removed. One less thing to worry about. 🗑️",
        ASSIGNED: "Task assigned successfully to the team member."
    },
    ERROR: {
        TASK_NOT_FOUND: "Task not found. Maybe it was already finished?",
        PROJECT_NOT_FOUND: "The project for this task does not exist.",
        NOT_MEMBER: "You cannot set reminders in a project you are not a member of.",
        UNAUTHORIZED: "You don't have permission to modify this task.",
        TITLE_REQUIRED: "Every task needs a title! Please add one.",
        PROJECT_REQUIRED: "A task must belong to a project.",
        INVALID_STATUS: "The status you provided is not supported.",
        SERVER_ERROR: "Something went wrong while managing the task. Try again."
    }
};

export default TASK_MESSAGES;