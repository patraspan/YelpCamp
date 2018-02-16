var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose")
    
mongoose.connect("mongodb://localhost/yelp_camp");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", 'ejs');

//SCHEMA setup
var campgroundSchema = new mongoose.Schema({
    name: String,
    image: String
});

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
var Campground = mongoose.model("Campground", campgroundSchema);


app.get("/", function(req, res){
    res.render("landing");
});

app.get("/campgrounds", function(req, res){
            res.render("campgrounds",{campgrounds:campgrounds});
});

app.post("/campgrounds", function(req, res){
   //get data from FORM and add to campgrouds array
   var name =  req.body.name;
   var image =  req.body.image;
   var newCampground = {name: name, image: image};
   campgrounds.push(newCampground);
    //redirect back to campgrounds
    res.redirect("/campgrounds")
})
    
app.get("/campgrounds/new", function(req, res) {
    res.render("new")
});

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("YelpCamp Server runs smoothly");
});
