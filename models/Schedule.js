const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema for Schedule's collection
const scheduleSchema = new mongoose.Schema({
    weekDay: {
        type: String,
        required: true
    },
    capacity: {
        type: Number,
        required: true,
        min: 0
    },
    openingHour: {
        type: String,
        required: true,
        validate: /^([0-1][0-9]|2[0-3]):[03][0]$/
    },
    closingHour: {
        type: String,
        required: true,
        validate: /^([0-1][0-9]|2[0-3]):[03][0]$/
    },
    storeId: {
        type: String,
        required: true
    }
});



module.exports = mongoose.model('Schedule', scheduleSchema);