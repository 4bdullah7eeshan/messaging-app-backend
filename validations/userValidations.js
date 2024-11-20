const {
    notEmpty,
    hasLength,
    isUnique,
    isValidEmail,
} = require("./validationHelpers");
const handleValidationErrors = require("../middlewares/handleValidationErrors");

const validateCreateUser = [
    notEmpty("username"),
    notEmpty("email"),
    notEmpty("password"),
    hasLength("username", 3, 10),
    isValidEmail("email"),
    isUnique("email", "User", "email"),
    hasLength("password", 5, undefined, "Password must be at least 5 characters long"),
    handleValidationErrors,
];

module.exports = {
    validateCreateUser,
}

