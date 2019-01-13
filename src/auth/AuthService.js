const passport = require('passport');
const AuthStrategyVK = require('passport-vkontakte').Strategy;
const AuthStrategyMeetup = require('passport-meetup').Strategy;
const AuthStrategyYandex = require('passport-yandex').Strategy;

const config = require('../core/config');
const repository = require('../db/repository');
const {
    AuthServiceVK,
    AuthServiceMeetup,
    AuthServiceTimepad,
    AuthServiceYandex,
    Auth,
    User
 } = require('../db/models');
const AuthRouter = require('./AuthRouter');

class AuthService
{
    /**
     * @param {repository.Repository} repo
     */
    constructor(repo)
    {
        this._repo = repo;
    }

    /**
     * Returns list of auth service IDs.
     */
    serviceIds()
    {
        return [AuthServiceVK, AuthServiceMeetup, AuthServiceTimepad, AuthServiceYandex];
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
            passport.use(AuthServiceVK, new AuthStrategyVK({
                clientID: vkAppInfo.clientID,
                clientSecret: vkAppInfo.clientSecret,
                callbackURL: router.callbackURL(AuthServiceVK),
            }, (accessToken, refreshToken, profile, done) => {
                this._verify(profile, done);
            }));
        }
        let meetupAppInfo = config.meetupAppInfo();
        if (meetupAppInfo)
        {
            passport.use(AuthServiceMeetup, new AuthStrategyMeetup({
                consumerKey: meetupAppInfo.consumerKey,
                consumerSecret: meetupAppInfo.consumerSecret,
                callbackURL: router.callbackURL(AuthServiceMeetup),
            }, (accessToken, refreshToken, profile, done) => {
                this._verify(profile, done);
            }));
        }
        let yandexAppInfo = config.yandexAppInfo();
        if (yandexAppInfo)
        {
            passport.use(AuthServiceYandex, new AuthStrategyYandex({
                clientID: yandexAppInfo.clientID,
                clientSecret: yandexAppInfo.clientSecret,
                callbackURL: router.callbackURL(AuthServiceYandex),
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
