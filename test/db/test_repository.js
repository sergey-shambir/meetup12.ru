const db = require('../../src/db/db');
const { generateId, Auth, User, Meetup, ServiceTimepad } = require('../../src/core/models');
const {assert} = require('chai');

/**
 * @returns {db.Client}
 */
async function connect() {
    const client = new db.Client('postgres://meetup12ru:1234@localhost:15432/meetup12ru');
    await client.connect();
    return client;
}

/**
 * @param {!Array<Object>} values
 * @param {string} id
 * @return {!Object}
 */
function findById(values, id)
{
    const value = values.find((value) => {
        return value.id == id
    });
    if (!value)
    {
        throw new Error(`cannot find value by id="${id}" in array=${JSON.stringify(values)}`);
    }
    return value;
}

describe('meetup', () => {
    it('can be stored and then be found', async () => {
        const c = await connect();
        try
        {
            const r = await c.repository();
            const expected = new Meetup({
                id: generateId(),
                createdAt: new Date("2015-03-25"),
                serviceId: ServiceTimepad,
                eventId: generateId(),
                title: "Meetup Title",
                description: "This is a meetup",
                startDate: new Date("2015-04-25"),
                address: "ul. Kirova, 2018"
            });
            await r.storeMeetup(expected);
            try
            {
                const meetups = await r.findMeetups();
                const actual = findById(meetups, expected.id);
                assert.deepEqual(expected, actual);
            }
            finally
            {
                await r.deleteMeetup(expected.id);
            }
        }
        finally
        {
            c.end();
        }
    });
});
