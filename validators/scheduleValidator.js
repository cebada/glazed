const Joi = require('joi');
const {slotValidation} = require('./slotValidator');

// Validate Schedule data
const scheduleValidation = data => {
    const schema = Joi.object().keys({
        weekDay: Joi.string()
            /*.valid(
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
                'Saturday',
                'Sunday'
            )*/
            .required(),
        capacity: Joi.number()
            .min(0)
            .required(),
        openingHour: Joi.string()
            .pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
            .required(),
        closingHour: Joi.string()
            .pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
            .required(),
        /*storeId: Joi.string()
            .required(),*/
        /*slots: slotValidation
            .allow(null)*/
    });
    return schema.validate(data);
};


module.exports.scheduleValidation = scheduleValidation;