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

//Provide JSON output listing all students
app.get("/students", function(req, res) {
    db.query('select * from Students').then(results => {
        console.log(results);
        res.json(results);
    });
});

//Provide an HTML formatted output listing all students in a table
app.get("/students/html", function(req, res) {
    db.query('select * from Students').then(results => {
        let html = '<table border="1">';
        html += '<tr><th>ID</th><th>Name</th></tr>';
        for (var row of results) {
            html += '<tr>';
            html += '<td>' + row.id + '</td>';
            html += '<td><a href="/student/' + row.id + '">' + row.name + '</a></td>';
            html += '</tr>';
        }
        html += '</table>';
        res.send(html);
    });
});

//Create a single-student page which lists a student name, their programme and their modules
app.get("/student/:id", function(req, res) {
    let id = req.params.id;
    db.query('select * from Students where id = ?', [id]).then(results => {
        let student = results[0];
        let html = '<h1>' + student.name + '</h1>';
        html += '<p>Student ID: ' + student.id + '</p>';
        res.send(html);
    });
});

//Independent Task 1 — All programmes as JSON
//route /programmes
app.get("/programmes", function(req, res) {
    db.query('select * from Programmes').then(results => {
        res.json(results);
    });
});

//Independent Task 2 — Programmes HTML table
//route /programmes/html
app.get("/programmes/html", function(req, res) {
    db.query('select * from Programmes').then(results => {
        let html = '<table border="1">';
        html += '<tr><th>ID</th><th>Name</th></tr>';
        for (var row of results) {
            html += '<tr>';
            html += '<td>' + row.id + '</td>';
            html += '<td><a href="/programme/' + row.id + '">' + row.name + '</a></td>';
            html += '</tr>';
        }
        html += '</table>';
        res.send(html);
    });
});

// route Task 3 — Single programme page
//route /programme/:id
app.get("/programme/:id", function(req, res) {
    let id = req.params.id;
    db.query('select * from Programmes where id = ?', [id]).then(results => {
        let programme = results[0];
        let html = '<h1>' + programme.name + '</h1>';
        html += '<p>Programme ID: ' + programme.id + '</p>';
        
        // Get all modules for this programme
        db.query('select * from Modules join Programme_Modules on Modules.code = Programme_Modules.module where Programme_Modules.programme = ?', [id]).then(moduleResults => {
            html += '<h2>Modules</h2>';
            html += '<table border="1">';
            html += '<tr><th>Code</th><th>Name</th></tr>';
            for (var row of moduleResults) {
                html += '<tr>';
                html += '<td>' + row.code + '</td>';
                html += '<td>' + row.name + '</td>';
                html += '</tr>';
            }
            html += '</table>';
            res.send(html);
        });
    });
});

//Independent Task 4 — All modules as JSON  //route /modules
app.get("/modules", function(req, res) {
    db.query('select * from Modules').then(results => {
        res.json(results);
    });
});

//Independent Task 5 — Modules HTML table //route /modules/html
app.get("/modules/html", function(req, res) {
    db.query('select * from Modules').then(results => {
        let html = '<table border="1">';
        html += '<tr><th>Code</th><th>Name</th></tr>';
        for (var row of results) {
            html += '<tr>';
            html += '<td>' + row.code + '</td>';
            html += '<td><a href="/module/' + row.code + '">' + row.name + '</a></td>';
            html += '</tr>';
        }
        html += '</table>';
        res.send(html);
    });
});

//Independent Task 6 — Single module page //route /module/:code
app.get("/module/:code", function(req, res) {
    let code = req.params.code;
    db.query('select * from Modules where code = ?', [code]).then(results => {
        let module = results[0];
        let html = '<h1>' + module.name + '</h1>';
        html += '<p>Module Code: ' + module.code + '</p>';
        res.send(html);
    });
});

