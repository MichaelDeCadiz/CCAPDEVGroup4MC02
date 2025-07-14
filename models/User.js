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
  },
  profileImage: {
    type: String,
    default: "https://randomuser.me/api/portraits/men/60.jpg"
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
