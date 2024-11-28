const { body, param } = require("express-validator");
const recordExists = require("../helpers/prismaHelpers");

const optionalWrapper = (rule) => rule.optional();

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
        .custom(async (value) => {
            const exists = await recordExists(model, dbField, value);
            if (exists) {
                return Promise.reject(customMessage || `${fieldName} is already in use`);
            }
            return true;  // If the record doesn't exist, validation passes
        });
        
        

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
        .withMessage(customMessage || `${fieldName} must be a valid URL`);
                
const isString = (fieldName, customMessage) =>
    body(fieldName)
        .isString()
        .withMessage(customMessage || `${fieldName} must be a string`);
        
module.exports = {
    optionalWrapper,
    notEmpty,
    hasLength,
    isValidEmail,
    isUnique,
    matchesField,
    isIntegerValue,
    isValidUrl,
    isString,
}

