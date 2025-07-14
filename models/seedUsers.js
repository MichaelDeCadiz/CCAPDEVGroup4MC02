const mongoose = require('mongoose');
const User = require('./User'); // Adjust path if needed

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

async function seedUsers() {
  try {
    // Clear existing users first (optional)
    await User.deleteMany({});
    console.log('Existing users cleared.');

    for (let user of users) {
      await User.create({
        ...user,
        password: 'test123', // Simple placeholder
        accounttype: 'student',
        description: `Hello! I'm ${user.name.split(' ')[0]} and I'm a student at DLSU. Looking forward to using the lab facilities!`
      });
    }
    console.log('15 sample users with unique images inserted.');
    mongoose.connection.close();
  } catch (err) {
    console.error('Error inserting users:', err);
    mongoose.connection.close();
  }
}

seedUsers();