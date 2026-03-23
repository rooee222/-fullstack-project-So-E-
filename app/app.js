// Import express.js
const express = require("express");

// Create express app
var app = express();

app.use(express.urlencoded({ extended: true }));

// Use the Pug templating engine
app.set('view engine', 'pug');
app.set('views', './app/views');

// Add static files location
app.use(express.static("static"));

// Get the functions in the db.js file to use
const db = require('./services/db');

// Get the models


// Create a route for root - /
app.get("/", function(req, res) {
    var test_data = ['one', 'two', 'three', 'four'];
    res.render("index", {'title':'My index page', 'heading':'My heading', 'data':test_data});
});


//create a /roehampton route 
app.get("/roehampton", function(req, res) {
    console.log(req.url)
    let path = req.url;
    let arr = path.split('');
    arr.splice(0, 1);
    let reversed = arr.reverse().join('');
    res.send(reversed);
});

// create a dynamic route which where a user may request /user/:id 
app.get("/user/:id", function(req, res) {
    res.send("User ID: " + req.params.id);
});


//Creating dynamic route where the user may request /number/:n where n is any number using loop
app.get("/number/:n", function(req, res) {
    let n = req.params.n;
    let table = '<table border="1">';
    for (var i = 0; i <= n; i++) {
        table += '<tr><td>' + i + '</td></tr>';
    }
    table += '</table>';
    res.send(table);
});


// Create a route for /goodbye
// Responds to a 'GET' request
app.get("/goodbye", function(req, res) {
    res.send("Goodbye world!");
});

// Create a dynamic route for /hello/<name>, where name is any value provided by user
// At the end of the URL
// Responds to a 'GET' request
app.get("/hello/:name", function(req, res) {
    // req.params contains any parameters in the request
    // We can examine it in the console for debugging purposes
    console.log(req.params);
    //  Retrieve the 'name' parameter and use it in a dynamically generated page
    res.send("Hello " + req.params.name);
});

// Start server on port 3000
app.listen(3000,function(){
    console.log(`Server running at http://127.0.0.1:3000/`);
});



// All users
app.get("/users", function(req, res) {
    var sql = 'SELECT * FROM users';
    db.query(sql).then(results => {
        res.render('users', { data: results });
    });
});

// Single user profile
app.get("/users/:id", function(req, res) {
    var userID = req.params.id;
    var userSql = "SELECT * FROM users WHERE userID = ?";
    var listingSql = "SELECT * FROM listings WHERE userID = ?";
    db.query(userSql, [userID]).then(userResult => {
        db.query(listingSql, [userID]).then(listingResult => {
            res.render('user-single', { user: userResult[0], listings: listingResult });
        });
    });
});

// All listings
app.get("/listings", function(req, res) {
    var search = req.query.search || '';
    var category = req.query.category || '';
    var sql = "SELECT listings.*, users.username FROM listings JOIN users ON listings.userID = users.userID WHERE listings.status = 'active'";
    var params = [];
    if (search) {
        sql += " AND listings.title LIKE ?";
        params.push('%' + search + '%');
    }
    if (category) {
        sql += " AND listings.category = ?";
        params.push(category);
    }
    sql += " ORDER BY listings.createdAt DESC";
    db.query(sql, params).then(results => {
        res.render('listings', { data: results, search: search, category: category });
    });
});

// Single listing detail
app.get("/listings/:id", function(req, res) {
    var listingID = req.params.id;
    var sql = "SELECT listings.*, users.username FROM listings JOIN users ON listings.userID = users.userID WHERE listings.listingID = ?";
    db.query(sql, [listingID]).then(results => {
        res.render('listing-single', { listing: results[0] });
    });
});

// /about route
app.get("/about", function(req, res) {
    res.render("about");
}); 