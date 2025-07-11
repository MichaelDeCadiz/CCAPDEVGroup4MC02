const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const mongoose = require('mongoose');


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

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set("views", "./views");

app.get('/', (req, res) => {
  res.render('partials/index');
});

app.get('/', async (req, res) => {
  try {
    res.render('partials/', {  });
  } catch (err) {
    res.status(500).send("Error");
  }
});

app.post('/', async (req, res) => {
  res.render('partials/', {  });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
