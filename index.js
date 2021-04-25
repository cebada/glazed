const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const bp = require('body-parser');
const passport = require('passport');
const authRoute = require('./routes/auth');
const storeRoute = require('./routes/store');
const orderRoute = require('./routes/order');
const {success, error} = require('consola');

//TODO verificar env variables

// App constants
const {APPLICATION_PORT, MONGODB_URL} = require('./config');

const app = express();

// Middlewares
//app.use(express.json());
app.use(cors());
app.use(bp.json());
app.use(passport.initialize());

// To enable roles
require('./services/passportService')(passport);


// Routes Middleware
app.use('/api/user', authRoute);
app.use('/api/store', storeRoute);
app.use('/api/order', orderRoute);

//default error catcher for routes
app.use((req, res) => {
    res.sendStatus(404);
})

const startApp = async () => {
    try {
        // Connect to DB
        await mongoose.connect(process.env.MONGODB_URL, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useCreateIndex: true,
                useFindAndModify: false
            }
        );

        // Connection established
        success({
            message: `Connection established with the Database \n ${MONGODB_URL}`,
            badge: true
        });

        // Start the App
        app.listen(APPLICATION_PORT, () =>
            success({
                message: `Server started on PORT ${APPLICATION_PORT}`,
                badge: true
            })
        );

    } catch (err) {
        // Error while connecting to the Database
        error({
            message: `Unable to connect to Database \n${err}`,
            badge: true
        });
        // Restart the App
        startApp();
    }
};

startApp();
