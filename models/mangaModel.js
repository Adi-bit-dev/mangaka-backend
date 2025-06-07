const mongoose = require('mongoose');

const mangaSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    ratings: {
        type: Number,
        required: true
    },
    Coverimg: {
        type: String,
        required: true
    },
    tags: {
        type: [String],
        required: true
    },
}, {
    timestamps: true // Automatically adds createdAt and updatedAt
});

const Manga = mongoose.model('Manga', mangaSchema);

module.exports = Manga;