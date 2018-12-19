const nconf = require('nconf');
const path = require('path')

nconf.env();
nconf.argv();
nconf.file(path.join(__dirname, '..', 'config.json'));

nconf.defaults({
    'port': 3000,
});

/**
 * Returns config value by key
 * @param {string} key
 */
function get(key)
{
    return nconf.get(key);
}

module.exports.get = get
