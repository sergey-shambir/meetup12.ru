const passport = require('passport');
const AuthStrategyVK = require('passport-vkontakte').Strategy;
const AuthStrategyMeetup = require('passport-meetup').Strategy;
const AuthStrategyYandex = require('passport-yandex').Strategy;

const config = require('../core/config');
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
     * @param {Repository} repo
     */
    constructor(repo)
    {
        this.repo = repo;
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
            const profileId = profile.id;
            const serviceId = profile.provider;
    
            let auth = await this.repo.findAuth(serviceId, profileId);
            if (auth == null)
            {
                auth = new Auth({
                    id: generateId(),
                    createdAt: new Date(),
                    serviceId: serviceId,
                    profileId: profileId,
                    name: profile.displayName,
                    photoUrl: profile.photos[0],
                });
                await this.repo.storeAuth(auth);
            }
    
            let user = await this.repo.findUserWithAuth(auth);
            if (!user)
            {
                user = new User({
                    id: generateId(),
                    createdAt: new Date(),
                    primaryAuthId: auth.id,
                });
                await this.repo.storeUser(user);
            }
            done(null, user);
        }
        catch (err)
        {
            done(err);
        }
    }
}

module.exports = AuthService;
