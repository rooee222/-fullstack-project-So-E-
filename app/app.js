// Import express.js
const express = require("express");

// Create express app
var app = express();

// Add static files location
app.use(express.static("static"));

// Get the functions in the db.js file to use
const db = require('./services/db');

// Create a route for root - /
app.get("/", function(req, res) {
    res.send("hello zone-z");
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

// creating dynamic route which where a user may request /student/:name/:id
app.get("/student/:name/:id", function(req, res) {
    res.send(`
        <table border="1">
            <tr>
                <th>Name</th>
                <th>ID</th>
            </tr>
            <tr>
                <td>${req.params.name}</td>
                <td>${req.params.id}</td>
            </tr>
        </table>
    `);
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

// Create a route for testing the db
app.get("/db_test", function(req, res) {
    // Assumes a table called test_table exists in your database
    sql = 'select * from test_table';
    db.query(sql).then(results => {
        console.log(results);
        res.send(results)
    });
});

// New route for db_test with id
app.get("/db_test/:id", function(req, res) {
    let id = req.params.id;
    sql = `select * from test_table where id = ${id}`;
    db.query(sql).then(results => {
        console.log(results);
        res.send(`
            <h2>Student Details</h2>
            <table border="1">
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                </tr>
                <tr>
                    <td>${results[0].id}</td>
                    <td>${results[0].name}</td>
                </tr>
            </table>
        `)
    });
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