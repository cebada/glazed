const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema for Slot's collection
const slotSchema = new mongoose.Schema({
    scheduleId: {
        type: String,
        required: true
    },
    startTime: {
        type: String,
        required: true,
        validate: /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/
    },
    endTime: {
        type: String,
        required: true,
        validate: /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/
    },
    orders: [{
        type: Schema.Types.ObjectId,
        ref: 'Order'
    }]
});


module.exports = mongoose.model('Slot', slotSchema);

// primeiro slot nao e slot usa capacidade do slot anterior
