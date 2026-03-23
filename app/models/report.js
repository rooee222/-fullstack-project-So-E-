const db = require('../services/db');

class Report {
    static async createReport(listingID, userID, reason) {
        var checkSql = "SELECT reportID FROM reports WHERE listingID = ? AND userID = ?";
        const existing = await db.query(checkSql, [listingID, userID]);
        if (existing.length > 0) {
            return false;
        }
        var sql = "INSERT INTO reports (listingID, userID, reason) VALUES (?, ?, ?)";
        const result = await db.query(sql, [listingID, userID, reason]);
        return result.insertId;
    }

    static async getAllReports() {
        var sql = `SELECT reports.*, listings.title AS listingTitle, users.username 
                   FROM reports 
                   JOIN listings ON reports.listingID = listings.listingID 
                   JOIN users ON reports.userID = users.userID 
                   ORDER BY reports.createdAt DESC`;
        return await db.query(sql);
    }

    static async updateStatus(reportID, status) {
        var sql = "UPDATE reports SET status = ? WHERE reportID = ?";
        return await db.query(sql, [status, reportID]);
    }
}

module.exports = { Report };