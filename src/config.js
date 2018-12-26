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
        return parseInt(nconf.get('port'), 10);
    }

    static sessionSecret()
    {
        return '' + nconf.get('session_secret')
    }

    // Returns string in format 'postgres://username:password@host/database'
    static dsn()
    {
        const value = '' + nconf.get('dsn');
        return value.match(/postgress:\/\/\w+\:\w+\@\w+\/\w+/);
    }
}

module.exports = Config;
