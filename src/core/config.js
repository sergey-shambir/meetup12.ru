const nconf = require('nconf');
const path = require('path');
const fs = require('fs');

nconf.defaults({
    'SITE_PORT': '3000',
});

nconf.env();
nconf.argv();

const configPath = nconf.get('SITE_CONFIG');
if (configPath)
{
    nconf.file({ file: configPath})
}

class Config
{
    static portHttp()
    {
        const portStr = nconf.get('SITE_PORT_HTTP');
        const port = parseInt(portStr, 10);
        if (isNaN(port))
        {
            return null;
        }
        return port;
    }

    static portHttps()
    {
        const portStr = nconf.get('SITE_PORT_HTTPS');
        const port = parseInt(portStr, 10);
        if (isNaN(port))
        {
            return null;
        }
        return port;
    }

    static sslData()
    {
        const configDir = nconf.get('SITE_SSL_DATA_DIR');
        if (!configDir)
        {
            return null;
        }
        return {
            key: fs.readFileSync(path.join(configDir, 'privkey.pem'), 'utf8'),
            cert: fs.readFileSync(path.join(configDir, 'cert.pem'), 'utf8'),
            ca: fs.readFileSync(path.join(configDir, 'chain.pem'), 'utf8'),
        };
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
        const obj = nconf.get('vk_app');
        if (!obj)
        {
            return null;
        }
        return {
            clientID: obj['client_id'],
            clientSecret: obj['client_secret'],
        };
    }

    /**
     * @returns {{ consumerKey: string, consumerSecret: string }}
     */
    static meetupAppInfo()
    {
        const obj = nconf.get('meetup_app');
        if (!obj)
        {
            return null;
        }
        return {
            consumerKey: obj['client_id'],
            consumerSecret: obj['client_secret'],
        };
    }

    /**
     * @returns {{ clientID: string, clientSecret: string }}
     */
    static yandexAppInfo()
    {
        const obj = nconf.get('yandex_app');
        if (!obj)
        {
            return null;
        }
        return {
            clientID: obj['client_id'],
            clientSecret: obj['client_secret'],
        };
    }
}

module.exports = Config;
