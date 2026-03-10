const db = require('./../services/db');
const { Module } = require('./module');

class Programme {
    id;
    name;
    modules = [];

    constructor(id) {
        this.id = id;
    }

    async getProgrammeName() {
        if (typeof this.name !== 'string') {
            var sql = "SELECT * from Programmes where id = ?"
            const results = await db.query(sql, [this.id]);
            this.name = results[0].name;
        }
    }

    async getProgrammeModules() {
        if (this.modules.length === 0) {
            var sql = "SELECT * from Programme_Modules pm JOIN Modules m on m.code = pm.module WHERE programme = ?"
            const results = await db.query(sql, [this.id]);
            for (var row of results) {
                var module = new Module(row.code);
                module.name = row.name;
                this.modules.push(module);
            }
        }
    }
}

module.exports = {
    Programme
}