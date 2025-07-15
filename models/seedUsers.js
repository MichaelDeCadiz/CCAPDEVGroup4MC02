const mongoose = require('mongoose');
const User = require('./User');
const Reservation = require('./Reservation');
const Lab = require('./lab');

mongoose.connect('mongodb://127.0.0.1:27017/labreservationDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const users = [
  { 
    name: 'Alice Santiago', 
    email: 'alice@dlsu.edu.ph',
    profileImage: 'https://randomuser.me/api/portraits/women/1.jpg'
  },
  { 
    name: 'Bob Reyes', 
    email: 'bob@dlsu.edu.ph',
    profileImage: 'https://randomuser.me/api/portraits/men/2.jpg'
  },
  { 
    name: 'Charlie Gomez', 
    email: 'charlie@dlsu.edu.ph',
    profileImage: 'https://randomuser.me/api/portraits/men/3.jpg'
  },
  { 
    name: 'Dana Cruz', 
    email: 'dana@dlsu.edu.ph',
    profileImage: 'https://randomuser.me/api/portraits/women/4.jpg'
  },
  { 
    name: 'Ethan Bautista', 
    email: 'ethan@dlsu.edu.ph',
    profileImage: 'https://randomuser.me/api/portraits/men/5.jpg'
  },
  { 
    name: 'Faith Lim', 
    email: 'faith@dlsu.edu.ph',
    profileImage: 'https://randomuser.me/api/portraits/women/6.jpg'
  },
  { 
    name: 'George Sy', 
    email: 'george@dlsu.edu.ph',
    profileImage: 'https://randomuser.me/api/portraits/men/7.jpg'
  },
  { 
    name: 'Hannah Uy', 
    email: 'hannah@dlsu.edu.ph',
    profileImage: 'https://randomuser.me/api/portraits/women/8.jpg'
  },
  { 
    name: 'Ian Dela Rosa', 
    email: 'ian@dlsu.edu.ph',
    profileImage: 'https://randomuser.me/api/portraits/men/9.jpg'
  },
  { 
    name: 'Jane Co', 
    email: 'jane@dlsu.edu.ph',
    profileImage: 'https://randomuser.me/api/portraits/women/10.jpg'
  },
  { 
    name: 'Karl Tan', 
    email: 'karl@dlsu.edu.ph',
    profileImage: 'https://randomuser.me/api/portraits/men/11.jpg'
  },
  { 
    name: 'Lara Dy', 
    email: 'lara@dlsu.edu.ph',
    profileImage: 'https://randomuser.me/api/portraits/women/12.jpg'
  },
  { 
    name: 'Marco Chan', 
    email: 'marco@dlsu.edu.ph',
    profileImage: 'https://randomuser.me/api/portraits/men/13.jpg'
  },
  { 
    name: 'Nina Ramos', 
    email: 'nina@dlsu.edu.ph',
    profileImage: 'https://randomuser.me/api/portraits/women/14.jpg'
  },
  { 
    name: 'Owen Velasco', 
    email: 'owen@dlsu.edu.ph',
    profileImage: 'https://randomuser.me/api/portraits/men/15.jpg'
  }
];

// Helper function to generate a random date within the next 6 days
function getRandomFutureDate() {
  const today = new Date();
  const randomDays = Math.floor(Math.random() * 6); // 0-6 days ahead
  const futureDate = new Date(today);
  futureDate.setDate(today.getDate() + randomDays);
  return futureDate;
}

// Helper function to generate a random seat number based on lab dimensions
function getRandomSeatNumber(rows, columns) {
  const rowNumber = Math.floor(Math.random() * rows) + 1;
  const colNumber = Math.floor(Math.random() * columns) + 1;
  return `R${rowNumber}C${colNumber}`;
}

async function seedUsersAndReservations() {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Reservation.deleteMany({});
    console.log('Existing users and reservations cleared.');

    // Get all labs to use for reservations
    const labs = await Lab.find({});
    if (labs.length === 0) {
      console.log('No labs found. Please run seedLabs.js first.');
      return;
    }

    // Create users
    const createdUsers = [];
    for (let user of users) {
      const newUser = await User.create({
        ...user,
        password: 'test123',
        accounttype: 'student',
        description: `Hello! I'm ${user.name.split(' ')[0]} and I'm a student at DLSU. Looking forward to using the lab facilities!`
      });
      createdUsers.push(newUser);
    }
    console.log('15 sample users created.');

    // Create reservations
    const reservations = [];
    const occupiedSeats = new Map(); // Track occupied seats by lab and date

    // Generate 50-80 random reservations
    const numReservations = Math.floor(Math.random() * 31) + 50; // 50-80 reservations
    
    for (let i = 0; i < numReservations; i++) {
      const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
      const randomLab = labs[Math.floor(Math.random() * labs.length)];
      const reservationDate = getRandomFutureDate();
      
      // Create a unique seat identifier for this date and lab
      const dateKey = reservationDate.toISOString().split('T')[0]; // YYYY-MM-DD format
      const labDateKey = `${randomLab.name}-${dateKey}`;
      
      if (!occupiedSeats.has(labDateKey)) {
        occupiedSeats.set(labDateKey, new Set());
      }
      
      const occupiedForThisLabDate = occupiedSeats.get(labDateKey);
      
      // Try to find an available seat (max 20 attempts to avoid infinite loop)
      let seatNumber;
      let attempts = 0;
      
      do {
        seatNumber = getRandomSeatNumber(randomLab.rows, randomLab.columns);
        attempts++;
      } while (occupiedForThisLabDate.has(seatNumber) && attempts < 20);
      
      // If we couldn't find an available seat after 20 attempts, skip this reservation
      if (attempts >= 20) {
        console.log(`Skipping reservation for ${randomLab.name} on ${dateKey} - no available seats`);
        continue;
      }
      
      // Mark this seat as occupied
      occupiedForThisLabDate.add(seatNumber);
      
      // Randomly decide if the reservation should be anonymous (20% chance)
      const isAnonymous = Math.random() < 0.2;
      
      const reservation = {
        seatNumber: seatNumber,
        lab: randomLab.name,
        reservedBy: randomUser.email, // Always store the actual user's email
        anonymous: isAnonymous,
        reservationDateTime: reservationDate,
      };
      
      reservations.push(reservation);
    }

    // Insert all reservations
    await Reservation.insertMany(reservations);
    console.log(`${reservations.length} sample reservations created.`);

    // Display summary
    console.log('\n--- SEEDING SUMMARY ---');
    console.log(`Users created: ${createdUsers.length}`);
    console.log(`Reservations created: ${reservations.length}`);
    
    // Show reservation distribution by lab
    const labStats = {};
    reservations.forEach(res => {
      labStats[res.lab] = (labStats[res.lab] || 0) + 1;
    });
    
    console.log('\nReservations by lab:');
    Object.entries(labStats).forEach(([lab, count]) => {
      console.log(`  ${lab}: ${count} reservations`);
    });

    // Show anonymous reservations count
    const anonymousCount = reservations.filter(res => res.anonymous).length;
    console.log(`\nAnonymous reservations: ${anonymousCount}`);

    // Show user-specific reservation counts
    console.log('\nReservations by user:');
    const userStats = {};
    reservations.forEach(res => {
      const email = res.reservedBy;
      if (!userStats[email]) {
        userStats[email] = { total: 0, anonymous: 0 };
      }
      userStats[email].total++;
      if (res.anonymous) {
        userStats[email].anonymous++;
      }
    });

    createdUsers.forEach(user => {
      const stats = userStats[user.email] || { total: 0, anonymous: 0 };
      const publicCount = stats.total - stats.anonymous;
      console.log(`  ${user.name}: ${publicCount} public${stats.anonymous > 0 ? `, ${stats.anonymous} anonymous` : ''}`);
    });
    
    mongoose.connection.close();
  } catch (err) {
    console.error('Error seeding users and reservations:', err);
    mongoose.connection.close();
  }
}

seedUsersAndReservations();