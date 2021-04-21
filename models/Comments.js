const mongoose = require('mongoose');
const { nanoid } = require('nanoid')

const CommentsSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: () => nanoid(12)
    },
    created_by: {
        type: String
    },
    comment_details: {
        type: String,
        required: true
    },
    comment_timestamp: {
        type: Date,
        default: Date.now
    },
    ticket_id: {
        type: String
    }
})

module.exports = mongoose.model('Comments', CommentsSchema);