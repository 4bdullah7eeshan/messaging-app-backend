const { validationResult } = require("express-validator");

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            status: "error",
            message: "Validation errors occurred",
            errors: errors.array().map((error) => ({
                field: error.param,
                message: error.msg,
            })),
        });
    }
    
    next();
};

module.exports = handleValidationErrors;
