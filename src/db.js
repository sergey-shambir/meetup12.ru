const pg = require('pg');
const sqlmigrations = require('sql-migrations');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const { Repository } = require('./repository');
const { logValues } = require('./logging');

const readFile = promisify(fs.readFile);

const schemaPath = path.join(__dirname, 'schema', 'schema.sql');

// Disable info logging in sqlmigrations library
sqlmigrations.setLogger({
    log: () => {},
    error: (...args) => { logValues('error', ...args) },
});

/**
 * Parses string like 'postgres://username:password@host/database'
 * @param {string} dsn - Postgress Data Source Name string
 * @returns {{ username: string, password: string, host: string, database: string }}
 */
function parsePostgresDSN(dsn)
{
    const re = /^postgres:\/\/(\w+):(\w+)@([\w+\-]+)\/(\w+)$/;
    const m = dsn.match(re);
    if (!m)
    {
        throw new Error("invalid postgres DSN: " + JSON.stringify(dsn));
    }
    return {
        username: m[1],
        password: m[2],
        host: m[3],
        database: m[4],
    };
}

class Client
{
    /**
     * @param {string} dsn - connect string in format 'postgres://username:password@host/database'
     */
    constructor(dsnString)
    {
        this._dsn = parsePostgresDSN(dsnString);
        this._client = new pg.Client(dsnString);
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

        sqlmigrations.migrate({
            migrationsDir: path.resolve(__dirname, '..', 'data/migrations'),
            adapter: 'pg',
            host: this._dsn.host,
            db: this._dsn.database,
            username: this._dsn.username,
            password: this._dsn.password,
        });
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
