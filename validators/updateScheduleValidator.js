const Joi = require('joi');

// Validate Schedule data
const updateScheduleValidation = data => {
    const schema = Joi.object().keys({
        openingHour: Joi.string()
            .pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
            .required(),
        closingHour: Joi.string()
            .pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
            .required()
    });
    return schema.validate(data);
};

module.exports.updateScheduleValidation = updateScheduleValidation;