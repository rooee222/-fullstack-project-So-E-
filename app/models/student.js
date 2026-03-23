const db = require('./../services/db');

class Student {
    id;
    name;
    programme;
    modules = [];

    constructor(id) {
        this.id = id;
    }

    async getStudentName() {
        if (typeof this.name !== 'string') {
            var sql = "SELECT * from Students where id = ?"
            const results = await db.query(sql, [this.id]);
            this.name = results[0].name;
        }
    }

    async getStudentProgramme() {
    }

    async getStudentModules() {
    }
}

module.exports = { Student }