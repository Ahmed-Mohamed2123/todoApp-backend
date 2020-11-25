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
        type: String,
        default: 'https://api22.s3.us-east-2.amazonaws.com/defaultImg/355514137'
    },
    video: {
        type: String
    }
});

module.exports = mongoose.model('Video', videoSchema);