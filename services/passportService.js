const User = require('../models/User');
const { SECRET_KEY } = require('../config');
const { Strategy, ExtractJwt } = require('passport-jwt');

const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: SECRET_KEY
};

module.exports = passport => {
    passport.use(
        new Strategy(options, async (payload, done) => {
            await User.findById(payload.id)
                .then(user => {
                    return user ? done(null, user) : done(null, false);
                })
                .catch (err => {
                    done(null, false);
                });
        })
    );
};