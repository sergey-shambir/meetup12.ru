const passport = require('passport');
const AuthStrategyVK = require('passport-vkontakte').Strategy;
const AuthStrategyMeetup = require('passport-meetup').Strategy;
const AuthStrategyYandex = require('passport-yandex').Strategy;

const config = require('../core/config');
const Client = require('../db/Client');
const Repository = require('../db/Repository');
const {
    ServiceVK,
    ServiceMeetup,
    ServiceTimepad,
    ServiceYandex,
    Auth,
    User
 } = require('../core/models');
const AuthRouter = require('./AuthRouter');

class AuthService
{
    /**
     * @param {Client} client
     */
    constructor(client)
    {
        this.client = client;
    }

    /**
     * Returns list of auth service IDs.
     */
    serviceIds()
    {
        return [ServiceVK, ServiceMeetup, ServiceTimepad, ServiceYandex];
    }

    /**
     * Initalizes passport.js strategies.
     * @param {AuthRouter} router
     */
    use(router)
    {
        let vkAppInfo = config.vkAppInfo();
        if (vkAppInfo)
        {
            passport.use(ServiceVK, new AuthStrategyVK({
                clientID: vkAppInfo.clientID,
                clientSecret: vkAppInfo.clientSecret,
                callbackURL: router.callbackURL(ServiceVK),
            }, (accessToken, refreshToken, profile, done) => {
                this._verify(profile, done);
            }));
        }
        let meetupAppInfo = config.meetupAppInfo();
        if (meetupAppInfo)
        {
            passport.use(ServiceMeetup, new AuthStrategyMeetup({
                consumerKey: meetupAppInfo.consumerKey,
                consumerSecret: meetupAppInfo.consumerSecret,
                callbackURL: router.callbackURL(ServiceMeetup),
            }, (accessToken, refreshToken, profile, done) => {
                this._verify(profile, done);
            }));
        }
        let yandexAppInfo = config.yandexAppInfo();
        if (yandexAppInfo)
        {
            passport.use(ServiceYandex, new AuthStrategyYandex({
                clientID: yandexAppInfo.clientID,
                clientSecret: yandexAppInfo.clientSecret,
                callbackURL: router.callbackURL(ServiceYandex),
            }, (accessToken, refreshToken, profile, done) => {
                this._verify(profile, done);
            }));
        }
    }

    /**
     * @param {passport.Profile} profile 
     * @param {function} done 
     */
    async _verify(profile, done)
    {
        try
        {
            const conn = await this.client.connect();
            try
            {
                const user = await this._authorize(profile, conn.repository());
                done(null, user);
            }
            finally
            {
                await conn.release();
            }
        }
        catch (err)
        {
            done(err);
        }
    }

    /**
     * @param {passport.Profile} profile
     * @param {Repository} repo
     * @returns Promise<User> 
     */
    async _authorize(profile, repo)
    {
        const profileId = profile.id;
        const serviceId = profile.provider;

        let user = await repo.findUserWithAuth(serviceId, profileId);
        if (!user)
        {
            const createdAt = new Date();
            const name = profile.displayName;
            const photoUrl = profile.photos[0];
            user = new User({
                id: generateId(),
                createdAt: createdAt,
                name: name,
                photoUrl: photoUrl,
            });
            user.authorize(new Auth({
                id: generateId(),
                createdAt: createdAt,
                name: name,
                photoUrl: photoUrl,
                profileId: profileId,
                serviceId: serviceId,
            }));

            await repo.storeUser(user);
        }
        return user;
    }
}

module.exports = AuthService;
