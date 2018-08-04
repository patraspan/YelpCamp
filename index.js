const express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose");
    
// port
const PORT = 5000 || process.env.PORT,
        IP = process.env.IP;

//Mongoose connection
mongoose.connect("mongodb://localhost/yelp_camp");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", 'ejs');

//SCHEMA setup
const campgroundSchema = new mongoose.Schema({
    name: String,
    image: String
});
const Campground = mongoose.model("Campground", campgroundSchema);

Campground.create(
    {
    name: "Camping uno",
    image: "https://farm9.staticflickr.com/8422/7842069486_c61e4c6025.jpg"
    }, function (err, campground){
        if (err) {
            console.log(err);
        } else {
            console.log("Newly created campground: ");
            console.log(campground);
        }
    });

var campgrounds = [
        {name: "Camping uno", image: "https://farm9.staticflickr.com/8422/7842069486_c61e4c6025.jpg"},
        {name: "Camping number two", image: "https://farm8.staticflickr.com/7205/7121863467_eb0aa64193.jpg"},
        {name: "Camping tres", image: "https://farm2.staticflickr.com/1424/1430198323_c26451b047.jpg"}
        ];




app.get("/", function(req, res){
    res.render("landing");
});

app.get("/campgrounds", function(req, res){
            res.render("campgrounds",{campgrounds:campgrounds});
});

app.post("/campgrounds", function(req, res){
   //get data from FORM and add to campgrouds array
   const name =  req.body.name;
   const image =  req.body.image;
   const newCampground = {name: name, image: image};
   campgrounds.push(newCampground);
    //redirect back to campgrounds
    res.redirect("/campgrounds")
})
    
app.get("/campgrounds/new", function(req, res) {
    res.render("new")
});

//listen to port
app.listen(PORT, IP, function(){
    console.log(`YelpCamp Server runs smoothly at ${PORT}`);
});
