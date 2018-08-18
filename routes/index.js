const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');

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
  let newUser = new User({username: req.body.username});
  User.register(newUser, req.body.password, (err, user) => {
     if (err) {
         console.log(err)
         return res.render("register");
         
     }
     passport.authenticate("local")(req, res, () => {
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
   res.redirect('/campgrounds');
});

module.exports = router;