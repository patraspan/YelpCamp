const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');


// landing page
router.get("/", (req, res) => {
  res.render("landing")
  let path = req.route.path;
  console.log(path)
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

router.get('/loginPage', (req, res) => {
  res.render('loginPage');
});

//login logic
router.post('/login', passport.authenticate("local", 
{
  successRedirect: "/campgrounds", 
  failureRedirect: "/register",
  successFlash: "Welcome back!",
  failureFlash : "User doesn't exist. Please create an account"
}));

//Log out
router.get('/logout', (req, res) => {
  req.logout();
  req.flash("success", "You are now logged out!")
   res.redirect('/campgrounds');
});



module.exports = router;