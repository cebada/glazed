const mongoose = require('mongoose');

// Schema for Order's collection
const orderSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    scheduleId: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    }
});


module.exports = mongoose.model('Order', orderSchema);