const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  seatNumber: {
    type: String,
  },
  lab: {
    type: String,
  },
  reservedBy: {
    type: String,
  },
  anonymous: {
    type: Boolean,
    default: false
  },
  reservationDateTime: {
    type: Date,
  },
  requestDateTime: {
    type: Date,
    default: Date.now
  },
  timeSlot: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Reservation', reservationSchema);
