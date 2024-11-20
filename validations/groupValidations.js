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
];

module.exports = {
    validateCreateGroup,

}