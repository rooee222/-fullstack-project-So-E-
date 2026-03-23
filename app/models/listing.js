const db = require('../services/db');

class Listing {
    id;
    title;
    description;
    category;
    imageURL;
    status;
    userID;
    username;
    createdAt;

    constructor(id) {
        this.id = id;
    }

    async getListingDetails() {
        var sql = "SELECT listings.*, users.username FROM listings JOIN users ON listings.userID = users.userID WHERE listings.listingID = ?";
        const result = await db.query(sql, [this.id]);
        if (result.length > 0) {
            this.title = result[0].title;
            this.description = result[0].description;
            this.category = result[0].category;
            this.imageURL = result[0].imageURL;
            this.status = result[0].status;
            this.userID = result[0].userID;
            this.username = result[0].username;
            this.createdAt = result[0].createdAt;
        }
    }

    static async getAllListings(search = '', category = '') {
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
        return await db.query(sql, params);
    }

    static async createListing(title, description, category, userID, imageURL) {
        var sql = "INSERT INTO listings (title, description, category, status, userID, imageURL) VALUES (?, ?, ?, 'active', ?, ?)";
        const result = await db.query(sql, [title, description, category, userID, imageURL]);
        return result.insertId;
    }
}

module.exports = { Listing };