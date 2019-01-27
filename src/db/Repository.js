const { Client } = require('pg');
const { Auth, User, Meetup } = require('../core/models');

class Repository
{
    /**
     * @param {!Client} client 
     */
    constructor(client)
    {
        this.client = client;
    }

    /**
     * @param {string} serviceId - auth service ID
     * @param {string} profileId - service-specific profile ID
     * @returns {Auth}
     */
    async findAuth(serviceId, profileId)
    {
        const res = await this.client.query('SELECT id, created, name, photo_url FROM auth WHERE service_id=$1 AND profile_id=$2', [serviceId, profileId]);
        const row = res.rows[0];
        return new Auth({
            id: row.id,
            createdAt: row.created,
            serviceId: serviceId,
            profileId: profileId,
            name: row.name,
            photoUrl: row.photo_url
        });
    }

    /**
     * @param {Auth} auth
     */
    async storeAuth(auth)
    {
        await this.client.query(
            'INSERT INTO "auth"("id", "created", "service_id", "profile_id", "name", "photo_url")'
            + ' VALUES ($1, $2, $3, $4, $5, $6)'
            + ' ON CONFLICT (id) DO UPDATE'
            + ' SET "id"="excluded"."id", "created"="excluded"."created", "service_id"="excluded"."service_id"'
            + ', "profile_id"="excluded"."profile_id", "name"="excluded"."name", "photo_url"="excluded"."photo_url"',
            [auth.id, auth.createdAt, auth.serviceId, auth.profileId, auth.name, auth.photoUrl]);
    }

    /**
     * @param {string} id
     */
    async deleteAuth(id)
    {
        await this.client.query('DELETE FROM "auth" WHERE "id" = $1', [id]);
    }

    /**
     * @param {string} userId - User.id
     * @returns {!Array<Auth>}
     */
    async getUserAuths(userId)
    {
        const res = await this.client.query(
            'SELECT "auth"."id", "auth"."created", "auth"."service_id", "auth"."profile_id", "auth"."name", "auth"."photo_url"'
            + ' FROM "auth" INNER JOIN "auth_ref" ON "auth"."id"="auth_ref"."auth_id"'
            + ' WHERE "auth_ref"."user_id"=$1',
            [userId]);
        const auths = [];
        for (let row of res.rows)
        {
            auths.push(new Auth({
                id: row.id,
                createdAt: row.created,
                serviceId: row.service_id,
                profileId: row.profile_id,
                name: row.name,
                photoUrl: row.photo_url
            }));
        }
        return auths;
    }

    /**
     * @param {string} userId - User.id
     * @param {string} authId - Auth.id
     */
    async addUserAuth(userId, authId)
    {
        await this.client.query(
            'INSERT INTO "auth_ref"("user_id", "auth_id")'
            + ' VALUES ($1, $2)',
            [userId, authId]);
    }

    /**
     * @param {Auth} auth
     * @returns {User} 
     */
    async findUserWithAuth(auth)
    {
        const res = await this.client.query(
            'SELECT "user"."id", "user"."created", "user"."primary_auth_id" FROM "user"'
            + ' INNER JOIN "auth_ref" ON "user.id"="auth_ref"."user_id" WHERE "auth_ref"."auth_id"=$1',
            [auth.id]);
        const row = res.rows[0];
        return new User({
            id: row.id,
            createdAt: row.created,
            primaryAuthId: row.primary_auth_id
        });
    }

    /**
     * @param {User} user
     */
    async storeUser(user)
    {
        await this.client.query(
            'INSERT INTO "user"("id", "primary_auth_id")'
            + ' VALUES ($1, $3)'
            + ' ON CONFLICT (id) DO UPDATE'
            + ' SET "primary_auth_id"="excluded"."primary_auth_id"',
            [user.id, user.primaryAuthId]);
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
        let query = 'SELECT "id", "created", "service_id", "event_id", "title", "description", "start_date", "address" FROM "meetup"';
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
        await this.client.query(
            'INSERT INTO "meetup"("id", "created", "service_id", "event_id", "title", "description", "start_date", "address")'
            + ' VALUES ($1, $2, $3, $4, $5, $6, $7, $8)'
            + ' ON CONFLICT (id) DO UPDATE'
            + ' SET "created"="excluded"."created", "service_id"="excluded"."service_id", "event_id"="excluded"."event_id"'
            + ', "title"="excluded"."title", "description"="excluded"."description", "start_date"="excluded"."start_date"'
            + ', "address"="excluded"."address"',
            [meetup.id, meetup.createdAt, meetup.serviceId, meetup.eventId, meetup.title, meetup.description, meetup.startDate, meetup.address]);
    }

    /**
     * @param {string} id
     */
    async deleteMeetup(id)
    {
        await this.client.query('DELETE FROM "meetup" WHERE "id" = $1', [id]);
    }
}

module.exports = Repository;
