const express = require("express");
var app = express();
const path = require('path');

const { User } = require("./models/user");
const { Listing } = require("./models/listing");
const { Message } = require("./models/message");
const { Report } = require("./models/report");

// Multer for image uploads
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'static/uploads/');
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

app.use(express.urlencoded({ extended: true }));

var session = require('express-session');
app.use(session({
    secret: 'communityshare_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.use(function(req, res, next) {
    res.locals.session = req.session;
    next();
});

app.set('view engine', 'pug');
app.set('views', './app/views');
app.use(express.static("static"));

const db = require('./services/db');

// Home
app.get("/", function(req, res) {
    res.render("index");
});

app.get("/roehampton", function(req, res) {
    console.log(req.url)
    let path = req.url;
    let arr = path.split('');
    arr.splice(0, 1);
    let reversed = arr.reverse().join('');
    res.send(reversed);
});

app.get("/user/:id", function(req, res) {
    res.send("User ID: " + req.params.id);
});

app.get("/number/:n", function(req, res) {
    let n = req.params.n;
    let table = '<table border="1">';
    for (var i = 0; i <= n; i++) {
        table += '<tr><td>' + i + '</td></tr>';
    }
    table += '</table>';
    res.send(table);
});

app.get("/goodbye", function(req, res) {
    res.send("Goodbye world!");
});

app.get("/hello/:name", function(req, res) {
    console.log(req.params);
    res.send("Hello " + req.params.name);
});

// All users
app.get("/users", function(req, res) {
    var sql = 'SELECT * FROM users';
    db.query(sql).then(results => {
        res.render('users', { data: results });
    }).catch(err => {
        console.error('Database error:', err.message);
        res.status(500).send('Database connection error');
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
    }).catch(err => {
        console.error('Database error:', err.message);
        res.status(500).send('Database connection error');
    });
});

// All listings
app.get("/listings", async function(req, res) {
    var search = req.query.search || '';
    var category = req.query.category || '';
    try {
        var results = await Listing.getAllListings(search, category);
        res.render('listings', { data: results, search: search, category: category });
    } catch(err) {
        console.error(err.message);
        res.status(500).send('Error loading listings');
    }
});

// Create listing form
app.get("/listings/new", function(req, res) {
    if (!req.session.loggedIn) {
        res.redirect('/login');
    } else {
        res.render('listing-new');
    }
});

// Create listing POST with image upload
app.post("/listings/new", upload.single('image'), async function(req, res) {
    if (!req.session.loggedIn) {
        res.redirect('/login');
    } else {
        var params = req.body;
        var imageURL = req.file ? '/uploads/' + req.file.filename : null;
        try {
            await Listing.createListing(params.title, params.description, params.category, req.session.uid, imageURL);
            res.redirect('/listings');
        } catch(err) {
            console.error(err.message);
        }
    }
});

// =====================
// MANAGE MY LISTINGS
// =====================

app.get("/my-listings", async function(req, res) {
    if (!req.session.loggedIn) {
        return res.redirect('/login');
    }
    try {
        var sql = "SELECT * FROM listings WHERE userID = ? ORDER BY createdAt DESC";
        var listings = await db.query(sql, [req.session.uid]);
        res.render('my-listings', { listings: listings });
    } catch(err) {
        console.error(err.message);
        res.status(500).send('Error loading your listings');
    }
});

app.get("/listings/:id/edit", async function(req, res) {
    if (!req.session.loggedIn) {
        return res.redirect('/login');
    }
    try {
        var sql = "SELECT * FROM listings WHERE listingID = ? AND userID = ?";
        var result = await db.query(sql, [req.params.id, req.session.uid]);
        if (result.length === 0) {
            return res.send('Listing not found or you do not have permission to edit it.');
        }
        res.render('listing-edit', { listing: result[0] });
    } catch(err) {
        console.error(err.message);
        res.status(500).send('Error loading listing');
    }
});

app.post("/listings/:id/edit", upload.single('image'), async function(req, res) {
    if (!req.session.loggedIn) {
        return res.redirect('/login');
    }
    try {
        var checkSql = "SELECT * FROM listings WHERE listingID = ? AND userID = ?";
        var check = await db.query(checkSql, [req.params.id, req.session.uid]);
        if (check.length === 0) {
            return res.send('You do not have permission to edit this listing.');
        }
        var params = req.body;
        if (req.file) {
            var imageURL = '/uploads/' + req.file.filename;
            var sql = "UPDATE listings SET title = ?, description = ?, category = ?, imageURL = ? WHERE listingID = ? AND userID = ?";
            await db.query(sql, [params.title, params.description, params.category, imageURL, req.params.id, req.session.uid]);
        } else {
            var sql = "UPDATE listings SET title = ?, description = ?, category = ? WHERE listingID = ? AND userID = ?";
            await db.query(sql, [params.title, params.description, params.category, req.params.id, req.session.uid]);
        }
        res.redirect('/my-listings');
    } catch(err) {
        console.error(err.message);
        res.status(500).send('Error updating listing');
    }
});

app.post("/listings/:id/delete", async function(req, res) {
    if (!req.session.loggedIn) {
        return res.redirect('/login');
    }
    try {
        var sql = "DELETE FROM listings WHERE listingID = ? AND userID = ?";
        await db.query(sql, [req.params.id, req.session.uid]);
        res.redirect('/my-listings');
    } catch(err) {
        console.error(err.message);
        res.status(500).send('Error deleting listing');
    }
});

// Single listing detail
app.get("/listings/:id", async function(req, res) {
    var listingID = req.params.id;
    try {
        var listing = new Listing(listingID);
        await listing.getListingDetails();
        res.render('listing-single', { listing: listing, query: req.query });
    } catch(err) {
        console.error(err.message);
        res.status(500).send('Error loading listing');
    }
});

// =====================
// MESSAGING
// =====================

app.get("/messages", async function(req, res) {
    if (!req.session.loggedIn) {
        return res.redirect('/login');
    }
    try {
        var inbox = await Message.getInbox(req.session.uid);
        var sent = await Message.getSent(req.session.uid);
        res.render('messages', { inbox: inbox, sent: sent });
    } catch(err) {
        console.error(err.message);
        res.status(500).send('Error loading messages');
    }
});

app.post("/messages/send", async function(req, res) {
    if (!req.session.loggedIn) {
        return res.redirect('/login');
    }
    try {
        var params = req.body;
        await Message.sendMessage(req.session.uid, params.receiverID, params.listingID, params.content);
        res.redirect('/listings/' + params.listingID + '?messageSent=true');
    } catch(err) {
        console.error(err.message);
        res.status(500).send('Error sending message');
    }
});

app.get("/messages/conversation/:userID/:listingID", async function(req, res) {
    if (!req.session.loggedIn) {
        return res.redirect('/login');
    }
    try {
        var conversation = await Message.getConversation(req.session.uid, req.params.userID, req.params.listingID);
        for (var msg of conversation) {
            if (msg.receiverID == req.session.uid && !msg.isRead) {
                await Message.markAsRead(msg.messageID, req.session.uid);
            }
        }
        var userSql = "SELECT username FROM users WHERE userID = ?";
        var userResult = await db.query(userSql, [req.params.userID]);
        var listingSql = "SELECT title FROM listings WHERE listingID = ?";
        var listingResult = await db.query(listingSql, [req.params.listingID]);
        res.render('conversation', {
            messages: conversation,
            otherUser: userResult[0],
            otherUserID: req.params.userID,
            listingID: req.params.listingID,
            listingTitle: listingResult.length > 0 ? listingResult[0].title : 'Unknown Listing'
        });
    } catch(err) {
        console.error(err.message);
        res.status(500).send('Error loading conversation');
    }
});

app.post("/messages/reply", async function(req, res) {
    if (!req.session.loggedIn) {
        return res.redirect('/login');
    }
    try {
        var params = req.body;
        await Message.sendMessage(req.session.uid, params.receiverID, params.listingID, params.content);
        res.redirect('/messages/conversation/' + params.receiverID + '/' + params.listingID);
    } catch(err) {
        console.error(err.message);
        res.status(500).send('Error sending reply');
    }
});

// =====================
// REPORT LISTING
// =====================

app.post("/listings/:id/report", async function(req, res) {
    if (!req.session.loggedIn) {
        return res.redirect('/login');
    }
    try {
        var result = await Report.createReport(req.params.id, req.session.uid, req.body.reason);
        if (result === false) {
            res.redirect('/listings/' + req.params.id + '?alreadyReported=true');
        } else {
            res.redirect('/listings/' + req.params.id + '?reported=true');
        }
    } catch(err) {
        console.error(err.message);
        res.status(500).send('Error submitting report');
    }
});

// Register
app.get('/register', function(req, res) {
    res.render('register');
});

app.post('/register', async function(req, res) {
    params = req.body;
    var user = new User(params.email);
    try {
        var existingId = await user.getIdFromEmail();
        if (existingId) {
            res.send('Email already registered. Please login.');
        } else {
            await user.addUser(params.username, params.password);
            req.session.uid = user.id;
            req.session.loggedIn = true;
            res.redirect('/');
        }
    } catch(err) {
        console.error('Error registering user', err.message);
    }
});

// Login
app.get('/login', function(req, res) {
    res.render('login');
});

app.post('/login', async function(req, res) {
    params = req.body;
    var user = new User(params.email);
    try {
        var uId = await user.getIdFromEmail();
        if (uId) {
            var match = await user.authenticate(params.password);
            if (match) {
                req.session.uid = uId;
                req.session.loggedIn = true;
                res.redirect('/');
            } else {
                res.send('Incorrect password');
            }
        } else {
            res.send('Email not found');
        }
    } catch(err) {
        console.error('Error logging in', err.message);
    }
});

app.get('/logout', function(req, res) {
    req.session.destroy();
    res.redirect('/login');
});

app.get("/about", function(req, res) {
    res.render("about");
});

app.listen(3000, function(){
    console.log(`Server running at http://127.0.0.1:3000/`);
});