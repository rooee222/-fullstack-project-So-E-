const db = require('../services/db');

class Recommendation {
    static async getRecommendations(userID) {
        // Find categories the user has interacted with (posted, messaged about)
        var categorySql = `
            SELECT DISTINCT category FROM listings WHERE userID = ?
            UNION
            SELECT DISTINCT l.category FROM messages m 
            JOIN listings l ON m.listingID = l.listingID 
            WHERE m.senderID = ?
        `;
        const categories = await db.query(categorySql, [userID, userID]);

        if (categories.length === 0) {
            // No history - return most recent listings
            var sql = `SELECT listings.*, users.username, 
                       (SELECT AVG(rating) FROM reviews WHERE reviews.listingID = listings.listingID) AS avgRating
                       FROM listings 
                       JOIN users ON listings.userID = users.userID 
                       WHERE listings.status = 'active' AND listings.userID != ?
                       ORDER BY listings.createdAt DESC LIMIT 6`;
            return await db.query(sql, [userID]);
        }

        var categoryList = categories.map(c => c.category);
        var placeholders = categoryList.map(() => '?').join(',');

        var sql = `SELECT listings.*, users.username,
                   (SELECT AVG(rating) FROM reviews WHERE reviews.listingID = listings.listingID) AS avgRating
                   FROM listings 
                   JOIN users ON listings.userID = users.userID 
                   WHERE listings.status = 'active' 
                   AND listings.userID != ?
                   AND listings.category IN (${placeholders})
                   ORDER BY listings.createdAt DESC LIMIT 6`;

        return await db.query(sql, [userID, ...categoryList]);
    }

    static async getSimilarListings(listingID, category) {
        var sql = `SELECT listings.*, users.username,
                   (SELECT AVG(rating) FROM reviews WHERE reviews.listingID = listings.listingID) AS avgRating
                   FROM listings 
                   JOIN users ON listings.userID = users.userID 
                   WHERE listings.status = 'active' 
                   AND listings.category = ? 
                   AND listings.listingID != ?
                   ORDER BY listings.createdAt DESC LIMIT 4`;
        return await db.query(sql, [category, listingID]);
    }
}

module.exports = { Recommendation };