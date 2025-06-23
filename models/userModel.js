const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    username: {
        type: String,
        default: 'Randome dude'
    },
    profile_pic: {
        type: String,
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;