const passport = require('passport');
const AuthStrategyVK = require('passport-vkontakte').Strategy;
const AuthStrategyDev = require('passport-dev').Strategy;

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

const FakeDevAuthService = 'dev';

class AuthService
{
    /**
     * @param {repository.Repository} repo
     * @param {bool} isDevEnv - true if running in developer environment
     */
    constructor(repo, isDevEnv)
    {
        this._repo = repo;
        this._isDevEnv = isDevEnv;
    }

    /**
     * Returns list of auth service IDs.
     */
    serviceIds()
    {
        const ids = [AuthServiceVK, AuthServiceTimepad, AuthServiceYandex];
        if (this._isDevEnv)
        {
            ids.push(FakeDevAuthService);
        }
        return ids;
    }

    /**
     * Initalizes passport.js strategies.
     * @param {AuthRouter} router
     */
    use(router)
    {
        function use(serviceId, strategy) {
            passport.use(serviceId, strategy, (accessToken, refreshToken, profile, done) => {
                this._verify(profile, done);
            });
        }

        let vkAppInfo = config.vkAppInfo();
        if (vkAppInfo)
        {
            use(AuthServiceVK, new AuthStrategyVK({
                clientID: vkAppInfo.clientId,
                clientSecret: vkAppInfo.clientSecret,
                callbackURL: router.callbackURL(serviceId),
            }));
        }
        if (this._isDevEnv)
        {
            use(FakeDevAuthService, new AuthStrategyDev({
                name: 'vk',
                user: new Auth({
                    id: 0,
                    createdAt: new Date(),
                    serviceId: FakeDevAuthService,
                    profileId: "0",
                    name: 'Site Developer',
                    photoUrl: 'https://www.gravatar.com/avatar/205e460b479e2c5a48aec0f710c02d50',
                })
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
