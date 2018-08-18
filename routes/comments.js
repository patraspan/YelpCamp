const express = require('express');
let router = express.Router({mergeParams:true});
const Campground = require('../models/campground');
let Comment = require('../models/comment');

//use only if You want a new form site for adding posts

// router.get('/campgrounds/:id/comments/new', (req, res) => {
//     Campground.findById(req.params.id, (err, campground) => {
//         err ? console.log(err) : res.render("comments/new", {campground: campground});
//     })
// });

//Comments creator

router.post('/', isLoggedIn, (req, res) => {
  // lokup camps using ID
      Campground.findById(req.params.id, (err, campground) => {
          if (err) {
              console.log(err);
              res.redirect('/campgrounds');
          } else {
              //create new comment
              Comment.create(req.body.comment, (err, comment) => {
                  if (err) {
                      console.log(err);
                      
                  } else {
                      campground.comments.push(comment);
                      campground.save();
                      res.redirect('/campgrounds/'+ campground._id);
                  }
                  
              })
          }
          
      })
  });
//middleware
  function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
     res.redirect('/loginPage');
    
}
  module.exports = router;