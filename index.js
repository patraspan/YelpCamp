const express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    passport = require('passport'),
    LocalStrategy = require('passport-local');
    // seedDB = require('./seeds');
    User = require('./models/user');
    //Routes imports
const commentRoutes = require('./routes/comments'),
      campgroundRoutes = require('./routes/campgrounds'),
      indexRoutes = require('./routes/index');

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

// PASSPORT CONFIG
app.use(require('express-session')({
    secret: "whatever",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//this let us set  currentUser: req.user in every site
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    next();
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
     res.redirect('login');
    
}
app.use(indexRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/campgrounds", campgroundRoutes);
//listen to port
app.listen(PORT, IP, () => {
    console.log(`YelpCamp Server runs smoothly at ${PORT}`);
});