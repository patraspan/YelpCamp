const express = require('express');
const router = express.Router({mergeParams:true});
const Campground = require('../models/campground');
const Comment = require('../models/comment');
const middleware = require('../middleware');
const {isLoggedIn, checkCommentOwnership, notEmpty} = middleware;
//use only if You want a new form site for adding posts

// router.get('/campgrounds/:id/comments/new', (req, res) => {
//     Campground.findById(req.params.id, (err, campground) => {
//         err ? console.log(err) : res.render("comments/new", {campground: campground});
//     })
// });

//Comments creator

router.post('/', isLoggedIn, notEmpty, (req, res) => {
  // lokup camps using ID
      Campground.findById(req.params.id, (err, campground) => {
          if (err) {
              console.log(err);
              res.redirect('/campgrounds');
          } else {
              //create new comment
              Comment.create(req.body.comment, (err, comment) => {
                  if (err) {
                    req.flash("error", "something went wrong");                      
                  } else {
                    //add username and id
                      comment.author.id = req.user._id;
                      comment.author.username = req.user.username;
                      comment.author.avatar = req.user.avatar;
                      console.log(comment.author.avatar);
                    //save comment
                      comment.save();
                      campground.comments.push(comment);
                      campground.save();
                      req.flash("success", "Successfully added comment")
                      res.redirect('/campgrounds/'+ campground._id);
                  }
              })
          }
          
      })
  });

  //EDIT ROUTE
  router.get('/:comment_id/edit', checkCommentOwnership, (req, res) => {
    Campground.findById(req.params.id, (err, foundCamp) => {
      if (err || !foundCamp) {
        req.flash("error", "Campground not found");
        return  res.redirect('back');
      }
      Comment.findById(req.params.comment_id, (err, foundComment) => {
        err ?  res.redirect('back') : res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
      })
    }) 
    
  });

  //UPDATE ROUTE
router.put('/:comment_id', checkCommentOwnership, (req, res) => {
  Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment , (err, updatedComment) => {
    if (err) {
      res.redirect('back')
    } else {
      req.flash("success", "Comment updated");
      res.redirect('/campgrounds/' + req.params.id)
    }
  });
});
  //DELETE ROUTE
  router.delete('/:comment_id', checkCommentOwnership, (req, res) => {
    Comment.findByIdAndRemove(req.params.comment_id, (err) => {
      if (err) {
        res.redirect('back')
      } else {
        req.flash("success", "Comment deleted");
        res.redirect('/campgrounds/' + req.params.id)
      }
    })
  });

  module.exports = router;