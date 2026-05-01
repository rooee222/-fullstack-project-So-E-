const db = require('../services/db');

class Points {
    static async getPoints(userID) {
        var sql = "SELECT points FROM users WHERE userID = ?";
        const result = await db.query(sql, [userID]);
        return result[0] ? result[0].points : 0;
    }

    static async addPoints(userID, amount) {
        var sql = "UPDATE users SET points = points + ? WHERE userID = ?";
        return await db.query(sql, [amount, userID]);
    }

    static async getLeaderboard() {
        var sql = "SELECT userID, username, points FROM users ORDER BY points DESC LIMIT 10";
        return await db.query(sql);
    }

    // Award points for different actions
    static async awardForListing(userID) {
        return await Points.addPoints(userID, 10); // 10 points for posting
    }

    static async awardForMessage(userID) {
        return await Points.addPoints(userID, 2); // 2 points for messaging
    }

    static async awardForReview(userID) {
        return await Points.addPoints(userID, 5); // 5 points for reviewing
    }
}

module.exports = { Points };