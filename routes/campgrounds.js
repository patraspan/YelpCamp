const express = require('express');
let router = express.Router();
const Campground = require('../models/campground');
const middleware = require('../middleware');

//INDEX - show all camps
router.get("/", (req, res) => {
  //get all camps from db
  Campground.find({}, (err, campgrounds) => {
      if (err) {
          console.log(err);
      }
      res.render("campground/index", {
          campgrounds,
      });
  });
});

// CREATE - add new camp
router.post("/", middleware.isLoggedIn, (req, res) => {
  //get data from FORM and add to campgrouds array
  const name = req.body.name;
  const image = req.body.image;
  const desc = req.body.description;
  const author = {
    id: req.user._id,
    username: req.user.username
  }
  const newCampground = {
      name,
      image,
      description: desc,
      author
  };
  //Create new campground and save to db
  Campground.create(newCampground, (err, newlyCreated) => {
      if (err) {
          console.log(err);
      }
      console.log(newlyCreated);
      //redirect back to campgrounds
      res.redirect("/campgrounds")
  });
})

//NEW - show form to create camp
router.get("/new", middleware.isLoggedIn, (req, res) => {
  res.render("campground/new")
});

//SHOW - see more information about camp
router.get('/:id', (req, res) => {
  //find camp with id
  Campground.findById(req.params.id).populate("comments").exec((err, foundCamp) => {
      if (err) {
          console.log(err); 
      }
      res.render('campground/show',{ campground: foundCamp });
  });    
});
//EDIT CAMP ROUTE
router.get('/:id/edit', middleware.checkCampgroundOwnership, (req, res) => {
  Campground.findById(req.params.id, (err, foundCamp) => {
    res.render("campground/edit", {
      campground: foundCamp
    })
  });
});

//UPDATE CAMP ROUTE
router.put('/:id', middleware.checkCampgroundOwnership, (req, res) => {
  //find and update correct campground
   
  Campground.findByIdAndUpdate(req.params.id, req.body.campground, (err, updatedCamp) => {
    err ? ( res.redirect('/campgrounds')) :  res.redirect('/campgrounds/'+ req.params.id);
  })
  //redirect to show page
});

//DELETE ROUTE
router.delete('/:id', middleware.checkCampgroundOwnership, (req, res) => {
  Campground.findByIdAndRemove(req.params.id, (err) => {
    err ?  res.redirect('/campgrounds') :  res.redirect('/campgrounds')
  })
});



module.exports = router;