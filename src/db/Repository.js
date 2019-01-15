const { Client } = require('pg');
const { Auth, User } = require('../core/models');

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
        const res = await client.query('SELECT id, created, name, photo_url FROM auth WHERE service_id=$1 profile_id=$2', [serviceId, profileId]);
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
     * @param {string} userId - User.id
     * @returns {!Array<Auth>}
     */
    async getUserAuths(userId)
    {
        // FIXME: use JOIN
        const res = await client.query('SELECT "auth"."id", "auth"."created", "auth"."service_id", "auth"."profile_id", "auth"."name", "auth"."photo_url" FROM "auth" INNER JOIN "auth_ref" ON "auth"."id"="auth_ref"."auth_id" WHERE "auth_ref"."user_id"=$1', [userId]);
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
     * @param {Auth} auth
     */
    async storeAuth(auth)
    {
        // FIXME: use ON CONFLICT UPDATE
        return await client.query('INSERT INTO "auth"("id", "service_id", "profile_id", "name", "photo_url") VALUES ($1, $2, $3, $4, $5)', [auth.id, auth.serviceId, auth.profileId, auth.name, auth.photoUrl]);
    }

    /**
     * @param {Auth} auth
     * @returns {User} 
     */
    async findUserWithAuth(auth)
    {
        const res = await client.query('SELECT "user"."id", "user"."created", "user"."primary_auth_id" FROM "user" INNER JOIN "auth_ref" ON "user.id"="auth_ref"."user_id" WHERE "auth_ref"."auth_id"=$1', [auth.id]);
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
        // FIXME: use ON CONFLICT UPDATE
        return await client.query('INSERT INTO "user"("id", "primary_auth_id") VALUES ($1, $3)', [user.id, user.primaryAuthId]);
    }

    /**
     * @param {{
     *  beforeDate: ?Date,
     *  afterDate: ?Date
     * }}
     */
    async findEvents({beforeDate, afterDate})
    {
        // FIXME: finish me
        let query = 'SELECT "id", "created", "service_id", "event_id", "title", "description", "start_date", "address" FROM "event"';
        function addCondition() {
            
        }

        if (beforeDate)
        {
            query += ' WHERE before';
        }
    }

    // TODO: async storeEvent(event)
}

module.exports = Repository;
