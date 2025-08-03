const mongoose = require('mongoose');
const User = require('./User');
const Reservation = require('./Reservation');
const Lab = require('./lab');

mongoose.connect('mongodb://127.0.0.1:27017/labreservationDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function clearDatabase() {
  try {
    await User.deleteMany({});
    await Reservation.deleteMany({});
    await Lab.deleteMany({});
    console.log('✅ All collections cleared!');
  } catch (err) {
    console.error('❌ Error clearing database:', err);
  } finally {
    mongoose.connection.close();
  }
}

clearDatabase();
