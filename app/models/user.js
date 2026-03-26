// User authentication with bcrypt and session management - Amrita
const db = require('../services/db');
const bcrypt = require('bcryptjs');

class User {
    id;
    email;

    constructor(email) {
        this.email = email;
    }

    async getIdFromEmail() {
        var sql = "SELECT userID FROM users WHERE email = ?";
        const result = await db.query(sql, [this.email]);
        if (JSON.stringify(result) != '[]') {
            this.id = result[0].userID;
            return this.id;
        } else {
            return false;
        }
    }

    async addUser(username, password) {
        const pw = await bcrypt.hash(password, 10);
        var sql = "INSERT INTO users (username, email, passwordHash) VALUES (?, ?, ?)";
        const result = await db.query(sql, [username, this.email, pw]);
        this.id = result.insertId;
        return true;
    }

    async authenticate(submitted) {
        var sql = "SELECT passwordHash FROM users WHERE userID = ?";
        const result = await db.query(sql, [this.id]);
        const match = await bcrypt.compare(submitted, result[0].passwordHash);
        return match;
    }
}

module.exports = { User };