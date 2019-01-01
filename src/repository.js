const { Client } = require('pg');
const { Auth, User } = require('./models');

class Repository
{
    /**
     * @param {!Client} db 
     */
    constructor(db)
    {
        this.db = db;
    }

    /**
     * @param {string} serviceId
     * @param {string} profileId
     */
    async findAuth(serviceId, profileId)
    {
        throw new Error('not implemented');
    }

    /**
     * 
     * @param {Auth} auth
     */
    async storeAuth(auth)
    {
        throw new Error('not implemented');
    }

    /**
     * @param {Auth} auth
     * @returns {User} 
     */
    async findUserWithAuth(auth)
    {
        throw new Error('not implemented');
    }

    /**
     * @param {User} user 
     */
    async storeUser(user)
    {
    }
}

module.exports.Repository = Repository;
