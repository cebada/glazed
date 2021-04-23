const Joi = require('joi');

// Validate Order data
const orderValidation = data => {
    const schema = Joi.object({
        userId: Joi.string()
            .required(),
        storeId: Joi.string()
            .required()/*,
        slotId: Joi.string()
            .required()*/
    });
    return schema.validate(data);
};

//TODO este validator nao deve ser necessario


module.exports.orderValidation = orderValidation;