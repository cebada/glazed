const User = require('../models/User');
const { registerValidation,
    loginValidation } = require('../validators/userValidator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const registerUser = async (req, res) => {
    //TODO use Logs
    //TODO mudar nrs de httpstatus para enum

    // Validate fields in the request body
    const {error} = registerValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    // Hash the password
    const salt = await bcrypt.genSalt(10);  // generate string (with complexity = 10) to hash the password
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Create a new user
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword
    });

    try {
        // Save the new user in the DB
        const newUser = await user.save();
        res.send({user: newUser._id});
    } catch (error) {
        //TODO diferenciar se erro na bd de conexao ou se erro por ja existir user

        // User already exists
        res.status(400)
            .send(error);
    }
}

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
            isAdmin: user.isAdmin
        },
        process.env.SECRET_KEY,
        {
            expiresIn: '1h'
        });

    // Login successful
    return res.status(200)
        .header('authorization', 'bearer ' + token)
        .send({token: token});
};

module.exports = { registerUser, loginUser };