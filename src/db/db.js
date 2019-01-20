const pg = require('pg');
const path = require('path');
const Repository = require('./Repository');
const { logger } = require('../core/logging');

const migrateDatabase = require('sql-migrations').migrate;
const PostgresAdapter = require('sql-migrations/adapters/pg');

/**
 * Parses string like 'postgres://username:password@host/database'
 * @param {string} dsn - Postgress Data Source Name string
 * @returns {{ username: string, password: string, host: string, database: string }}
 */
function parsePostgresDSN(dsn)
{
    const re = /^postgres:\/\/(\w+):(\w+)@([\w+\-]+):?(\d+)?\/(\w+)$/;
    const m = dsn.match(re);
    if (!m)
    {
        throw new Error("invalid postgres DSN: " + JSON.stringify(dsn));
    }
    return {
        username: m[1],
        password: m[2],
        host: m[3],
        port: m[4],
        database: m[5],
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
     * @returns {Promise<void>}
     */
    async connect()
    {
        // setup database before first use
        const config = {
            migrationsDir: path.resolve(__dirname, '..', 'migrations'),
            adapter: 'pg',
            host: this._dsn.host,
            port: this._dsn.port,
            db: this._dsn.database,
            user: this._dsn.username,
            password: this._dsn.password,
        };
        const migrationLogger = {
            log: (message) => {
                if (typeof(message) == 'string' && !message.startsWith('='))
                {
                    logger.log('info', message);
                }
            },
            error: (...args) => { logValues('error', ...args) },
        };
        const adapter = new PostgresAdapter(config, migrationLogger);
        await migrateDatabase(config, adapter);

        this._client = new pg.Client(this._dsnString);
        await this._client.connect();
    }

    /**
     * @returns {Promise<void>}
     */
    end()
    {
        return this._client.end();
    }

    /**
     * @returns {Repository}
     */
    repository()
    {
        return new Repository(this._client);
    }
}

module.exports.Client = Client;
