const dotEnv = require('dotenv');
const express = require('express');
const mongoose = require('mongoose');

//TODO verificar env variables

// Import Routes
const authRoute = require('./routes/auth');
const storeRoute = require('./routes/store');

dotEnv.config();
const app = express();

// Connect to DB
mongoose.connect(process.env.MONGODB_URL,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
)
    .then(() => console.log("Connection established!"))
    .catch(error => console.error("Connection error", error));

// Middleware
app.use(express.json());

// Route Middlewares
app.use('/api/user', authRoute);
app.use('/api/store', storeRoute);

//default error catcher for routes
app.use((req, res) => {
    res.sendStatus(404);
})

app.listen(process.env.APPLICATION_PORT, () => console.log('Server up and running'));