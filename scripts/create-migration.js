const path = require('path');
const sqlmigrations = require('sql-migrations');

if (process.argv[2] != 'create' || !process.argv[3])
{
    console.error("usage: npm run create-migration <name>")
    process.exit(1)
}

sqlmigrations.run({
    migrationsDir: path.resolve(__dirname, '..', 'data/migrations'),
    adapter: 'pg'
});
