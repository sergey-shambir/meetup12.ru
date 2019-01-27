const db = require('../../src/db/db');
const { generateId, Auth, User, Meetup, ServiceTimepad, ServiceVK } = require('../../src/core/models');
const {assert} = require('chai');

/**
 * @returns {db.Client}
 */
async function connect()
{
    const client = new db.Client('postgres://meetup12ru:1234@localhost:15432/meetup12ru');
    await client.connect({quiet: true});
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
        this.deferred.push(cb);
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
        const dc = new DeferContext();
        const c = await connect();
        try
        {
            const r = c.repository();
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
            c.end();
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

describe('auth', () => {
    it('can be stored and then be found', wrap(async (r, dc) => {
        const expected = new Auth({
            id: generateId(),
            createdAt: new Date("2018-03-25"),
            serviceId: ServiceVK,
            profileId: "94712472147",
            name: "Vasyan",
            photoUrl: "http://vk.com/photo124824742312",
        });
        await r.storeAuth(expected);
        dc.defer(() => r.deleteAuth(expected.id));
        const actual = await r.findAuth(ServiceVK, "94712472147");
        assert.deepEqual(expected, actual);
    }));

    it('can be updated', wrap(async (r, dc) => {
        const expected = new Auth({
            id: generateId(),
            createdAt: new Date("2018-03-25"),
            serviceId: ServiceVK,
            profileId: "94712472147",
            name: "Vasyan",
            photoUrl: "http://vk.com/photo124824742312",
        });
        await r.storeAuth(expected);
        dc.defer(() => r.deleteAuth(expected.id));

        expected.createdAt = new Date("2017-03-25");
        expected.name = "Petr";
        expected.photoUrl = "http:/example.com/pic.png";
        await r.storeAuth(expected);

        const actual = await r.findAuth(ServiceVK, "94712472147");
        assert.deepEqual(expected, actual);
    }));
});

/*
describe('user', () => {
    it('can be stored and then be found', async () => {
        const c = await connect();
        try
        {
            const r = await c.repository();
            const auth = new Auth({
                id: generateId(),
                createdAt: new Date("2018-03-25"),
                serviceId: ServiceVK,
                profileId: "94712472147",
                name: "Vasyan",
                photoUrl: "http://vk.com/photo124824742312",
            });
            await r.storeAuth(auth);

            const expected = new User({
                id: generateId(),
                createdAt: new Date("2017-01-25"),
                primaryAuthId: auth.id,
            });
            await r.storeUser(expected);

            try
            {
                const actual = await r.findUserWithAuth();
                assert.deepEqual(expected, actual);
            }
            finally
            {
                await r.deleteAuth(expected.id);
            }
        }
        finally
        {
            c.end();
        }
    });
});
*/
