const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    default: ""
  },
  email: {
    type: String,
    unique: true
  },
  password: {
    type: String,
  },
  accounttype: {
    type: String,
    enum: ['student', 'technician'],
  },
  description: {
    type: String,
    default: "add description"
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
