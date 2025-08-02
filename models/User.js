const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

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
    default: "student"
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

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
