const { body } = require("express-validator");

const notEmpty = (fieldName, customMessage) =>
    body(fieldName)
        .trim()
        .notEmpty()
        .withMessage(customMessage || `${fieldName} cannot be empty`);


const hasLength = (fieldName, min, max, customMessage) =>
    body(fieldName)
        .isLength({ min, max })
        .withMessage(customMessage || `${fieldName} must be between ${min} and ${max} characters`);


const isValidEmail = (fieldName, customMessage) =>
    body(fieldName)
        .isEmail()
        .withMessage(customMessage || `${fieldName} is not a valid email.`);

