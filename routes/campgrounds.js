const express = require('express');
let router = express.Router();
const Campground = require('../models/campground');
const middleware = require('../middleware');
const NodeGeocoder = require('node-geocoder');

const options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
 
const geocoder = NodeGeocoder(options);
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

//CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, (req, res) =>{
  // get data from form and add to campgrounds array
  var name = req.body.name;
  var image = req.body.image;
  var desc = req.body.description;
  var author = {
      id: req.user._id,
      username: req.user.username
  }
  geocoder.geocode(req.body.location,  (err, data) => {
    if (err || !data.length) {
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    var lat = data[0].latitude;
    var lng = data[0].longitude;
    var location = data[0].formattedAddress;
    var newCampground = {name: name, image: image, description: desc, author:author, location: location, lat: lat, lng: lng};
    // Create a new campground and save to DB
    Campground.create(newCampground, (err, newlyCreated) =>{
        if(err){
            console.log(err);
        } else {
            //redirect back to campgrounds page
            console.log(newlyCreated);
            res.redirect("/campgrounds");
        }
    });
  });
});

//NEW - show form to create camp
router.get("/new", middleware.isLoggedIn, (req, res) => {
  res.render("campground/new")
});

//SHOW - see more information about camp
router.get('/:id', (req, res) => {
  //find camp with id
  Campground.findById(req.params.id).populate("comments").exec((err, foundCamp) => {
      if (err || !foundCamp) {
          req.flash("error", "Campground not found")
           res.redirect("back");
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

// UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
  geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    req.body.campground.lat = data[0].latitude;
    req.body.campground.lng = data[0].longitude;
    req.body.campground.location = data[0].formattedAddress;

    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, campground){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/campgrounds/" + campground._id);
        }
    });
  });
});

//DELETE ROUTE
router.delete('/:id', middleware.checkCampgroundOwnership, (req, res) => {
  Campground.findByIdAndRemove(req.params.id, (err) => {
    err ?  res.redirect('/campgrounds') :  res.redirect('/campgrounds')
  })
});



module.exports = router;