const pg = require('pg');
const path = require('path');
const Repository = require('./Repository');
const { logger } = require('../core/logging');

const sql_migrations = require('sql-migrations');
const PostgresAdapter = require('sql-migrations/adapters/pg');

const migrateDatabase = sql_migrations.migrate;
sql_migrations.setLogger({
    log: () => {}
});

/**
 * Parses string like 'postgres://user:password@host/database'
 * @param {string} dsn - Postgress Data Source Name string
 * @returns {{ user: string, password: string, host: string, database: string }}
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
        user: m[1],
        password: m[2],
        host: m[3],
        port: m[4],
        database: m[5],
    };
}

class Client
{
    /**
     * @param {string} dsn - connect string in format 'postgres://user:password@host/database'
     */
    constructor(dsnString)
    {
        this._dsnString = dsnString;
        this._dsn = parsePostgresDSN(dsnString);
    }

    /**
     * @returns {Promise<void>}
     */
    async initialize({quiet = false})
    {
        // setup database before first use
        const migrationConfig = Object.assign({
            migrationsDir: path.resolve(__dirname, '..', 'migrations'),
            adapter: 'pg',
            db: this._dsn.database,
        }, this._dsn);

        const migrationLogger = {
            log: (message) => {
                if (!quiet)
                {
                    if (typeof(message) == 'string' && !message.startsWith('='))
                    {
                        logger.log('info', message);
                    }
                }
            },
            error: (...args) => { logValues('error', ...args) },
        };
        const adapter = new PostgresAdapter(migrationConfig, migrationLogger);
        await migrateDatabase(migrationConfig, adapter);

        const poolConfig = Object.assign({
            connectionTimeoutMillis: 100,
        }, this._dsn);
        this.pool = new pg.Pool(poolConfig);
    }

    /**
     * @returns {Promise<Repository>}
     */
    async connect()
    {
        const client = await this.pool.connect();
        return new Repository(client);
    }

    /**
     * @returns {Promise<void>}
     */
    end()
    {
        return this.pool.end();
    }
}

module.exports = Client;
