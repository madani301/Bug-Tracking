const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const sanitize = require('mongo-sanitize');
const createDomPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const DOMPurify = createDomPurify(new JSDOM().window);

// Load User model
const User = require('../models/User');

module.exports = function (passport) {
  passport.use(
    new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
      // Match user
      User.findOne({
        email: sanitize(email)
      }).then(user => {
        if (!user) {
          return done(null, false, { message: 'Email not registered' });
        }

        // Match password
        bcrypt.compare(password, sanitize(user.password), (err, isMatch) => {
          if (err) throw err;
          if (isMatch) {
            return done(null, user);
          } else {
            return done(null, false, { message: 'Incorrect password' });
          }
        });
      });
    })
  );

  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
      done(err, user);
    });
  });
};
