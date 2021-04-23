const Joi = require('joi');
const {scheduleValidation} = require('./scheduleValidator')

// Validate data sent on create request
const createValidation = data => {
    const schema = Joi.object({
        name: Joi.string()
            .min(3)
            .max(255)
            .required(),
        schedules: Joi.array()
            .items(scheduleValidation)
            .length(7)
    });
    return schema.validate(data);
};


module.exports.createValidation = createValidation;

/*
const createValidation = data => {
    const schema = Joi.object({
        name : Joi.string()
            .min(3)
            .max(255)
            .required(),
        capacity: Joi.number()
            .min(0)
            .required(),
        openingHour: Joi.string()
            .pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
            .required(),
        closingHour: Joi.string()
            .pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
            .required()
    });
    return schema.validate(data);
};
 */