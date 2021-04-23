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
    slotId: {
        type: String,
        required: true
    }
});


module.exports = mongoose.model('Order', orderSchema);