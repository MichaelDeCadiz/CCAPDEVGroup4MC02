const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  seatNumber: {
    type: String,
    required: true
  },
  lab: {
    type: String,
    required: true
  },
  reservedBy: {
    type: String,
    required: true
  },
  anonymous: {
    type: Boolean,
    default: false
  },
  reservationDateTime: {
    type: Date,
    required: true
  },
  requestDateTime: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Reservation', reservationSchema);
