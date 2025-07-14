const mongoose = require('mongoose');
const Lab = require('./lab');

mongoose.connect('mongodb://localhost:27017/labreservationDB');

const labs = [
  { name: "CL1", rows: 4, columns: 5 },
  { name: "CL2", rows: 5, columns: 6 },
  { name: "CL3", rows: 3, columns: 4 },
  { name: "CL4", rows: 6, columns: 5 },
  { name: "CL5", rows: 4, columns: 3 }
];


Lab.insertMany(labs)
  .then(() => {
    console.log("5 sample labs inserted successfully!");
    mongoose.connection.close();
  })
  .catch(err => {
    console.error("Error inserting labs:", err);
    mongoose.connection.close();
  });

