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

// Helper function to generate a random date within the next 30 days
function getRandomFutureDate() {
  const today = new Date();
  const randomDays = Math.floor(Math.random() * 30) + 1; // 1-30 days from today
  const futureDate = new Date(today);
  futureDate.setDate(today.getDate() + randomDays);
  return futureDate;
}

// Helper function to generate a random seat number based on lab dimensions
// Uses standard seat naming convention: A1, A2, B1, B2, etc.
function getRandomSeatNumber(rows, columns) {
  const rowLetter = String.fromCharCode(65 + Math.floor(Math.random() * rows)); // A, B, C, etc.
  const colNumber = Math.floor(Math.random() * columns) + 1; // 1, 2, 3, etc.
  return `${rowLetter}${colNumber}`;
}

// Helper function to generate a random past date for requestDateTime
function getRandomPastDate() {
  const today = new Date();
  const randomDays = Math.floor(Math.random() * 7) + 1; // 1-7 days ago
  const pastDate = new Date(today);
  pastDate.setDate(today.getDate() - randomDays);
  return pastDate;
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
    const occupiedSeats = new Set(); // Track occupied seats to avoid conflicts

    // Generate 50-80 random reservations
    const numReservations = Math.floor(Math.random() * 31) + 50; // 50-80 reservations
    
    for (let i = 0; i < numReservations; i++) {
      const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
      const randomLab = labs[Math.floor(Math.random() * labs.length)];
      const reservationDate = getRandomFutureDate();
      
      // Create a unique seat identifier for this date and lab
      let seatNumber;
      let seatKey;
      let attempts = 0;
      
      // Try to find an available seat (max 10 attempts to avoid infinite loop)
      do {
        seatNumber = getRandomSeatNumber(randomLab.rows, randomLab.columns);
        seatKey = `${randomLab.name}-${reservationDate.toDateString()}-${seatNumber}`;
        attempts++;
      } while (occupiedSeats.has(seatKey) && attempts < 10);
      
      // If we couldn't find an available seat after 10 attempts, skip this reservation
      if (attempts >= 10) {
        continue;
      }
      
      // Mark this seat as occupied
      occupiedSeats.add(seatKey);
      
      // Randomly decide if the reservation should be anonymous (20% chance)
      const isAnonymous = Math.random() < 0.2;
      
      const reservation = {
        seatNumber: seatNumber,
        lab: randomLab.name,
        reservedBy: isAnonymous ? 'Anonymous' : randomUser.email,
        anonymous: isAnonymous,
        reservationDateTime: reservationDate,
        requestDateTime: getRandomPastDate()
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

    // Show user-specific reservation types
    console.log('\nReservations by user:');
    createdUsers.forEach(user => {
    const email = user.email;
    const userReservations = reservations.filter(r => r.reservedBy === email);
    const publicCount = userReservations.length;
    const anonCount = reservations.filter(r => r.anonymous && r.reservedBy === 'Anonymous' && r.email === email).length;

    console.log(`  ${user.name}: ${publicCount} public${anonCount ? `, ${anonCount} anonymous` : ''}`);
    });

    mongoose.connection.close();
  } catch (err) {
    console.error('Error seeding users and reservations:', err);
    mongoose.connection.close();
  }
}

seedUsersAndReservations();