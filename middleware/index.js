const Campground = require('../models/campground'),
      Comment = require('../models/comment');


let middlewareObj = {};
middlewareObj.checkCampgroundOwnership = (req, res, next) => {
    if (req.isAuthenticated()) {
      Campground.findById(req.params.id, (err, foundCamp) => {
          if (err || !foundCamp) {
            req.flash("error", "You need to be logged in to do that");
            res.redirect('back')
          } else {
              if (foundCamp.author.id.equals(req.user._id) || req.user.isAdmin) {
                next()
              } else {
                req.flash("error", "You don't have permission to do that");
                res.redirect('back')
              }
            }
        })
      } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect('back');
      }
    }
  
middlewareObj.checkCommentOwnership = (req, res, next) => {
  if (req.isAuthenticated()) {
    Comment.findById(req.params.comment_id, (err, foundComment) => {
      if (err || !foundComment) {
        req.flash("error", "Comment not found")
        res.redirect('back')
      } else {
          if (foundComment.author.id.equals(req.user._id) || req.user.isAdmin) {
            next() 
          } else {
            req.flash("error", "You don't have permission to do that")
            res.redirect('back');
          }
      }
    })
  } else {
      req.flash("error", "You need to be logged in to do that");
      res.redirect('back');
  }
}
middlewareObj.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
      return next();
  }
  req.flash("error", "You need to be logged in to do that");
   res.redirect('/loginPage');
}
middlewareObj.notEmpty = (req, res, next) => {
    Comment.findById(req.params.text, (err, foundComment) => {
      if (err || foundComment == '') {
        req.flash("error", "Comment not found")
      }  next()
    })
  };
  
module.exports = middlewareObj;