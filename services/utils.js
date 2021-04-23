const passport = require('passport');


//TODO refreshToken JWT

const authenticateUser = passport.authenticate('jwt', {session: false});

const checkRole = roles => (req, res, next) =>
    !roles.includes(req.user.role)
        ? res.status(403).json("Forbidden - You don't have the rights to access this resource!")
        : next();


module.exports = {
    authenticateUser,
    checkRole
};