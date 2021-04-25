const mongoose = require('mongoose');

// Schema for Slot's collection
const slotSchema = new mongoose.Schema({
    endTime: {
        type: String,
        required: true,
        validate: /^([0-1][0-9]|2[0-3]):[03][0]$/
    },
    scheduleId: {
        type: String,
        required:true
    }
});


module.exports = mongoose.model('Slot', slotSchema);

// primeiro slot nao e slot usa capacidade do slot anterior
