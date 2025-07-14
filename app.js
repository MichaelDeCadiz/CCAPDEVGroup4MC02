const express = require('express');
const session = require('express-session');
const exphbs = require('express-handlebars');
const path = require('path');
const mongoose = require('mongoose');
const User = require('./models/User');

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

    res.render('partials/profile', { userInfo, session: req.session.isAuth });
  } catch (err) {
    res.status(500).send("Error");
  }
});

//Dashboard Page
app.get('/dashboard', isAuth, async (req, res) => {
  try {
    res.render('partials/dashboard', { session: req.session.isAuth });
  } catch (err) {
    res.status(500).send("Error");
  }
});

//Labs Page
app.get('/viewlabs', isAuth, async (req, res) => {
  try {
    res.render('partials/lab', { session: req.session.isAuth });
  } catch (err) {
    res.status(500).send("Error");
  }
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
