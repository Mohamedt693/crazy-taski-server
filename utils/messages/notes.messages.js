const NOTE_MESSAGES = {
  SUCCESS: {
    CREATE: "Note added successfully! Your thoughts are saved. 📝",
    FETCH: "Notes loaded successfully. Stay organized!",
    DETAIL: "Note details retrieved successfully.",
    UPDATE: "Note updated successfully. Changes saved! ✨",
    DELETE: "Note deleted successfully. Clean and simple. 🗑️",
  },
  ERROR: {
    NOTE_NOT_FOUND: "Note not found. It may have been removed already.",
    PROJECT_NOT_FOUND: "The project for this note does not exist.",
    NOT_MEMBER: "You cannot set reminders in a project you are not a member of.",
    UNAUTHORIZED: "You don't have permission to modify this note.",
    TITLE_REQUIRED: "A note must have a title. Please provide one.",
    CONTENT_REQUIRED: "A note can't be empty. Please add some content.",
    TASK_REQUIRED: "This note must be linked to a task.",
    PROJECT_REQUIRED: "A note must belong to a valid project.",
    SERVER_ERROR: "Something went wrong while managing the note. Please try again.",
  },
};

export default NOTE_MESSAGES;