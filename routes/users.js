const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
const mongo_sanitize = require('mongo-sanitize');
const User = require("../models/User");
const createDomPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const DOMPurify = createDomPurify(new JSDOM().window);
const { forwardAuthenticated, ensureAuthenticated } = require("../config/auth");
const RateLimit = require("express-rate-limit");
var MongoStore = require('rate-limit-mongo');
const db = require('../config/keys').mongoURI;
const moment = require('moment');

const api_limiter = new RateLimit({
  store: new MongoStore({
    uri: db,
    expireTimeMs: 1 * 60 * 1000,
    errorHandler: console.error.bind(null, 'rate-limit-mongo'),
  }),
  max: 50,
  // skip: function (req, res) {
  //   if (req.ip == '::ffff:127.0.0.1') {
  //     return true;
  //   }
  // },
  windowMs: 1 * 60 * 1000,
  skipSuccessfulRequests: true,
  skipFailedRequests: false,
  message: "Too many requests, please wait for 1 minute before logging in.",
  handler: function (req, res, next) {
    req.flash('error', "You have exceeded the maximum login attempts. Please wait for 1 minute.");
    res.redirect('back');
  }
});

// Login Page
router.get("/login", forwardAuthenticated, (req, res) => res.render("login"));

// Register Page
router.get("/register", ensureAuthenticated, (req, res) =>
  res.render("register")
);

// Register
router.post("/register", (req, res) => {
  var { name, email, role, group, password, password2 } = mongo_sanitize(req.body);
  name = DOMPurify.sanitize(name);
  email = DOMPurify.sanitize(email);
  password = DOMPurify.sanitize(password);
  password2 = DOMPurify.sanitize(password2);

  let errors = [];

  if (!name || !email || !role || !password || !password2) {
    errors.push({ msg: "Please fill all required fields" });
  }

  if (password.length != 0 && password.search(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/) < 0) {
    errors.push({ msg: "Passwords should contain alphanumeric characters and special characters (!@#$%^&*)" });
  }

  if (password != password2) {
    errors.push({ msg: "Passwords do not match" });
  }

  if (role === "Developer" && group.length == 0) {
    errors.push({ msg: "Developers need to be part of a group" })
  }

  if (role != "Developer" && group.length != 0) {
    errors.push({ msg: "Only developers should be part of a group" })
  }

  if (password && password.length < 8) {
    errors.push({ msg: "Password must be at least 8 characters" });
  }

  if (errors.length > 0) {
    res.render("register", {
      errors,
      name,
      email,
      role,
      group,
      password,
      password2,
    });
  } else {
    User.findOne({ email: email }).then((user) => {
      if (user) {
        errors.push({ msg: "Email already exists" });
        res.render("register", {
          errors,
          name,
          email,
          role,
          group,
          password,
          password2,
        });
      } else {
        const newUser = new User({
          name,
          email,
          role,
          group,
          password,
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then((user) => {
                req.flash(
                  "success_msg",
                  "User has been created."
                );
                res.redirect("/users/register");
              })
              .catch((err) => console.log(err));
          });
        });
      }
    });
  }
});

// Login
router.post("/login", api_limiter,
  function (req, res, next) {
    passport.authenticate("local", {
      successRedirect: "/dashboard",
      failureRedirect: "/users/login",
      failureFlash: true,
    })
      (req, res, next);
  });

// Logout
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success_msg", "You are logged out");
  res.redirect("/");
});


module.exports = router;
