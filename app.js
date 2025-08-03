const express = require('express');
const session = require('express-session');
const exphbs = require('express-handlebars');
const path = require('path');
const mongoose = require('mongoose');
const User = require('./models/User');
const Reservation = require('./models/Reservation');
const Lab = require('./models/lab');
const bcrypt = require('bcrypt');
const multer  = require('multer');

const app = express();
const port = 3000;

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/labreservationDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.log("MongoDB error:", err));

app.use(express.urlencoded({ extended: true }));

const staticFilesPath = path.join(__dirname, 'public');
console.log('Serving static files from:', staticFilesPath);
app.use(express.static(staticFilesPath));

//Session
app.use(
  session({
    secret: "imnotsurewhatthisissupposedtodo",
    resave: false,
    saveUninitialized: true
  })
);

const hbs = exphbs.create({
  extname: '.hbs',      // Optional: specify the file extension
  helpers: {
    // Define your custom helpers here
    isEqual: function(value1, value2, options) {
      if (value1 === value2) {
        return options.fn(this);
      } else {
        return options.inverse(this);
      }
    }
  }
});

//Checks if session is active
const isAuth = (req, res, next) => {
  if(req.session.isAuth) {
    next();
  }
  else {
    res.redirect('/login');
  }
};

//Destination for uploaded images
const upload = multer({ dest: 'public/images/uploads/' });

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set("views", "./views");

//--GET--

//Index
app.get('/', (req, res) => {
  res.render('partials/index', { session: req.session.isAuth });
});

//Login Page
app.get('/login', async (req, res) => {
  try {
    let errorMessage = ' ';

    if (req.query.error === 'invalid_credentials') {
      errorMessage = 'Incorrect email or password.';
    }

    if(req.session.isAuth)
      res.redirect('/');
    else
      res.render('partials/login', { error: errorMessage });
  } catch (err) {
    res.status(500).send("Error");
  }
});

//Register Page
app.get('/register', async (req, res) => {
  try {
    let errorMessage = ' ';

    if (req.query.error === 'existing_email') {
      errorMessage = 'An account with this email already exists.';
    }

    if(req.session.isAuth)
      res.redirect('/');
    else
      res.render('partials/register', { error: errorMessage });
  } catch (err) {
    res.status(500).send("Error");
  }
});

//Profile Page
app.get('/profile', isAuth, async (req, res) => {
  try {
    const email = req.session.email;
    console.log('Profile route - session email:', email); // Debug check

    const user = await User.findOne({ email: email });
    console.log('Profile route - found user:', user); // Debug check

    if (!user) {
      return res.status(404).send("User not found");
    }

    const reservations = await Reservation.find({ reservedBy: email }).lean();
    console.log('Profile route - found reservations:', reservations); // Debug check

    const userData = {
      userInfo: user.toObject(),
      reservations, 
      session: req.session.isAuth,
      isOwnProfile: true
    };

    console.log('Profile route - sending to template:', userData); // Debug check

    res.render('partials/profile', userData); 
    } catch (err) {
      console.error('Profile route error:', err);
      res.status(500).send("Error loading Profile");
    }
});



// View Public User Profile
app.get('/profile/:email', isAuth, async (req, res) => {
  try {
    const email = req.params.email;
    const user = await User.findOne({ email });
    const reservations = await Reservation.find({ reservedBy: email, anonymous: 'false' });

    if (!user) return res.status(404).send("User not found");

    res.render('partials/profile', {
      userInfo: user.toObject(),
      reservations: reservations.map(r => r.toObject()),
      session: req.session.isAuth,
      isOwnProfile: false});
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading profile");
  }
});


//Dashboard Page
app.get('/dashboard', isAuth, async (req, res) => {
  try {
    const email = req.session.email;
    const reservations = await Reservation.find({ reservedBy: email }).lean();

    res.render('partials/dashboard', { session: req.session.isAuth, reservations });
  } catch (err) {
    res.status(500).send("Error");
  }
});

// Search users
app.get('/search', isAuth, async (req, res) => {
  console.log('Search route hit with query:', req.query); // Debug check
  
  const query = req.query.q;
  
  // Check if query exists
  if (!query || query.trim() === '') {
    console.log('Empty query, redirecting to dashboard');
    return res.redirect('/dashboard');
  }
  
  try {
    console.log('Searching for:', query); // Debug check
    
    const users = await User.find({
      $or: [
        { name: new RegExp(query, 'i') },
        { email: new RegExp(query, 'i') }
      ]
    }).lean();

    console.log('Found users:', users); // Debug check

    res.render('partials/searchResults', { 
      users, 
      session: req.session.isAuth,
      query: query // Pass the query back to template
    });
  } catch (err) {
    console.error('Search error:', err); // Debug check
    res.status(500).send("Error searching users");
  }
});


//Labs Page
app.get('/viewlabs', isAuth, async (req, res) => {
  try {
    const labs = await Lab.find({}).lean();
    console.log('Labs being sent to template:', labs);
    res.render('partials/lab', { labs: labs, session: req.session.isAuth });
  } catch (err) {
    console.error('Error loading labs:', err);
    res.status(500).send("Error loading labs");
  }
});

// Fetch Reservation Data
app.get('/api/reservations', isAuth, async (req, res) => {
  const { lab, day, timeSlot } = req.query;
  if (!lab || !day || !timeSlot) return res.status(400).send('Missing required parameters.');

  try {
    const reservations = await Reservation.find({
      lab,
      timeSlot,
      reservationdate: {
        $gte: new Date(day),
        $lt: new Date(new Date(day).setDate(new Date(day).getDate() + 1))
      }
    });

    const result = {};
    reservations.forEach(r => {
      result[r.seatNumber] = {
        reservedBy: r.reservedBy,
        anonymous: r.anonymous
      };
    });

    res.json(result);
  } catch (err) {
    console.error('Error fetching reservations:', err);
    res.status(500).send('Error fetching reservations');
  }
});

//--POST--

//Login Confirmation
app.post('/login', async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = await User.findOne({ email: email });

  if(user) {
    const matchPass = await user.comparePassword(password);

    if(matchPass){
    req.session.isAuth = true;
    req.session.email = email;
    //req.session.accounttype = user.toObject().accounttype;
    res.redirect('/');
    }
    else
      res.redirect('/login?error=invalid_credentials');
  }
  else
    res.redirect('/login?error=invalid_credentials');
});

//Register New User
app.post('/register', async (req, res) => {
  const formData = req.body;
  const email = req.body.email;
  const user = await User.findOne({ email: email });

  if(user){
    res.redirect('/register?error=existing_email');
  }
  else{
    const newUser = new User(formData);
  
    await newUser.save();

    res.redirect('/login');
  }
});

//Delete User
app.post('/deleteaccount/:email', async (req, res) => {
  const email = req.params.email;

  await User.deleteOne({ email: email });
  await Reservation.deleteMany({ reservedBy: email });

  req.session.destroy((err) => {
    if(err) throw err;
    res.redirect('/');
  });
});

//Update User Description
app.post('/updatedescription/:email', async (req, res) => {
  const email = req.params.email;
  const newdescription = req.body.newdescription;

  await User.findOneAndUpdate({ email: email }, { description: newdescription });

  res.redirect("/profile");
});

//Update User Profile Picture
app.post('/updatepicture/:email', upload.single('newpfp'), async (req, res) => {
  const email = req.params.email;
  const newPicture = "/images/uploads/" + req.file.filename;

  await User.findOneAndUpdate({ email: email }, { profileImage: newPicture });

  res.redirect("/profile");
});

// Create Reservation
app.post('/reserve', isAuth, async (req, res) => {
  const { lab, seats, day, timeSlot, anonymous } = req.body;
  const email = req.session.email;

  try {
    // Validate input
    if (!lab || !seats || !day || !timeSlot) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const seatArrayRaw = Array.isArray(seats) ? seats : [seats];
    const seatArray = seatArrayRaw.filter(seat => typeof seat === 'string' && seat.trim() !== '');

    // Check for existing reservations
    const existingReservations = await Reservation.find({
      lab,
      timeSlot,
      reservationdate: new Date(day),
      seatNumber: { $in: seatArray }
    });

    if (existingReservations.length > 0) {
      return res.status(409).json({ error: 'Some seats are already reserved' });
    }

    const newReservations = seatArray.map(seat => ({
      seatNumber: seat,
      lab,
      reservationdate: new Date(day),
      requestDateTime: new Date(),
      reservedBy: email,
      anonymous: String(anonymous) === 'true',
      timeSlot
    }));

    await Reservation.insertMany(newReservations);
    res.status(200).json({ message: 'Reservation successful' });
  } catch (err) {
    console.error('Reservation error:', err);
    res.status(500).json({ error: 'Error creating reservations' });
  }
});


// Delete Reservation
app.post('/reservations/delete/:id', isAuth, async (req, res) => {
  const reservationId = req.params.id;
  const email = req.session.email;

  try {
    const reservation = await Reservation.findById(reservationId);

    if (!reservation) return res.status(404).send('Reservation not found.');

    // Only allow deletion if the user owns it
    if (reservation.reservedBy !== email) return res.status(403).send('Unauthorized.');

    await Reservation.findByIdAndDelete(reservationId);
    res.redirect('/dashboard');
  } catch (err) {
    res.status(500).send('Error deleting reservation.');
  }
});

// Delete all Reservations of Logged-In User
app.post('/reservations/deleteAll', isAuth, async (req, res) => {
  const email = req.session.email;

  try {
    await Reservation.deleteMany({ reservedBy: email });
    res.redirect('/dashboard');
  } catch (err) {
    res.status(500).send('Error deleting all reservations.');
  }
});

//Logout
app.post('/logout', async (req, res) => {
  req.session.destroy((err) => {
    if(err) throw err;
    res.redirect('/');
  });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
