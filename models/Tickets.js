const mongoose = require('mongoose');
const { nanoid } = require('nanoid')
const validator = require('mongoose-validator')

function generateID() {
    var length = 4,
        charset = "0123456789",
        retVal = "#10";
    for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}

const TicketsSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: () => nanoid(12)
    },
    ticket_no: {
        type: String,
        default: () => generateID()
    },
    user: {
        type: String,
        ref: 'User._id'
    },
    created_by: {
        type: String
    },
    ticket_name: {
        type: String,
        required: true,
        validate: [
            validator({
                validator: 'matches',
                arguments: /^[A-Za-z0-9\s]+$/i,
            })
        ]
    },
    ticket_type: {
        type: String,
        enum: ['Development', 'Testing', 'Production'],
        default: 'Development',
        required: true
    },
    ticket_timestamp: {
        type: Date,
        default: Date.now
    },
    ticket_details: {
        type: String,
        required: true
    },
    ticket_status: {
        type: String,
        default: 'Open',
        enum: ['Open', 'Resolved', 'Closed'],
        required: true
    },
    ticket_priority: {
        type: String,
        default: 'High',
        enum: ['Low', 'Medium', 'High'],
        required: true
    },
    assign_to: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Tickets', TicketsSchema);