require('dotenv').config();

module.exports = {
    APPLICATION_PORT: process.env.APPLICATION_PORT,
    MONGODB_URL: process.env.MONGODB_URL,
    SECRET_KEY: process.env.SECRET_KEY,
    START_DELIVERY_TIME: process.env.START_DELIVERY_TIME,
    END_DELIVERY_TIME: process.env.END_DELIVERY_TIME
}