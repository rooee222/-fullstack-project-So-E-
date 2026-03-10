const db = require('./../services/db');

class Module {
    code;
    name;

    constructor(code) {
        this.code = code;
    }

    async getModuleName() {
        if (typeof this.name !== 'string') {
            var sql = "SELECT * from Modules where code = ?"
            const results = await db.query(sql, [this.code]);
            this.name = results[0].name;
        }
    }
}

module.exports = {
    Module
}