const nconf = require('nconf');
const path = require('path');

nconf.defaults({
    'port': 3000,
});

nconf.env();
nconf.argv();

class Config
{
    static port()
    {
        return parseInt(nconf.get('M12_PORT'), 10);
    }

    static sessionSecret()
    {
        return '' + nconf.get('M12_SESSION_SECRET')
    }

    // Returns string in format 'postgres://username:password@host/database'
    static dsn()
    {
        return '' + nconf.get('SITE_DSN');
    }
}

module.exports = Config;
