require('dotenv').config();

module.exports = {
    APPLICATION_PORT: process.env.APPLICATION_PORT,
    MONGODB_URL: process.env.MONGODB_URL,
    SECRET_KEY: process.env.SECRET_KEY
}