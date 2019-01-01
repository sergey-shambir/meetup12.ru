const nconf = require('nconf');
const path = require('path');

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
}

module.exports = Config;
