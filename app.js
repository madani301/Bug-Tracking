const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const passport = require('passport');
const cookieParser = require('cookie-parser')
const morgan = require('morgan')
const flash = require('connect-flash');
var path = require('path');
const methodOverride = require('method-override')
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const mongoSanitize = require('express-mongo-sanitize');
const bodyParser = require('body-parser');
const xss = require('xss-clean');
const app = express();

app.disable('x-powered-by')


app.use(express.json({ limit: '10kb' })); // Body limit is 10

// Passport Config
require('./config/passport')(passport);

// DB Config
const db = require('./config/keys').mongoURI;
const { mongoURI } = require('./config/keys');

// Connect to MongoDB
mongoose
  .connect(
    db,
    { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }
  )
  .then(() => console.log('MongoDB Connected', mongoURI))
  .catch(err => console.log(err));

// EJS
app.use(express.static(path.join(__dirname + './views')));
app.use(expressLayouts);
app.set('view engine', 'ejs');

// Express body parser
app.use(express.urlencoded({ extended: true }));

// Cookie Parser
app.use(cookieParser());

// Morgan for logging
app.use(morgan('dev'))

// Express session
app.use(
  session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    name: 'sessionID',
    cookie: {
      maxAge: (900000),
      // secure: true,
    },
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
  })
);

// Method override
app.use(
  methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      // look in urlencoded POST bodies and delete it
      let method = req.body._method
      delete req.body._method
      return method
    }
  })
)

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});


app.use(mongoSanitize({
  replaceWith: '_'
}));

// Data Sanitization
app.use(xss());

// Routes
app.use('/', require('./routes/index.js'));
app.use('/users', require('./routes/users.js'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running on PORT ${PORT}`));
