const db = require('../services/db');

class Message {
    static async sendMessage(senderID, receiverID, listingID, content) {
        var sql = "INSERT INTO messages (senderID, receiverID, listingID, content) VALUES (?, ?, ?, ?)";
        const result = await db.query(sql, [senderID, receiverID, listingID, content]);
        return result.insertId;
    }

    static async getInbox(userID) {
        var sql = `SELECT messages.*, users.username AS senderName, listings.title AS listingTitle 
                   FROM messages 
                   JOIN users ON messages.senderID = users.userID 
                   LEFT JOIN listings ON messages.listingID = listings.listingID 
                   WHERE messages.receiverID = ? 
                   ORDER BY messages.createdAt DESC`;
        return await db.query(sql, [userID]);
    }

    static async getSent(userID) {
        var sql = `SELECT messages.*, users.username AS receiverName, listings.title AS listingTitle 
                   FROM messages 
                   JOIN users ON messages.receiverID = users.userID 
                   LEFT JOIN listings ON messages.listingID = listings.listingID 
                   WHERE messages.senderID = ? 
                   ORDER BY messages.createdAt DESC`;
        return await db.query(sql, [userID]);
    }

    static async getConversation(userID, otherUserID, listingID) {
        var sql = `SELECT messages.*, 
                   sender.username AS senderName, 
                   receiver.username AS receiverName 
                   FROM messages 
                   JOIN users AS sender ON messages.senderID = sender.userID 
                   JOIN users AS receiver ON messages.receiverID = receiver.userID 
                   WHERE messages.listingID = ? 
                   AND ((messages.senderID = ? AND messages.receiverID = ?) 
                   OR (messages.senderID = ? AND messages.receiverID = ?)) 
                   ORDER BY messages.createdAt ASC`;
        return await db.query(sql, [listingID, userID, otherUserID, otherUserID, userID]);
    }

    static async markAsRead(messageID, userID) {
        var sql = "UPDATE messages SET isRead = 1 WHERE messageID = ? AND receiverID = ?";
        return await db.query(sql, [messageID, userID]);
    }

    static async getUnreadCount(userID) {
        var sql = "SELECT COUNT(*) AS count FROM messages WHERE receiverID = ? AND isRead = 0";
        const result = await db.query(sql, [userID]);
        return result[0].count;
    }
}

module.exports = { Message };