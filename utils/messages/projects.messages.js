const PROJECT_MESSAGES = {
    SUCCESS: {
        CREATE: "Project created successfully! Time to organize those tasks. 🚀",
        FETCH: "Projects retrieved successfully. Your workspace is ready.",
        DETAIL: "Project details loaded. Let's get to work!",
        UPDATE: "Project updated successfully. All changes are saved. ✅",
        DELETE: "Project deleted successfully. Workspace cleaned up. 🗑️",
    },
    ERROR: {
        NOT_FOUND: "Project not found. It might have been deleted.",
        UNAUTHORIZED: "You don't have permission to access or modify this project.",
        NAME_REQUIRED: "Project name is required. Give your ideas a title!",
        NAME_TOO_LONG: "Project name is too long. Keep it under 50 characters.",
        SERVER_ERROR: "Something went wrong while managing the project. Please try again.",
        INVALID_ID: "The provided Project ID is invalid."
    },
    // لو حبيت تضيف رسائل خاصة بالـ Team Invitations مستقبلاً
    TEAM: {
        MEMBER_ADDED: "New team member added successfully!",
        INVITE_SENT: "Invitation sent! Waiting for them to join the squad.",
        ALREADY_MEMBER: "This user is already a member of the project."
    }
};

export default PROJECT_MESSAGES;