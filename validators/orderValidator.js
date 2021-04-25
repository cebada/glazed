const Joi = require('joi');

// Validate Order data
const orderValidation = data => {
    const schema = Joi.object({
        slotId: Joi.string()
            .required(),
        date: Joi.date()
            .required()
    });
    return schema.validate(data);
};


module.exports.orderValidation = orderValidation;