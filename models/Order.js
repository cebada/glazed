const mongoose = require('mongoose');

// Schema for Order's collection
const orderSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    storeId: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true,
        validate: /^([0-1][0-9]|2[0-3]):[03][0]$/
    }
});


module.exports = mongoose.model('Order', orderSchema);