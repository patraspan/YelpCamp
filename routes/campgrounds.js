const express = require('express');
const router = express.Router();
const Campground = require('../models/campground');
const middleware = require('../middleware');
const NodeGeocoder = require('node-geocoder');
var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'dsgnpk', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

//Geocoder options
const options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
 
const geocoder = NodeGeocoder(options);

//INDEX - show all camps
router.get("/", (req, res) => {
  var noMatch = null;
  if (req.query.search) {
    const regex = new RegExp(escapeRagex(req.query.search), 'gi')
    //get all camps from DB
    Campground.find({name:regex}, (err, allCampgrounds) => {
      if (err) {
        console.log(err);
      } else {
        
        if (allCampgrounds.length < 1) {
          noMatch = "No campgrounds match the search, please try again"
        }
        res.render("campground/index", {campgrounds: allCampgrounds, noMatch});
      }
    })
  } else {
    //get all camps from db
    Campground.find({}, (err, campgrounds) => {
      if (err) {
        console.log(err);
      }
      res.render("campground/index", {
        campgrounds,
        noMatch
      });
    });
  }
});



//CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, upload.single('image'), (req, res) => {
 // get data from form and add to campgrounds array
 let  name = req.body.name,
      image = req.body.image,
      description = req.body.description,
      price = req.body.price,
      author = {
      id: req.user._id,
      username: req.user.username
      }

console.log(name, description, author);

cloudinary.v2.uploader.upload(req.file.path, function(err, result) {
  if(err) {
    req.flash('error', err.message);
    return res.redirect('back');
  }
  // add cloudinary url for the image to the campground object under image property
  image = result.secure_url;
  // add image's public_id to campground object
  req.body.imageId = result.public_id;
  // add author to campground
  author = {
    id: req.user._id,
    username: req.user.username
  }
  console.log(req.body.imageId);
    geocoder.geocode(req.body.location, (err, data) => {
      if (err || !data.length) {
        req.flash('error', 'Invalid address');
        return res.redirect('back');
      }
      const lat = data[0].latitude;
      const lng = data[0].longitude;
      const location = data[0].formattedAddress;
      
      const newCampground = {
        name,
        image,
        description,
        author,
        price,
        location,
        lat,
        lng
      };
      // Create a new campground and save to DB
      Campground.create(newCampground, (err, newlyCreated) => {
        if (err) {
          req.flash('error', err.message);
          return res.redirect('back');
        } else {
          res.redirect('/campgrounds/' + newlyCreated.id);
        }
      });
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

function escapeRagex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

module.exports = router;