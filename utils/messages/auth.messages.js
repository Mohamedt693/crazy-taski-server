const AUTH_MESSAGES = {
    SUCCESS: {
        REGISTERED: "Account created successfully! Welcome to Crazy Taski.",
        LOGGED_IN: "Login successful. Get ready to crush your tasks!",
        GOOGLE_SUCCESS: "Google account linked successfully.",
        // الأجزاء الجديدة هنا
        PASSWORD_RESET_LINK_SENT: "Reset link sent! Please check your email inbox.",
        PASSWORD_UPDATED: "Password changed successfully. You can now login with your new password."
    },
    ERROR: {
        USER_EXISTS: "This email is already registered. Try logging in.",
        INVALID_CREDENTIALS: "Invalid email or password.",
        PASSWORD_TOO_SHORT: "Password must be at least 6 characters long.",
        SERVER_ERROR: "Internal server error. Please try again later.",
        UNAUTHORIZED: "Unauthorized access. Please login first.",
        TOKEN_EXPIRED: "Session expired. Please login again.",
        // الأجزاء الجديدة هنا
        USER_NOT_FOUND: "No account found with this email address.",
        RESET_TOKEN_INVALID: "Reset link is invalid or has expired.",
        EMAIL_SEND_FAILED: "Could not send email. Please try again later.",
        PASSWORDS_DONT_MATCH: "Passwords do not match. Please check again."
    },
    EMAIL_TEMPLATES: {
        FORGOT_PASSWORD_SUBJECT: "Reset Your Crazy Taski Password",
        FORGOT_PASSWORD_BODY: (url) => `Forgot your password? Click the link below to reset it:\n\n${url}\n\nThis link is valid for 10 minutes only.`
    }
};

export default AUTH_MESSAGES;