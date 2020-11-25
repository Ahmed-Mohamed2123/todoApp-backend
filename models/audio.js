const mongoose = require('mongoose');

const audioSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'A audio must have a title']
    },
    description: {
        type: String
    },
    image: {
        type: String
    },
    audio: {
        type: String
    }
});

module.exports = mongoose.model('Audio', audioSchema);