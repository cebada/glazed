const passport = require('passport');


//TODO refreshToken JWT

/**
 * Checks if User is authenticated
 */
const authenticateUser = passport.authenticate('jwt', {session: false});

/**
 * Checks for user's roles
 * @param roles User role
 * @returns {function(*, *, *): *} Returns forbidden if the user doesn't have the necessary role
 */
const checkRole = roles => (req, res, next) =>
    !roles.includes(req.user.role)
        ? res.status(403).json("Forbidden - You don't have the rights to access this resource!")
        : next();

/**
 * Increment the given time by half an hour
 * @param initialTime Time to be incremented
 * @returns {string} Incremented time
 */
const nextSlotTime = initialTime => {
    let hour = initialTime.split(':')[0];
    let minute = initialTime.split(':')[1];
    if (minute === '30') {
        hour++;
        if (hour < '10') hour = '0' + hour;
        minute = '00';
    } else {
        minute = '30';
    }
    return hour + ':' + minute;
};

/**
 * Converts date in a day of the week
 * @param day Given adte to convert
 * @returns {string|null} Returns the day of the week
 */
const dayOfTheWeek = day => {
    try {
        var weekDay = new Date(day);
        switch (weekDay.getDay()) {
            case 0:
                return 'Sunday';
            case 1:
                return 'Monday';
            case 2:
                return 'Tuesday';
            case 3:
                return 'Wednesday';
            case 4:
                return 'Thursday';
            case 5:
                return 'Friday';
            case 6:
                return 'Saturday';
            default:
                return '';
        }
    } catch (error) {
        return null;
    }
};

/**
 * Gets the current date in the YYYY-MM-DD format
 * @returns {string} Returns the current date
 */
const getCurrentDate = () => {
    const date = new Date();
    const day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    const m = date.getMonth() + 1;
    const month = m < 10 ? '0' + m : m;

    return date.getFullYear() + '-' + month + '-' + day;
};

module.exports = {
    authenticateUser,
    checkRole,
    nextSlotTime,
    dayOfTheWeek,
    getCurrentDate
};