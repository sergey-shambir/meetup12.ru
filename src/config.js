const nconf = require('nconf');
const os = require('os');

nconf.defaults({
    'SITE_PORT': '3000',
});

nconf.env();
nconf.argv();

class Config
{
    static port()
    {
        const portStr = nconf.get('SITE_PORT');
        const port = parseInt(portStr, 10);
        if (isNaN(port))
        {
            throw new Error(`invalid port: ${portStr}`);
        }
        return port;
    }

    static siteHost()
    {
        let siteHost = nconf.get('SITE_URL');
        if (!siteHost)
        {
            siteHost = 'localhost';
        }
        return siteHost;
    }

    static sessionSecret()
    {
        const secret = nconf.get('SITE_SESSION_SECRET');
        if (!secret)
        {
            throw new Error("session secret not set");
        }
        return secret;
    }

    // Returns string in format 'postgres://username:password@host/database'
    static dsn()
    {
        return '' + nconf.get('SITE_DSN');
    }

    /**
     * @returns {{ clientID: string, clientSecret: string }}
     */
    static vkAppInfo()
    {
        const clientID = nconf.get('SITE_VK_APP_ID');
        const clientSecret = nconf.get('SITE_VK_APP_SECRET');
        if (!clientID || !clientSecret)
        {
            return null;
        }
        return {
            clientID: String(clientID),
            clientSecret: String(clientSecret)
        };
    }
}

module.exports = Config;
