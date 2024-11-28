const {
    optionalWrapper,
    notEmpty,
    hasLength,
    isUnique,
    isValidEmail,
    matchesField,
    isIntegerValue,
    isValidUrl,
    isString,

} = require("../helpers/validationHelpers");
const handleValidationErrors = require("../middlewares/handleValidationErrors");

const validateCreateGroup = [
    notEmpty("name", "Group name is required"),
    hasLength("name", 3, 30, "Group name must be between 3 and 30 characters"),
    optionalWrapper(isValidUrl("avatarUrl", "Invalid group avatar URL")),
    optionalWrapper(hasLength("description", 0, 200, "Description must be up to 200 characters")),
    handleValidationErrors,
];

const validateUpdateGroup = [
    optionalWrapper(isString("name", "Group name must be a string")),
    optionalWrapper(hasLength("name", 3, 50, "Group name must be between 3 and 50 characters")),
    optionalWrapper(isValidUrl("avatarUrl", "Invalid group avatar URL")),
    optionalWrapper(hasLength("description", 0, 200, "Description must be up to 200 characters")),
    handleValidationErrors,
];

const validateDeleteGroup = [
    isIntegerValue("id", "Group ID must be a valid integer"),
    handleValidationErrors,
];


const validateGetGroup = [
    isIntegerValue("id"),
    handleValidationErrors,
]

module.exports = {
    validateCreateGroup,
    validateUpdateGroup,
    validateDeleteGroup,
    validateGetGroup,

}