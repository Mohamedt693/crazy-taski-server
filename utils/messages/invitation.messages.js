const INVITATION_MESSAGES = {
    SUCCESS: {
        SENT: "Invitation sent successfully! 📧",
        ACCEPTED: "Welcome to the project! Invitation accepted. ✅",
        REJECTED: "Invitation declined. ❌",
        FETCHED: "Invitations loaded successfully."
    },
    ERROR: {
        NOT_FOUND: "Invitation not found.",
        PROJECT_NOT_FOUND: "The project for this note does not exist.",
        ALREADY_MEMBER: "User is already a member of this project.",
        ALREADY_SENT: "An invitation is already pending for this user.",
        USER_NOT_FOUND: "This user is not registered in our system. Please check the email address.",
        SELF_INVITE: "You cannot invite yourself.",
        NOT_AUTHORIZED: "Only project owners can send invitations."
    }
};

export default INVITATION_MESSAGES;