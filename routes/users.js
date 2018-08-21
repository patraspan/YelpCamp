const express = require('express');
const router = express.Router({mergeParams:true});
const User = require('../models/user');
const Campground = require('../models/campground');
const middleware = require('../middleware');
//User profile

router.get('/:id', (req, res) => {
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
//EDIT USER ROUTE
router.get('/:id/edit', (req, res) => {
  User.findById(req.params.id, (err, foundUser) => {
    res.render("users/edit", {
      user: foundUser
    })
  });
});
  //UPDATE USER ROUTE
router.put('/:id', (req, res) => {
  console.log(req.body.user);
  User.findByIdAndUpdate(req.params.id, req.body.user, (err, updatedUser) => {
    if (err) {
      res.redirect('back')
    } else {
      req.flash("success", "User updated");
      res.redirect('/users/' + req.params.id)
    }
  });
});

//DELETE ROUTE
router.delete('/:id', (req, res) => {
  User.findByIdAndRemove(req.params.id, (err) => {
    if (err) {
      req.flash("error", "Something went wrong");
      res.redirect('/campgrounds')
    }
    req.flash("success", "User successfully removed from database");
    res.redirect('/campgrounds')
 
  })
});

module.exports = router;