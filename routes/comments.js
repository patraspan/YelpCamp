const express = require('express');
let router = express.Router({mergeParams:true});
const Campground = require('../models/campground');
let Comment = require('../models/comment');
const middleware = require('../middleware');

//use only if You want a new form site for adding posts

// router.get('/campgrounds/:id/comments/new', (req, res) => {
//     Campground.findById(req.params.id, (err, campground) => {
//         err ? console.log(err) : res.render("comments/new", {campground: campground});
//     })
// });

//Comments creator

router.post('/', middleware.isLoggedIn, (req, res) => {
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
                    //add username and id
                      comment.author.id = req.user._id;
                      comment.author.username = req.user.username;
                    //save comment
                    comment.save();
                    console.log(comment);
                      campground.comments.push(comment);
                      campground.save();
                      res.redirect('/campgrounds/'+ campground._id);
                  }
                  
              })
          }
          
      })
  });

  //EDIT ROUTE
  router.get('/:comment_id/edit', middleware.checkCommentOwnership, (req, res) => {
    Comment.findById(req.params.comment_id, (err, foundComment) => {
      err ?  res.redirect('back') : res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
    })
  });

  //UPDATE ROUTE
router.put('/:comment_id', middleware.checkCommentOwnership, (req, res) => {
  Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment , (err, updatedComment) => {
    err ?  res.redirect('back') : res.redirect('/campgrounds/' + req.params.id);
  })

});
  //DELETE ROUTE
  router.delete('/:comment_id', middleware.checkCommentOwnership, (req, res) => {
    Comment.findByIdAndRemove(req.params.comment_id, (err) => {
      err ?  res.redirect('back') :  res.redirect('/campgrounds/' + req.params.id)
    })
  });

  module.exports = router;