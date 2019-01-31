const pg = require('pg');
const Repository = require('./Repository');

class Connection
{
    /**
     * @param {pg.PoolClient} client 
     */
    constructor(client)
    {
        this.client = client;
    }

    /**
     * @return {Repository}
     */
    repository()
    {
        return new Repository(this.client);
    }

    /**
     * @return {Promise<void>}
     */
    release()
    {
        this.client.release();
    }
}

module.exports = Connection;
