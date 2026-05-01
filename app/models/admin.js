const db = require('../services/db');

class Admin {
    static async isAdmin(userID) {
        var sql = "SELECT isAdmin FROM users WHERE userID = ?";
        const result = await db.query(sql, [userID]);
        return result.length > 0 && result[0].isAdmin === 1;
    }

    static async getAllReports() {
        var sql = `SELECT reports.*, listings.title AS listingTitle, 
                   u1.username AS reporterName, u2.username AS ownerName,
                   listings.userID AS ownerID
                   FROM reports 
                   JOIN listings ON reports.listingID = listings.listingID 
                   JOIN users u1 ON reports.userID = u1.userID
                   JOIN users u2 ON listings.userID = u2.userID
                   ORDER BY reports.createdAt DESC`;
        return await db.query(sql);
    }

    static async getAllUsers() {
        var sql = `SELECT users.*, 
                   (SELECT COUNT(*) FROM listings WHERE listings.userID = users.userID) AS listingCount,
                   (SELECT COUNT(*) FROM reports WHERE reports.userID = users.userID) AS reportCount
                   FROM users ORDER BY users.createdAt DESC`;
        return await db.query(sql);
    }

    static async removeListing(listingID) {
        var sql = "DELETE FROM listings WHERE listingID = ?";
        return await db.query(sql, [listingID]);
    }

    static async banUser(userID) {
        var sql = "UPDATE users SET isBanned = 1 WHERE userID = ?";
        return await db.query(sql, [userID]);
    }

    static async unbanUser(userID) {
        var sql = "UPDATE users SET isBanned = 0 WHERE userID = ?";
        return await db.query(sql, [userID]);
    }

    static async updateReportStatus(reportID, status) {
        var sql = "UPDATE reports SET status = ? WHERE reportID = ?";
        return await db.query(sql, [status, reportID]);
    }
}

module.exports = { Admin };