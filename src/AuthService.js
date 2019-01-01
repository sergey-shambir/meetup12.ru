const passport = require('passport');
const AuthStrategyVK = require('passport-vkontakte').Strategy;
const config = require('./config');
const repository = require('./repository');
const {
    AuthServiceVK,
    AuthServiceYandex,
    AuthServiceTimepad,
    Auth,
    User
 } = require('./models');
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
     * Initalizes passport.js strategies.
     * @param {AuthRouter} router
     */
    use(router)
    {
        function useService(serviceId, strategyClass, clientId, clientSecret) {
            passport.use(serviceId, new strategyClass({
                clientID: clientId,
                clientSecret: clientSecret,
                callbackURL: router.callbackURL(serviceId),
            }, (accessToken, refreshToken, profile, done) => {
                this._verify(profile, done);
            }));
        }

        let vkAppInfo = config.vkAppInfo();
        if (vkAppInfo)
        {
            useService(AuthServiceVK, AuthStrategyVK, vkAppInfo.clientId, vkAppInfo.clientSecret);
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
                });
                switch (serviceId)
                {
                case AuthServiceVK:
                    user.vkAuth = auth;
                    break;
                case AuthServiceTimepad:
                    user.timepadAuth = auth;
                    break;
                case AuthServiceYandex:
                    user.yandexAuth = auth;
                    break;
                }
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
