const mongoose = require("mongoose");

const chapterSchema = new mongoose.Schema({
    manga: {
        type: String,
        required: true
    },

    image: { 
        // single long image
        type: String,
        required: true
    },
    
    title: {
        type: String,
        required: true
    },

    number: {
        type: Number,
        default: 1
    },
    
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const Chapter = mongoose.model("Chapter", chapterSchema);

module.exports = Chapter;