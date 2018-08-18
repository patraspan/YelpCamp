const express = require('express');
let router = express.Router();
const Campground = require('../models/campground');

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
router.post("/", (req, res) => {
  //get data from FORM and add to campgrouds array
  const name = req.body.name;
  const image = req.body.image;
  const desc = req.body.description;
  const newCampground = {
      name: name,
      image: image,
      description: desc
  };
  //Create new campground and save to db
  Campground.create(newCampground, (err, newlyCreated) => {
      if (err) {
          console.log(err);
      }
      //redirect back to campgrounds
      res.redirect("/campgrounds")
  });
})

//NEW - show form to create camp
router.get("/new", (req, res) => {
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

module.exports = router;