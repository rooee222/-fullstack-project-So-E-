const express = require("express");
var app = express();
const path = require('path');

const { User } = require("./models/user");
const { Listing } = require("./models/listing");
const { Message } = require("./models/message");
const { Report } = require("./models/report");
const { Review } = require("./models/review");
const { Points } = require("./models/points");
const { Recommendation } = require("./models/recommendation");

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
    cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24}
}));

app.use(function(req, res, next) {
    res.locals.session = req.session;
    next();
});

app.set('view engine', 'pug');
app.set('views', './app/views');
app.use(express.static("static"));

const db = require('./services/db');

// Home with recommendations
app.get("/", async function(req, res) {
    try {
        var recommendations = [];
        if (req.session.loggedIn) {
            recommendations = await Recommendation.getRecommendations(req.session.uid);
            var userPoints = await Points.getPoints(req.session.uid);
            res.locals.userPoints = userPoints;
        }
        res.render("index", { recommendations: recommendations });
    } catch(err) {
        console.error(err.message);
        res.render("index", { recommendations: [] });
    }
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
app.get("/users/:id", async function(req, res) {
    var userID = req.params.id;
    try {
        var userSql = "SELECT * FROM users WHERE userID = ?";
        var listingSql = "SELECT * FROM listings WHERE userID = ?";
        var userResult = await db.query(userSql, [userID]);
        var listingResult = await db.query(listingSql, [userID]);
        var userRating = await Review.getUserAverageRating(userID);
        res.render('user-single', { 
            user: userResult[0], 
            listings: listingResult, 
            userRating: userRating 
        });
    } catch(err) {
        console.error('Database error:', err.message);
        res.status(500).send('Database connection error');
    }
});

// Leaderboard
app.get("/leaderboard", async function(req, res) {
    try {
        var leaderboard = await Points.getLeaderboard();
        res.render('leaderboard', { leaderboard: leaderboard });
    } catch(err) {
        console.error(err.message);
        res.status(500).send('Error loading leaderboard');
    }
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

// Create listing POST with image upload and points
app.post("/listings/new", upload.single('image'), async function(req, res) {
    if (!req.session.loggedIn) {
        res.redirect('/login');
    } else {
        var params = req.body;
        var imageURL = req.file ? '/uploads/' + req.file.filename : null;
        try {
            await Listing.createListing(params.title, params.description, params.category, req.session.uid, imageURL, params.location, params.latitude, params.longitude);
            // Award 10 points for posting a listing
            await Points.awardForListing(req.session.uid);
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
            var sql = "UPDATE listings SET title = ?, description = ?, category = ?, imageURL = ?, location = ?, latitude = ?, longitude = ? WHERE listingID = ? AND userID = ?";
            await db.query(sql, [params.title, params.description, params.category, imageURL, params.location, params.latitude, params.longitude, req.params.id, req.session.uid]);
        } else {
            var sql = "UPDATE listings SET title = ?, description = ?, category = ?, location = ?, latitude = ?, longitude = ? WHERE listingID = ? AND userID = ?";
            await db.query(sql, [params.title, params.description, params.category, params.location, params.latitude, params.longitude, req.params.id, req.session.uid]);
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

// Single listing detail with reviews, recommendations and map
app.get("/listings/:id", async function(req, res) {
    var listingID = req.params.id;
    try {
        var listing = new Listing(listingID);
        await listing.getListingDetails();
        var reviews = await Review.getReviewsForListing(listingID);
        var ratingData = await Review.getAverageRating(listingID);
        var similar = await Recommendation.getSimilarListings(listingID, listing.category);
        res.render('listing-single', { 
            listing: listing, 
            query: req.query, 
            reviews: reviews, 
            ratingData: ratingData,
            similar: similar
        });
    } catch(err) {
        console.error(err.message);
        res.status(500).send('Error loading listing');
    }
});

// =====================
// REVIEWS
// =====================

app.post("/listings/:id/review", async function(req, res) {
    if (!req.session.loggedIn) {
        return res.redirect('/login');
    }
    try {
        var result = await Review.addReview(req.params.id, req.session.uid, req.body.rating, req.body.comment);
        if (result === false) {
            res.redirect('/listings/' + req.params.id + '?alreadyReviewed=true');
        } else {
            res.redirect('/listings/' + req.params.id + '?reviewed=true');
        }
    } catch(err) {
        console.error(err.message);
        res.status(500).send('Error submitting review');
    }
});

// =====================
// MESSAGING with points
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
        // Award 2 points for sending a message
        await Points.awardForMessage(req.session.uid);
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
        await Points.awardForMessage(req.session.uid);
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

// =====================
// ADMIN
// =====================

const { Admin } = require("./models/admin");

// Admin middleware check
async function requireAdmin(req, res, next) {
    if (!req.session.loggedIn) return res.redirect('/login');
    var isAdmin = await Admin.isAdmin(req.session.uid);
    if (!isAdmin) return res.send('Access denied. Admins only.');
    next();
}

// Admin dashboard
app.get("/admin", requireAdmin, async function(req, res) {
    try {
        var reports = await Admin.getAllReports();
        var users = await Admin.getAllUsers();
        res.render('admin-dashboard', { reports: reports, users: users });
    } catch(err) {
        console.error(err.message);
        res.status(500).send('Error loading admin dashboard');
    }
});

// Admin remove listing
app.post("/admin/remove-listing/:id", requireAdmin, async function(req, res) {
    try {
        await Admin.removeListing(req.params.id);
        res.redirect('/admin?listingRemoved=true');
    } catch(err) {
        console.error(err.message);
        res.status(500).send('Error removing listing');
    }
});

// Admin update report status
app.post("/admin/report/:id/status", requireAdmin, async function(req, res) {
    try {
        await Admin.updateReportStatus(req.params.id, req.body.status);
        res.redirect('/admin');
    } catch(err) {
        console.error(err.message);
        res.status(500).send('Error updating report');
    }
});

// Admin ban user
app.post("/admin/ban/:id", requireAdmin, async function(req, res) {
    try {
        await Admin.banUser(req.params.id);
        res.redirect('/admin');
    } catch(err) {
        console.error(err.message);
        res.status(500).send('Error banning user');
    }
});

// Admin unban user
app.post("/admin/unban/:id", requireAdmin, async function(req, res) {
    try {
        await Admin.unbanUser(req.params.id);
        res.redirect('/admin');
    } catch(err) {
        console.error(err.message);
        res.status(500).send('Error unbanning user');
    }
});

// =====================
// USER PROFILE EDIT
// =====================

app.get("/profile/edit", async function(req, res) {
    if (!req.session.loggedIn) return res.redirect('/login');
    try {
        var sql = "SELECT * FROM users WHERE userID = ?";
        var result = await db.query(sql, [req.session.uid]);
        res.render('profile-edit', { user: result[0] });
    } catch(err) {
        console.error(err.message);
        res.status(500).send('Error loading profile');
    }
});

app.post("/profile/edit", upload.single('profilePic'), async function(req, res) {
    if (!req.session.loggedIn) return res.redirect('/login');
    try {
        var params = req.body;
        if (req.file) {
            var picURL = '/uploads/' + req.file.filename;
            var sql = "UPDATE users SET username = ?, location = ?, profilePic = ? WHERE userID = ?";
            await db.query(sql, [params.username, params.location, picURL, req.session.uid]);
        } else {
            var sql = "UPDATE users SET username = ?, location = ? WHERE userID = ?";
            await db.query(sql, [params.username, params.location, req.session.uid]);
        }
        res.redirect('/users/' + req.session.uid);
    } catch(err) {
        console.error(err.message);
        res.status(500).send('Error updating profile');
    }
});

// =====================
// FORGOT PASSWORD
// =====================

app.get("/forgot-password", function(req, res) {
    res.render('forgot-password');
});

app.post("/forgot-password", async function(req, res) {
    try {
        var params = req.body;
        var sql = "SELECT userID FROM users WHERE email = ?";
        var result = await db.query(sql, [params.email]);
        if (result.length === 0) {
            return res.render('forgot-password', { error: 'Email not found' });
        }
        const bcrypt = require('bcryptjs');
        var pw = await bcrypt.hash(params.newPassword, 10);
        var updateSql = "UPDATE users SET passwordHash = ? WHERE email = ?";
        await db.query(updateSql, [pw, params.email]);
        res.render('forgot-password', { success: 'Password reset successfully. You can now login.' });
    } catch(err) {
        console.error(err.message);
        res.status(500).send('Error resetting password');
    }
});

// Register with points
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
            // Award 20 points for registering
            await Points.addPoints(user.id, 20);
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
            // Check if banned
            var banCheck = await db.query("SELECT isBanned, isAdmin FROM users WHERE userID = ?", [uId]);
            if (banCheck[0].isBanned === 1) {
                return res.send('Your account has been banned. Contact an administrator.');
            }
            var match = await user.authenticate(params.password);
            if (match) {
                req.session.uid = uId;
                req.session.loggedIn = true;
                req.session.isAdmin = banCheck[0].isAdmin === 1;
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