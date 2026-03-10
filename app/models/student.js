// Get the functions in the db.js file to use
const db = require('./../services/db');
const { Programme } = require('./programme');
const { Module } = require('./module');

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
        if (typeof this.programme === 'undefined') {
            var sql = "SELECT * from Student_Programme where id = ?"
            const results = await db.query(sql, [this.id]);
            this.programme = new Programme(results[0].programme);
            await this.programme.getProgrammeName();
        }
    }
    
    async getStudentModules() {
        if (this.modules.length === 0) {
            var sql = "SELECT * from Programme_Modules where programme = ?"
            const results = await db.query(sql, [this.programme.id]);
            for (var row of results) {
                var module = new Module(row.module);
                await module.getModuleName();
                this.modules.push(module);
            }
        }
    }
}

module.exports = {
    Student
}