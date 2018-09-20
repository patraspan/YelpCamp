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

router.get("/", function(req, res){
  var perPage = 8;
  var pageQuery = parseInt(req.query.page);
  var pageNumber = pageQuery ? pageQuery : 1;
  var noMatch = null;
  if(req.query.search) {
      const regex = new RegExp(escapeRegex(req.query.search), 'gi');
      Campground.find({name: regex}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, allCampgrounds) {
          Campground.countDocuments({name: regex}).exec(function (err, count) {
              if (err) {
                  console.log(err);
                  res.redirect("back");
              } else {
                  if(allCampgrounds.length < 1) {
                      noMatch = "No campgrounds match that query, please try again.";
                  }
                  res.render("campground/index", {
                      campgrounds: allCampgrounds,
                      current: pageNumber,
                      pages: Math.ceil(count / perPage),
                      noMatch: noMatch,
                      search: req.query.search
                  });
              }
          });
      });
  } else {
      // get all campgrounds from DB
      Campground.find({}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, allCampgrounds) {
          Campground.countDocuments().exec(function (err, count) {
              if (err) {
                  console.log(err);
              } else {
                  res.render("campground/index", {
                      campgrounds: allCampgrounds,
                      current: pageNumber,
                      pages: Math.ceil(count / perPage),
                      noMatch: noMatch,
                      search: false
                  });
              }
          });
      });
  }
});



//CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, upload.single('image'), (req, res) => {
 // get data from form and add to campgrounds array
 let  name = req.body.name,
      image = req.body.image,
      imageId = req.body.imageId,
      description = req.body.description,
      price = req.body.price,
      author = {
      id: req.user._id,
      username: req.user.username
      }

console.log(name, description, author, avatar);

cloudinary.v2.uploader.upload(req.file.path, function(err, result) {
  if(err) {
    req.flash('error', err.message);
    return res.redirect('back');
  }
  // add cloudinary url for the image to the campground object under image property
  image = result.secure_url;
  // add image's public_id to campground object
  imageId = result.public_id;
  // add author to campground
  author = {
    id: req.user._id,
    username: req.user.username
  }
  console.log(image, imageId);
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
        imageId,
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
router.put("/:id", middleware.checkCampgroundOwnership, upload.single('image'), (req, res) => {
  geocoder.geocode(req.body.location,  (err, data) => {
    if (err || !data.length) {
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    req.body.campground.lat = data[0].latitude;
    req.body.campground.lng = data[0].longitude;
    req.body.campground.location = data[0].formattedAddress;

    Campground.findById(req.params.id, async (err, campground) => {
      
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            if (req.file) {
              try {
                await cloudinary.v2.uploader.destroy(campground.imageId);
                let result = await cloudinary.v2.uploader.upload(req.file.path);
                campground.imageId = result.public_id;
                campground.image = result.secure_url; 
                
              } catch(err) {
                console.log(imageId, campground.image);
                req.flash("error", err.message);
                return res.redirect("back");
              }
            }
            
            campground.name= req.body.name;
            campground.description= req.body.description;
            
            campground.save();
            req.flash("success","Successfully Updated!");
            res.redirect("/campgrounds/" + campground._id);
        }
    });
  });
});

//DELETE ROUTE
router.delete('.:id', middleware.checkCampgroundOwnership, (req, res) => {
  Campground.findById(req.params.id, async (err, campground) =>{
    if (err) {
      req.flash("error", err.message);
            res.redirect("back");
    } 
    try {
      await cloudinary.v2.uploader.destroy(campground.imageId);
      campground.remove();
      req.flash('success', 'Campground deleted')
      req.redirect('/campgrounds')
    } catch(err) {
      if (err) {
        req.flash("error", err.message);
        res.redirect("back");
      }
    }
  })

});
router.delete('/:id', middleware.checkCampgroundOwnership, (req, res) => {
  Campground.findByIdAndRemove(req.params.id, (err) => {
    err ?  res.redirect('/campgrounds') :  res.redirect('/campgrounds')
  })
});

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

module.exports = router;