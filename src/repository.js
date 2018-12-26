const { Client } = require('pg');

class Repository
{
    /**
     * @param {!Client} db 
     */
    constructor(db)
    {
        this.db = db;
    }
}

module.exports.Repository = Repository;
