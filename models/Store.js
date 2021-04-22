const mongoose = require('mongoose');

// Schema for Store's collection
const storeSchema = new mongoose.Schema({
    name : {
        type: String,
        required: true,
        min: 3,
        max: 255,
        unique: true
    },
    capacity: {
        type: Number,
        required: true,
        min: 0
    },
    openingHour: {
        type: String,
        required: true,
        validate: /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/
    },
    closingHour: {
        type: String,
        required: true,
        validate: /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/
    },
    ownerId: {
        type: String
    }
});


module.exports = mongoose.model('Store', storeSchema);