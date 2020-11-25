const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Please enter your email'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Please enter your email']
    },
    role: {
        type: String,
        default: 'user',
        enum: ['user', 'admin']
    },
    resetLink: {
        data: String,
        default: ''
    }
});

module.exports = mongoose.model('User', userSchema);