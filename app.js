const express = require('express');
const session = require('express-session');
const exphbs = require('express-handlebars');
const path = require('path');
const mongoose = require('mongoose');
const User = require('./models/User');
const Reservation = require('./models/Reservation');
const Lab = require('./models/lab');

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
    saveUninitialized: false
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
}

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
    if(req.session.isAuth)
      res.redirect('/');
    else
      res.render('partials/login', { session: req.session.isAuth });
  } catch (err) {
    res.status(500).send("Error");
  }
});

//Register Page
app.get('/register', async (req, res) => {
  try {
    if(req.session.isAuth)
      res.redirect('/');
    else
      res.render('partials/register', { session: req.session.isAuth });
  } catch (err) {
    res.status(500).send("Error");
  }
});

//Profile Page
app.get('/profile', isAuth, async (req, res) => {
  try {
    const email = req.session.email;

    const user = await User.findOne({ email: email });
    const userInfo = user.toObject();

    const reservations = await Reservation.find({ reservedBy: email });

    res.render('partials/profile', { user: user.toObject(), reservations, session: req.session.isAuth }); // changed userInfo to user.toObject so its a plain javascript object
  } catch (err) {
    res.status(500).send("Error loading Profile");
  }
});

//Dashboard Page
app.get('/dashboard', isAuth, async (req, res) => {
  try {
    const email = req.session.email;
    const reservations = await Reservation.find({ reservedBy: email });

    res.render('partials/dashboard', { session: req.session.isAuth,reservations });
  } catch (err) {
    res.status(500).send("Error");
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
  const { lab, day } = req.query;
  if (!lab || !day) return res.status(400).send('Missing lab or day.');

  const dayStart = new Date(day);
  const dayEnd = new Date(day);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const reservations = await Reservation.find({
    lab,
    reservationDateTime: { $gte: dayStart, $lt: dayEnd }
  });

  const result = {};
  reservations.forEach(r => {
    result[r.seatNumber] = {
      reservedBy: r.reservedBy,
      anonymous: r.anonymous
    };
  });

  res.json(result);
});

//--POST--

//Login Confirmation
app.post('/login', async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = await User.findOne({ email: email, password: password });

  if(user){
    req.session.isAuth = true;
    req.session.email = email;
    res.redirect('/');
  }
  else {
    res.redirect('/login');
  }
});

//Register New User
app.post('/register', async (req, res) => {
  const formData = req.body;
  const email = req.body.email;
  const user = await User.findOne({ email: email });

  if(user){
    res.redirect('/register');
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

// Create Reservation
app.post('/reserve', isAuth, async (req, res) => {
  const { lab, seats, day, anonymous } = req.body;
  const email = req.session.email;

  try {
    const seatArray = Array.isArray(seats) ? seats : [seats];

    const newReservations = seatArray.map(seat => ({
      seatNumber: seat,
      lab,
      reservationDateTime: new Date(day),  // Could use exact time if needed
      requestDateTime: new Date(),
      reservedBy: anonymous === 'true' ? 'Anonymous' : email
    }));

    await Reservation.insertMany(newReservations);

    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating reservations.");
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
