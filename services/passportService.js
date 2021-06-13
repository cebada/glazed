const User = require('../models/User');
const { SECRET_KEY } = require('../config/index');
const { Strategy, ExtractJwt } = require('passport-jwt');

const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: SECRET_KEY
};

module.exports = passport => {
    passport.use(
        new Strategy(options, async (payload, next) => {
            await User.findById(payload.id)
                .then(user => {
                    return user ? next(null, user) : next(null, false);
                })
                .catch (err => {
                    next(null, false);
                });
        })
    );
};