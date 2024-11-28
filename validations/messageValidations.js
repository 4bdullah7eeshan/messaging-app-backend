const {
    notEmpty,
    isString,
    isIntegerValue,
    hasLength,
    optionalWrapper,
} = require("../helpers/validationHelpers");
const handleValidationErrors = require("../middlewares/handleValidationErrors");

// Validate Message Creation
const validateCreateMessage = [
    notEmpty("content", "Message content is required"),
    hasLength("content", 1, 500, "Message content must be between 1 and 500 characters"),
    isIntegerValue("senderId", "Sender ID must be a valid integer"),
    isIntegerValue("receiverId", "Receiver ID must be a valid integer"),
    handleValidationErrors,
];

// Validate Message Retrieval
const validateGetMessage = [
    isIntegerValue("id", "Message ID must be a valid integer"),
    handleValidationErrors,
];

// Validate Message Deletion
const validateDeleteMessage = [
    isIntegerValue("id", "Message ID must be a valid integer"),
    handleValidationErrors,
];

module.exports = {
    validateCreateMessage,
    validateGetMessage,
    validateDeleteMessage,
};
