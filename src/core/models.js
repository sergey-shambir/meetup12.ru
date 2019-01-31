const uuidv1 = require('uuid/v1');

const ServiceVK = 'vk';
const ServiceMeetup = 'meetup';
const ServiceTimepad = 'timepad';
const ServiceYandex = 'yandex';

function generateId()
{
    /**
     * uuidv1 returns UUID which depends on current time, so it's
     * the best choice to maintain database without conflicts with old data
     */
    return uuidv1();
}

class Auth
{
    /**
     * @param {{
     *  id: string,
     *  createdAt: Date,
     *  userId: string,
     *  serviceId: string,
     *  profileId: string,
     *  name: string,
     *  photoUrl: string
     * }}
     */
    constructor({id, createdAt, userId, serviceId, profileId, name, photoUrl})
    {
        this.id = id;
        this.createdAt = createdAt;
        this.userId = userId;
        this.serviceId = serviceId;
        this.profileId = profileId;
        this.name = name;
        this.photoUrl = photoUrl;
    }
}

class User
{
    /**
     * @param {{
     *  id: string,
     *  createdAt: Date,
     *  name: string,
     *  photoUrl: string
     * }}
     */
    constructor({id, createdAt, name, photoUrl})
    {
        this.id = id;
        this.createdAt = createdAt;
        this.name = name;
        this.photoUrl = photoUrl;
        this.auths = {};
    }

    /**
     * @param {Auth} auth
     */
    authorize(auth)
    {
        if (auth.serviceId in this.auths)
        {
            throw new Error("cannot authorize twice on the same service");
        }
        auth.userId = this.id;
        this.auths[auth.serviceId] = auth;
    }

    /**
     * @param {string} serviceId
     * @return {?Auth}
     */
    getAuthForService(serviceId)
    {
        return this.auths[serviceId];
    }
}

class Meetup
{
    /**
     * @param {{
     *  id: string,
     *  createdAt: Date,
     *  serviceId: string,
     *  eventId: string,
     *  title: string,
     *  description: string,
     *  startDate: Date,
     *  address: string,
     * }}
     */
    constructor({id, createdAt, serviceId, eventId, title, description, startDate, address})
    {
        this.id = id;
        this.createdAt = createdAt;
        this.serviceId = serviceId;
        this.eventId = eventId;
        this.title = title;
        this.description = description;
        this.startDate = startDate;
        this.address = address;
    }
}

module.exports.ServiceVK = ServiceVK;
module.exports.ServiceMeetup = ServiceMeetup;
module.exports.ServiceTimepad = ServiceTimepad;
module.exports.ServiceYandex = ServiceYandex;
module.exports.generateId = generateId;
module.exports.Auth = Auth;
module.exports.User = User;
module.exports.Meetup = Meetup;
