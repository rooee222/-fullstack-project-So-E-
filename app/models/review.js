const db = require('../services/db');

class Review {
    static async addReview(listingID, reviewerID, rating, comment) {
        var checkSql = "SELECT reviewID FROM reviews WHERE listingID = ? AND reviewerID = ?";
        const existing = await db.query(checkSql, [listingID, reviewerID]);
        if (existing.length > 0) {
            return false;
        }
        var sql = "INSERT INTO reviews (listingID, reviewerID, rating, comment) VALUES (?, ?, ?, ?)";
        const result = await db.query(sql, [listingID, reviewerID, rating, comment]);

        // Award 5 points for leaving a review
        await db.query("UPDATE users SET points = points + 5 WHERE userID = ?", [reviewerID]);

        return result.insertId;
    }

    static async getReviewsForListing(listingID) {
        var sql = `SELECT reviews.*, users.username 
                   FROM reviews 
                   JOIN users ON reviews.reviewerID = users.userID 
                   WHERE reviews.listingID = ? 
                   ORDER BY reviews.createdAt DESC`;
        return await db.query(sql, [listingID]);
    }

    static async getAverageRating(listingID) {
        var sql = "SELECT AVG(rating) AS avgRating, COUNT(*) AS totalReviews FROM reviews WHERE listingID = ?";
        const result = await db.query(sql, [listingID]);
        return result[0];
    }

    static async getUserAverageRating(userID) {
        var sql = `SELECT AVG(reviews.rating) AS avgRating, COUNT(*) AS totalReviews 
                   FROM reviews 
                   JOIN listings ON reviews.listingID = listings.listingID 
                   WHERE listings.userID = ?`;
        const result = await db.query(sql, [userID]);
        return result[0];
    }
}

module.exports = { Review };