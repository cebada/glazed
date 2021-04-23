const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {
    registerValidation,
    loginValidation
} = require('../validators/userValidator');

// App constants
const { SECRET_KEY } = require('../config');


const registerUser = async (req, res) => {
    //TODO use Logs

    try {
        // Validate fields in the request body
        const {error} = registerValidation(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        if (await User.findOne({ email: req.body.email })){
            return res.status(400).json({
                message: `Email ${req.body.email} already exists!`
            });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        // Create a new user
        const user = new User({
            ...req.body,
            password: hashedPassword
        });

        // Save the new user in the DB
        await user.save();

        return res.status(201).json({
            userId: user._id
        });

    } catch (err) {
        return res.status(500).json({
            message: 'Something went bad!'
        });
    }
}

/**
 *
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
const loginUser = async (req, res) => {

    // Validate fields in the request body
    const {error} = loginValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    // Check if user exists
    const user = await User.findOne({email: req.body.email});
    if (!user) return res.status(401).send('Incorrect credentials!');

    // Check if password is correct
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(401).send('Incorrect credentials!');

    // Create JWT token (expires in 1h)
    const token = jwt.sign({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        },
        SECRET_KEY,
        {
            expiresIn: '1h'
        });

    // Login successful
    return res.status(200)
        .header('authorization', 'bearer ' + token)
        .json({token: token});
};



module.exports = {
    registerUser,
    loginUser
};