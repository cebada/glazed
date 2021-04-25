const Joi = require('joi');

// Validate Order data
const orderValidation = data => {
    const schema = Joi.object({
        date: Joi.date()
            .required(),
        time: Joi.string()
            .pattern(/^([0-1][0-9]|2[0-3]):[03][0]$/)
            .required(),
        storeId: Joi.string()
            .required()
    });
    return schema.validate(data);
};


module.exports.orderValidation = orderValidation;