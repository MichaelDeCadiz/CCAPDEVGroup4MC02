const mongoose = require('mongoose');

const labSchema = new mongoose.Schema({
  name: String,
  rows: Number,
  columns: Number
});

module.exports = mongoose.model('Lab', labSchema);

