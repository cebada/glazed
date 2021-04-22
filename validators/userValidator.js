const Joi = require('joi');

// Validate data sent on register request
const registerValidation = data => {
    const schema = Joi.object({
        name : Joi.string()
            .min(3)
            .max(255)
            .required(),
        email: Joi.string()
            .email()
            .min(6)
            .max(255)
            .required(),
        password: Joi.string()
            .min(3)
            .max(255)
            .required()
    });
    return schema.validate(data);
};

// Validate data sent on login request
const loginValidation = data => {
    const schema = Joi.object({
        email: Joi.string()
            .email()
            .min(6)
            .max(255)
            .required(),
        password: Joi.string()
            .min(3)
            .max(255)
            .required()
    });
    return schema.validate(data);
};

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;