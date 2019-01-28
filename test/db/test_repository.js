const Client = require('../../src/db/Client');
const { generateId, Auth, User, Meetup, ServiceTimepad, ServiceVK } = require('../../src/core/models');
const {assert} = require('chai');

/**
 * @returns {Client}
 */
async function initialize()
{
    const client = new Client('postgres://meetup12ru:1234@localhost:15432/meetup12ru');
    await client.initialize({quiet: true});
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

class DeferContext
{
    constructor()
    {
        this.deferred = [];
    }

    defer(cb)
    {
        this.deferred.unshift(cb);
    }

    async end()
    {
        for (let cb of this.deferred)
        {
            await cb();
        }
    }
}

function wrap(cb)
{
    return async () => {
        const c = await initialize();
        try
        {
            const r = await c.connect();
            const dc = new DeferContext();
            try
            {
                await cb(r, dc);
            }
            finally
            {
                await dc.end();
            }
        }
        finally
        {
            await c.end();
        }
    };
}

describe('meetup', () => {
    it('can be stored and then be found', wrap(async (r, dc) => {
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
        dc.defer(() => r.deleteMeetup(expected.id));

        const meetups = await r.findMeetups();
        const actual = findById(meetups, expected.id);
        assert.deepEqual(expected, actual);
    }));

    it('can be updated', wrap(async (r, dc) => {
        // Add one extra meetup to test if find does correct search.
        {
            let id = generateId();
            await r.storeMeetup(new Meetup({
                id: id,
                createdAt: new Date("2011-03-25"),
                serviceId: ServiceVK,
                eventId: generateId(),
                title: "Should never be found",
                description: "Should never be found",
                startDate: new Date("2011-04-25"),
                address: "ul. Pushkina"
            }));
            dc.defer(() => r.deleteMeetup(id));
        }

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
        dc.defer(() => r.deleteMeetup(expected.id));

        expected.title = "New Meetup Title";
        await r.storeMeetup(expected);
        expected.createdAt = new Date("2015-03-30");
        expected.eventId = "1248412";
        expected.serviceId = ServiceVK;
        expected.description = "New Description";
        expected.startDate = new Date("2015-04-21");
        expected.address = "nowhere";
        await r.storeMeetup(expected);
        const meetups = await r.findMeetups();
        const actual = findById(meetups, expected.id);
        assert.deepEqual(expected, actual);
    }));
});

describe('user', () => {
    it('can be stored and then be found', wrap(async (r, dc) => {
        const profileId = "94712472147";
        const expected = new User({
            id: generateId(),
            createdAt: new Date("2017-01-25"),
            name: "Vasyanchik",
            photoUrl: "http://vk.com/photoproto",
        });
        expected.authorize({
            id: generateId(),
            createdAt: new Date("2018-03-25"),
            serviceId: ServiceVK,
            profileId: profileId,
            name: "Vasyan",
            photoUrl: "http://vk.com/photoblevota",
        });

        await r.storeUser(expected);
        dc.defer(() => r.deleteUser(expected));

        const actual = await r.findUserWithAuth(ServiceVK, profileId);
        assert.deepEqual(expected, actual);
    }));
});
