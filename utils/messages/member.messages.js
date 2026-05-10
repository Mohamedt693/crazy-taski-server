const MEMBER_MESSAGES = {
    SUCCESS: {
        FETCHED: "Team members loaded successfully. 👥",
        DETAIL: "Member details retrieved successfully.",
        ROLE_UPDATED: "Member role has been updated successfully! 🛠️",
        REMOVED: "Member has been removed from the project. 🗑️",
        LEFT: "You have left the project successfully. 👋",
    },
    ERROR: {
        NOT_FOUND: "Member not found in this project.",
        PROJECT_NOT_FOUND: "The specified project does not exist.",
        NOT_AUTHORIZED: "You don't have permission to manage members in this project.",
        NOT_MEMBER: "You are not a member of this project.",
        ALREADY_MEMBER: "This user is already a member of the project.",
        OWNER_CANNOT_LEAVE: "As the owner, you cannot leave the project. You must delete it or transfer ownership first.",
        OWNER_CANNOT_REMOVE_SELF: "You cannot remove yourself from your own project.",
        ROLE_REQUIRED: "Please specify the new role for the member.",
        INVALID_ROLE: "The specified role is invalid. Use (admin, member, or viewer).",
        SERVER_ERROR: "Internal server error while managing project members.",
    },
};

export default MEMBER_MESSAGES;