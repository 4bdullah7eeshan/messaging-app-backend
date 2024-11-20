const { body, param } = require("express-validator");
const { recordExists } = require("../helpers/prismaHelpers");

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


const isUnique = (fieldName, model, dbField, customMessage) => 
    body(fieldName)
        .custom((value) => recordExists(model, dbField, value))
        .withMessage(customMessage || `${fieldName} is already in use`);

const matchesField = (fieldName, otherFieldName, customMessage) =>
    body(fieldName)
        .custom((value, { req }) => value === req.body[otherFieldName])
        .withMessage(customMessage || `${fieldName} must match ${otherFieldName}`);

const isIntegerValue = (fieldName, customMessage) =>
    param(fieldName)
        .isInt()
        .withMessage(customMessage || `${fieldName} must be an integer`)
        .toInt();

const isValidUrl = (fieldName, customMessage) =>
    body(fieldName)
        .isURL()
        .withMessage(customMessage || `${fieldName} must ba a valid URL`);
                

module.exports = {
    notEmpty,
    hasLength,
    isValidEmail,
    isUnique,
    matchesField,
    isIntegerValue,
    isValidUrl,
}

