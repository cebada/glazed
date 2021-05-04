require('dotenv').config();

module.exports = {
    APPLICATION_PORT: process.env.APPLICATION_PORT,
    //MONGODB_URL: process.env.MONGODB_URL,
    MONGODB_URL: "mongodb+srv://testuser:test123@glazed-cluster.eahyu.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
    //SECRET_KEY: process.env.SECRET_KEY,
    SECRET_KEY: "reshdjfjgkhjbkvtjcr",
    //START_DELIVERY_TIME: process.env.START_DELIVERY_TIME,
    START_DELIVERY_TIME: "08:00",
    //END_DELIVERY_TIME: process.env.END_DELIVERY_TIME
    END_DELIVERY_TIME: "22:00"
}