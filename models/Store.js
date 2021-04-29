const mongoose = require('mongoose');

// Schema for Store's collection
const storeSchema = new mongoose.Schema({
    name : {
        type: String,
        required: true,
        min: 3,
        max: 255,
        unique: true
    }
});


module.exports = mongoose.model('Store', storeSchema);