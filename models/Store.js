const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema for Store's collection
const storeSchema = new mongoose.Schema({
    name : {
        type: String,
        required: true,
        min: 3,
        max: 255,
        unique: true
    },
    ownerId: {
        type: String
    },
    schedules: [{
        type: Schema.Types.ObjectId,
        ref: 'Schedule',
        required: true
    }]
});


module.exports = mongoose.model('Store', storeSchema);