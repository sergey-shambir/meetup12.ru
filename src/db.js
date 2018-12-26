const pg = require('pg');
const { Repository } = require('./repository');

const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);

const schemaPath = path.join(__dirname, 'schema', 'schema.sql');

class Client
{
    /**
     * @param {string} dsn - connect string in format 'postgres://username:password@host/database'
     */
    constructor(dsn)
    {
        this._client = new pg.Client(dsn);
    }

    /**
     * @returns Promise<void>
     */
    async connect()
    {
        await this._client.connect();

        // setup database before first use
        const schema = await readFile(schemaPath);
        await this.db.query(schema);
    }

    /**
     * @returns Promise<void>
     */
    end()
    {
        return this._client.end();
    }

    /**
     * @returns Repository
     */
    repository()
    {
        return new Repository(this._client);
    }
}

module.exports.Client = Client;
