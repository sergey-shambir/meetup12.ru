const { Client } = require('pg');
const { Auth, User, Meetup } = require('../core/models');

class Repository
{
    /**
     * @param {!Client} client 
     */
    constructor(client)
    {
        //*
        this.client = client;
        /*/
        // Intercept and log queries.
        this.client = {
            query: (sql, values) => {
                const msg = `-------\n${sql}\n${JSON.stringify(values)}`;
                console.log(msg);
                return client.query(sql, values);
            }
        };
        //*/
    }

    /**
     * @param {string} serviceId - auth service ID
     * @param {string} profileId - service-specific profile ID
     * @returns {?User} 
     */
    async findUserWithAuth(serviceId, profileId)
    {
        const auth = await selectAuth(this.client, serviceId, profileId);
        if (auth !== undefined)
        {
            const user = await selectUserWithId(this.client, auth.userId);
            if (user === undefined)
            {
                return undefined;
            }
            for (let auth of await selectAuthsWithUserId(this.client, user.id))
            {
                user.authorize(auth);
            }
            return user;
        }
    }

    /**
     * @param {User} user
     * @return {Promise<void>}
     */
    async storeUser(user)
    {
        return await transaction(this.client, async () => {
            // Delete outdated auth objects
            for (let auth of await selectAuthsWithUserId(this.client, user.id))
            {
                if (user.getAuthForService(auth.serviceId).id != auth.id)
                {
                    await deleteAuthWithId(this.client, auth.id);
                }
            }

            // Upsert user and his/here auths
            await upsertUser(this.client, user);
            for (let service of Object.keys(user.auths))
            {
                await upsertAuth(this.client, user.getAuthForService(service));
            }
        });
    }

    /**
     * @param {User} user
     * @return {Promise<void>}
     */
    async deleteUser(user)
    {
        await deleteUserWithId(this.client, user.id);
    }

    /**
     * @param {{
     *  beforeDate: ?Date,
     *  afterDate: ?Date
     * }}
     * @returns {!Array<Meetup>}
     */
    async findMeetups({afterDate, beforeDate} = {})
    {
        let query = `
            SELECT
                "id", "created", "service_id", "event_id", "title", "description", "start_date", "address"
            FROM "meetup"`;
        const conditions = [];
        const values = [];
        if (afterDate)
        {
            conditions.push('"start_date">?');
            values.push(afterDate);
        }
        if (beforeDate)
        {
            conditions.push('"start_date"<?');
            values.push(beforeDate);
        }
        if (conditions.length > 0)
        {
            query += ' WHERE ' + conditions.join(' AND ');
        }
        const res = await this.client.query(query, values);
        const meetups = [];
        for (let row of res.rows)
        {
            meetups.push(new Meetup({
                id: row.id,
                createdAt: row.created,
                serviceId: row.service_id,
                eventId: row.event_id,
                title: row.title,
                description: row.description,
                startDate: row.start_date,
                address: row.address,
            }));
        }
        return meetups;
    }

    /**
     * @param {!Meetup} meetup
     */
    async storeMeetup(meetup)
    {
        await this.client.query(`
            INSERT INTO "meetup"
                ("id", "created", "service_id", "event_id", "title", "description", "start_date", "address")
            VALUES
                ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT (id)
            DO UPDATE SET
                "created"="excluded"."created",
                "service_id"="excluded"."service_id",
                "event_id"="excluded"."event_id",
                "title"="excluded"."title",
                "description"="excluded"."description",
                "start_date"="excluded"."start_date",
                "address"="excluded"."address"`,
            [meetup.id, meetup.createdAt, meetup.serviceId, meetup.eventId, meetup.title, meetup.description, meetup.startDate, meetup.address]);
    }

    /**
     * @param {Meetup} meetup
     */
    async deleteMeetup(meetup)
    {
        await deleteMeetupWithId(this.client, meetup.id);
    }
}

/**
 * @param {!Client} client
 * @param {Callable} cb
 */
async function transaction(client, cb)
{
    await client.query('BEGIN');
    try
    {
        await cb();
    }
    catch (err)
    {
        await client.query('ROLLBACK');
        throw err;
    }
    await client.query('COMMIT');
}

/**
 * @param {!Client} client
 * @param {string} userId - User.id
 * @returns {!Array<Auth>}
 */
async function selectAuthsWithUserId(client, userId)
{
    const res = await client.query(`
        SELECT
            "id",
            "created",
            "service_id",
            "profile_id",
            "name",
            "photo_url"
        FROM "auth"
        WHERE "user_id"=$1`,
        [userId]);
    const auths = [];
    for (let row of res.rows)
    {
        auths.push(new Auth({
            id: row.id,
            createdAt: row.created,
            userId: userId,
            serviceId: row.service_id,
            profileId: row.profile_id,
            name: row.name,
            photoUrl: row.photo_url
        }));
    }
    return auths;
}

/**
 * @param {!Client} client
 * @param {string} serviceId - auth service ID
 * @param {string} profileId - service-specific profile ID
 * @returns {Auth}
 */
async function selectAuth(client, serviceId, profileId)
{
    const res = await client.query(`
        SELECT "id", "created", "user_id", "name", "photo_url"
        FROM "auth"
        WHERE "service_id"=$1 AND "profile_id"=$2`,
        [serviceId, profileId]);
    const row = res.rows[0];
    if (row !== undefined)
    {
        return new Auth({
            id: row.id,
            createdAt: row.created,
            userId: row.user_id,
            serviceId: serviceId,
            profileId: profileId,
            name: row.name,
            photoUrl: row.photo_url
        });
    }
}

/**
 * @param {Client} client
 * @param {Auth} authI
 */
async function upsertAuth(client, auth)
{
    await client.query(`
        INSERT INTO "auth"
            ("id", "created", "user_id", "service_id", "profile_id", "name", "photo_url")
        VALUES
            ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id)
        DO UPDATE SET
            "id"="excluded"."id",
            "created"="excluded"."created",
            "user_id"="excluded"."user_id",
            "service_id"="excluded"."service_id",
            "profile_id"="excluded"."profile_id",
            "name"="excluded"."name",
            "photo_url"="excluded"."photo_url"`,
        [auth.id, auth.createdAt, auth.userId, auth.serviceId, auth.profileId, auth.name, auth.photoUrl]);
}

/**
 * @param {Client} client
 * @param {User} user
 */
async function upsertUser(client, user)
{
    await client.query(`
        INSERT INTO "user"
            ("id", "created", "name", "photo_url")
        VALUES
            ($1, $2, $3, $4)
        ON CONFLICT (id)
        DO UPDATE SET
            "name"="excluded"."name",
            "created"="excluded"."created",
            "photo_url"="excluded"."photo_url"`,
        [user.id, user.createdAt, user.name, user.photoUrl]);
}

/**
 * @param {Client} client
 * @param {string} userId 
 */
async function selectUserWithId(client, userId)
{
    const res = await client.query(`
        SELECT "created", "name", "photo_url"
        FROM "user"
        WHERE "id"=$1`,
        [userId]);
    const row = res.rows[0];
    if (row == undefined)
    {
        return undefined;
    }
    return new User({
        id: userId,
        createdAt: row.created,
        name: row.name,
        photoUrl: row.photo_url,
    });
}

/**
 * @param {Client} client
 * @param {string} authId
 */
async function deleteAuthWithId(client, authId)
{
    await client.query('DELETE FROM "auth" WHERE "id" = $1', [authId]);
}

/**
 * @param {Client} client
 * @param {string} userId
 */
async function deleteUserWithId(client, userId)
{
    await client.query('DELETE FROM "user" WHERE "id" = $1', [userId]);
}

/**
 * @param {Client} client
 * @param {string} meetupId
 */
async function deleteMeetupWithId(client, meetupId)
{
    await client.query('DELETE FROM "meetup" WHERE "id" = $1', [meetupId]);
}

module.exports = Repository;
