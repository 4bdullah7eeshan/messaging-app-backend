const {
    isIntegerValue,
    notEmpty,
} = require("../helpers/validationHelpers");
const handleValidationErrors = require("../middlewares/handleValidationErrors");

// Validate Sending Friend Request
const validateSendFriendRequest = [
    isIntegerValue("senderId", "Sender ID must be a valid integer"),
    isIntegerValue("receiverId", "Receiver ID must be a valid integer"),
    handleValidationErrors,
];

// Validate Accepting Friend Request
const validateAcceptFriendRequest = [
    isIntegerValue("senderId", "Sender ID must be a valid integer"),
    isIntegerValue("receiverId", "Receiver ID must be a valid integer"),
    handleValidationErrors,
];

const validateRejectFriendRequest = [
    isIntegerValue("requestId"),
    handleValidationErrors,
];

// Validate Deleting Friend
const validateDeleteFriend = [
    isIntegerValue("friendId", "Friend ID must be a valid integer"),
    handleValidationErrors,
];

module.exports = {
    validateSendFriendRequest,
    validateAcceptFriendRequest,
    validateRejectFriendRequest,
    validateDeleteFriend,
};
