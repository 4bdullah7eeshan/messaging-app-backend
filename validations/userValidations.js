const {
    notEmpty,
    hasLength,
    isUnique,
    isValidEmail,
    matchesField,
    iIntegerValue,
} = require("./validationHelpers");
const handleValidationErrors = require("../middlewares/handleValidationErrors");
const { isIntegerValue } = require("../helpers/validationHelpers");

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

];

const validateGetUser = [
    isIntegerValue("id"),

]

module.exports = {
    validateCreateUser,
    validateLoginUser,
    validateGetUser,
}

