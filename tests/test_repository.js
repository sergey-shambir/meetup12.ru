const db = require('../src/db/db');
const Repository = require('../src/db/Repository');

/**
 * @returns {Repository}
 */
async function connect() {
    const client = new db.Client('postgres://postgres:1234@meetup12ru-test-db/meetup12ru');
    await client.connect();
    return client.repository();
}

it.describe("", () => {
});
