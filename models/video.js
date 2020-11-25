const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
    title: {
        type: String, 
        required: [true, 'A Video must have a title']
    },
    description: {
        type: String
    },
    image: {
        type: String
    },
    video: {
        type: String
    }
});

module.exports = mongoose.model('Video', videoSchema);