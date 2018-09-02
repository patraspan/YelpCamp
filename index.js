require('dotenv').config();

const express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    passport = require('passport'),
    LocalStrategy = require('passport-local');
    // seedDB = require('./seeds');
    User = require('./models/user'),
    methodOverride = require('method-override'),
    flash = require('connect-flash');

    //Routes imports
const commentRoutes = require('./routes/comments'),
      campgroundRoutes = require('./routes/campgrounds'),
      usersRoutes = require('./routes/users');
      indexRoutes = require('./routes/index');

// port
const PORT = 5000 || process.env.PORT,
    IP = process.env.IP;

//Mongoose connection

mongoose.connect("mongodb://localhost/yelp_camp_v4");
app.use(bodyParser.urlencoded({
    extended: true
}));
app.set("view engine", 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(methodOverride('_method'));
// seedDB();
app.locals.moment = require('moment');

// PASSPORT CONFIG
app.use(require('express-session')({
    secret: "whatever",
    resave: false,
    saveUninitialized: false
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//this let us set  currentUser: req.user in every site
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});





app.use(indexRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/users", usersRoutes);
app.use("/campgrounds", campgroundRoutes);
//listen to port
app.listen(PORT, IP, () => {
    console.log(`YelpCamp Server runs smoothly at ${PORT}`);
});