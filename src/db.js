const pg = require('pg');
const path = require('path');
const { Repository } = require('./repository');
const { logValues } = require('./logging');

const migrateDatabase = require('sql-migrations').migrate;
const PostgresAdapter = require('sql-migrations/adapters/pg');

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
        this._dsnString = dsnString;
        this._dsn = parsePostgresDSN(dsnString);
    }

    /**
     * @returns Promise<void>
     */
    async connect()
    {
        // setup database before first use
        const config = {
            migrationsDir: path.resolve(__dirname, '..', 'data/migrations'),
            adapter: 'pg',
            host: this._dsn.host,
            db: this._dsn.database,
            user: this._dsn.username,
            password: this._dsn.password,
        };
        const logger = {
            log: () => {},
            error: (...args) => { logValues('error', ...args) },
        };
        const adapter = new PostgresAdapter(config, logger);
        await migrateDatabase(config, adapter);

        console.log("this._dsnString", this._dsnString)
        this._client = new pg.Client(this._dsnString);
        console.log("finished new pg.Client")
        await this._client.connect();
        console.log("finished .connect()")
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
