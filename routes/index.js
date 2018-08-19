const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');
const Campground = require('../models/campground');

// landing page
router.get("/", (req, res) => {
  res.render("landing")
});

//show register form
router.get('/register', (req, res) => {
  res.render("register");
});
//handle sign up logic
router.post('/register', (req, res) => {
  let newUser = new User({
    username: req.body.username,
    firstName: req.body.firstName ,
    lastName: req.body.lastName,
    avatar: req.body.avatar,
    email: req.body.email
  });
  if (req.body.adminCode === process.env.SECRET_CODE) {
    newUser.isAdmin = true
  }
  User.register(newUser, req.body.password, (err, user) => {
     if (err) {
         req.flash("error", err.message);
         console.log(err)
          res.redirect('/register');         
     }
     passport.authenticate("local")(req, res, () => {
      req.flash("success", "Welcome to YelpCamp " + req.body.username);
          res.redirect('/campgrounds');
     })
  })
});
//login form
router.get('/login', (req, res) => {
  res.render("login");
  
});
router.get('/loginPage', (req, res) => {
  res.render('loginPage');
});

//login logic
router.post('/login', passport.authenticate("local", 
{
  successRedirect: "/campgrounds", 
  failureRedirect: "/register"}) ,(req, res) => {
});

//Log out
router.get('/logout', (req, res) => {
  req.logout();
  req.flash("success", "You are now logged out!")
   res.redirect('/campgrounds');
});

//User profile

router.get('/users/:id', (req, res) => {
  User.findById(req.params.id, (err, foundUser) => {
    if (err) {
       req.flash("error", "Something went wrong");
       res.redirect('/campgrounds');
    } 
    Campground.find().where('author.id').equals(foundUser._id).exec((err, campgrounds) => {
      if (err) {
        req.flash("error", "Something went wrong");
        res.redirect('/campgrounds');
     } 
     res.render("users/profile", {user: foundUser, campgrounds: campgrounds});
    });
  });
});

module.exports = router;