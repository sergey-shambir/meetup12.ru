const uuidv1 = require('uuid/v1');

const AuthServiceVK = "vk";
const AuthServiceTimepad = "timepad";
const AuthServiceYandex = "yandex";

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
    constructor({id, created, serviceId, profileId, name, photoUrl})
    {
        this.id = id;
        /**
         * @property {Date}
         */
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
     *  createdAt: date
     * }}
     */
    constructor({id, createdAt})
    {
        this.id = id;
        /**
         * @property {Date}
         */
        this.created = createdAt;
        /**
         * @property {Auth}
         */
        this.vkAuth = null;
        /**
         * @property {Auth}
         */
        this.timepadAuth = null;
        /**
         * @property {Auth}
         */
        this.yandexAuth = null;
    }
}

module.exports.AuthServiceVK = AuthServiceVK;
module.exports.AuthServiceTimepad = AuthServiceTimepad;
module.exports.AuthServiceYandex = AuthServiceYandex;
module.exports.generateId = generateId;
module.exports.Auth = Auth;
module.exports.User = User;
