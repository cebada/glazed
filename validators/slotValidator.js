const Joi = require('joi');
const { orderValidation } = require('./orderValidator');

// Validate Slot data
const slotValidation = data => {
    const schema = Joi.object({
        startTime: Joi.string()
            .pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
            .required(),
        endTime: Joi.string()
            .pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
            .required(),
        orders: orderValidation
            .allow(null) // TODO talvez remover este campo
    });
    return schema.validate(data);
};

//TODO este validator nao deve ser necessario
// secalhar faz so sentido usar o endTime

module.exports.slotValidation = slotValidation;