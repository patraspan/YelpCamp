const Campground = require('../models/campground'),
      Comment = require('../models/comment');


let middlewareObj = {};
middlewareObj.checkCampgroundOwnership = (req, res, next) => {
  if (req.isAuthenticated()) {
    Campground.findById(req.params.id, (err, foundCamp) => {
      err ? (res.redirect('back')) : 
      (foundCamp.author.id.equals(req.user._id) ? next() :  res.redirect('back'))
    })
  } else {
     res.redirect('back');
  }
}
middlewareObj.checkCommentOwnership = (req, res, next) => {
  if (req.isAuthenticated()) {
    Comment.findById(req.params.comment_id, (err, foundComment) => {
      err ? (res.redirect('back')) : 
      (foundComment.author.id.equals(req.user._id) ? next() :  res.redirect('back'))
    })
  } else {
     res.redirect('back');
  }
}
middlewareObj.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
      return next();
  }
   res.redirect('/loginPage');
}
module.exports = middlewareObj;