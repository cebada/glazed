const Joi = require('joi');
const scheduleValidator = require('./scheduleValidator');
// Validate data sent on create request
const createValidation = data => {
    const schema = Joi.object({
        name: Joi.string()
            .min(3)
            .max(255)
            .required()
    });
    return schema.validate(data);
};


module.exports.createValidation = createValidation;

