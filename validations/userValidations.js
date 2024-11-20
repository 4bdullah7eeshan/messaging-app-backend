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

const validateCreateUser = [
    notEmpty("username"),
    notEmpty("email"),
    notEmpty("password"),
    hasLength("username", 3, 10),
    isValidEmail("email"),
    isUnique("email", "User", "email"),
    hasLength("password", 5, undefined, "Password must be at least 5 characters long"),
    matchesField("confirmPassword", "password", "Passwords do not match"),
    handleValidationErrors,
];

const validateLoginUser = [
    notEmpty("email"),
    notEmpty("password"),
    isValidEmail("email"),
    handleValidationErrors,

];

const validateGetUser = [
    isIntegerValue("id"),
    handleValidationErrors,

]

const validateUpdateUser = [
    optionalWrapper(isValidUrl("avatarUrl", "Invalid Avatar URL")),
    optionalWrapper(isString("bio", "Bio must be a string")),
    optionalWrapper(isString("displayName", "Display name must be a string")),
    optionalWrapper(hasLength("bio", 0, 200, "Bio must be of maximum 200 characters")),
    optionalWrapper(hasLength("displayName", 0, 50, "Display Name must of maximum 50 characters")),
    handleValidationErrors,

]

const validateDeleteUser = [
    isIntegerValue("id"),
    handleValidationErrors,
]

module.exports = {
    validateCreateUser,
    validateLoginUser,
    validateGetUser,
    validateDeleteUser,
    validateUpdateUser,
}

