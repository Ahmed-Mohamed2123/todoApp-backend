const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String, 
        required: [true, 'A task must have a title']
    },
    description: {
        type: String
    },
    image: {
        type: String
    }
});

module.exports = mongoose.model('Task', taskSchema);
