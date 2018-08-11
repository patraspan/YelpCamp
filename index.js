const express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    Campground = require('./models/campground'),
    Comment = require('./models/comment');
    // seedDB = require('./seeds');
    // Comment = require('./models/comment'),
    // User = require('./models/user');

// port
const PORT = 5000 || process.env.PORT,
    IP = process.env.IP;

//Mongoose connection

mongoose.connect("mongodb://localhost/yelp_camp");
app.use(express.static(__dirname + 'public'));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.set("view engine", 'ejs');
// seedDB();

app.get("/", (req, res) => {
    res.render("landing");
});
//INDEX - show all camps
app.get("/campgrounds", (req, res) => {
    //get all camps from db
    Campground.find({}, (err, campgrounds) => {
        if (err) {
            console.log(err);
        }
        res.render("campground/index", {
            campgrounds
        });
    });
});

// CREATE - add new camp
app.post("/campgrounds", (req, res) => {
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

//NEW - show form to reate
app.get("/campgrounds/new", (req, res) => {
    res.render("campground/new")
});

//SHOW - see more information about camp
app.get('/campgrounds/:id', (req, res) => {
    //find camp with id
    Campground.findById(req.params.id).populate("comments").exec((err, foundCamp) => {
        if (err) {
            console.log(err);
        }
        res.render('campground/show',{ campground: foundCamp });
    });    
});
//=================
//COMMENTS ROUTES
//=================

//use only if You want a new form site for adding posts

// app.get('/campgrounds/:id/comments/new', (req, res) => {
//     Campground.findById(req.params.id, (err, campground) => {
//         err ? console.log(err) : res.render("comments/new", {campground: campground});
//     })
// });

app.post('/campgrounds/:id/comments', (req, res) => {
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

//coect new comment to camp
//redirect campground show page

    
});
//listen to port
app.listen(PORT, IP, () => {
    console.log(`YelpCamp Server runs smoothly at ${PORT}`);
});