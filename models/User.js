const mongoose = require('mongoose');
const { nanoid } = require('nanoid');
const validator = require('mongoose-validator')

const UserSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => nanoid(12)
  },
  name: {
    type: String,
    required: true,
    validate: [
      validator({
        validator: 'matches',
        arguments: /^[A-Za-z\s]+$/i,
      })
    ]
  },
  email: {
    type: String,
    required: true,
    trim: true,
    validator: 'isEmail'
  },
  password: {
    type: String,
    required: true,
    validate: [
      validator({
        validator: 'matches',
        arguments: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/i,
      })
    ]
  },
  date: {
    type: Date,
    default: Date.now,
    transform: true
  },
  role: {
    type: String,
    required: true,
    enum: ['Tester', 'Admin', 'Developer', 'Client']
  },
  group: {
    type: String,
    required: false,
    enum: ['Front-end', 'Back-end', '']
  },
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
