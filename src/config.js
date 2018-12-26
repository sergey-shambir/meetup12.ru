const nconf = require('nconf');
const path = require('path')

nconf.env();
nconf.argv();
nconf.file(path.join(__dirname, '..', 'config.json'));

nconf.defaults({
    'port': 3000,
});

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
        const value = '' + nconf.get('M12_DSN');
        return value.match(/postgress:\/\/\w+\:\w+\@\w+\/\w+/);
    }
}

module.exports = Config;
