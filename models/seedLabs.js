const mongoose = require('mongoose');
const Lab = require('./lab');

mongoose.connect('mongodb://localhost:27017/labreservationDB');

const labs = [
  { name: "Computer Laboratory 1", rows: 4, columns: 5 },
  { name: "Computer Laboratory 2", rows: 5, columns: 6 },
  { name: "Computer Laboratory 3", rows: 3, columns: 4 },
  { name: "Computer Laboratory 4", rows: 6, columns: 5 },
  { name: "Computer Laboratory 5", rows: 4, columns: 3 },
  { name: "Programming Lab A", rows: 5, columns: 4 },
  { name: "Programming Lab B", rows: 4, columns: 6 },
  { name: "Data Science Lab", rows: 3, columns: 5 },
  { name: "Network Security Lab", rows: 4, columns: 4 },
  { name: "AI Research Lab", rows: 5, columns: 5 }
];

// Clear existing labs first
Lab.deleteMany({})
  .then(() => {
    console.log("Existing labs cleared.");
    return Lab.insertMany(labs);
  })
  .then(() => {
    console.log(`${labs.length} labs inserted successfully!`);
    console.log("\nLabs created:");
    labs.forEach(lab => {
      console.log(`  ${lab.name} (${lab.rows}x${lab.columns} = ${lab.rows * lab.columns} seats)`);
    });
    mongoose.connection.close();
  })
  .catch(err => {
    console.error("Error inserting labs:", err);
    mongoose.connection.close();
  });