const uuidv1 = require('uuid/v1');

const ServiceVK = 'vk';
const ServiceMeetup = 'meetup';
const ServiceTimepad = 'timepad';
const ServiceYandex = 'yandex';

function generateId()
{
    const id = uuidv1().replace('-', '');
    if (id.length != 32)
    {
        throw new Error('unexpected generated id: ' + id);
    }
    return id;
}

class Auth
{
    /**
     * @param {{
     *  id: string,
     *  createdAt: Date,
     *  serviceId: string,
     *  profileId: string,
     *  name: string,
     *  photoUrl: string
     * }}
     */
    constructor({id, createdAt, serviceId, profileId, name, photoUrl})
    {
        this.id = id;
        this.createdAt = createdAt;
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
     *  primaryAuthId: string
     * }}
     */
    constructor({id, createdAt, primaryAuthId})
    {
        this.id = id;
        this.createdAt = createdAt;
        this.primaryAuthId = primaryAuthId;
    }
}

class Event
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
module.exports.Event = Event;