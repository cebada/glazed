const mongoose = require('mongoose');

// Schema for User's collection
const userSchema = new mongoose.Schema({
    name : {
        type: String,
        required: true,
        min: 3,
        max: 255
    },
    email: {
        type: String,
        required: true,
        min: 6,
        max: 255,
        unique: true
    },
    password: {
        type: String,
        required: true,
        min: 3,
        max: 255
    },
    role: {
        type: String,
        default: 'customer',
        enum: ['customer', 'admin']
    }
});


module.exports = mongoose.model('User', userSchema);