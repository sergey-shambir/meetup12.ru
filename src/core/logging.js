const winston = require('winston');
const { performance } = require('perf_hooks');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.Console({
            stderrLevels: ['warn', 'error']
        }),
    ],
});

// Logs http server response status and stats.
function logResponse(req, res, next)
{
    const url = req.url;
    const start = performance.now();
    const ip = req.ip;
    const referer = req.headers.referer;
    const time = new Date().toUTCString();

    res.on('finish', () => {
        const end = performance.now();
        const hasError = (res.statusCode >= 400);
        logger.log(
            hasError ? 'error' : 'info',
            hasError ? 'request failed' : 'request succeed',
            {
                url: url,
                status: res.statusCode,
                duration: (end - start).toFixed(0) + 'ms',
                ip: ip,
                referer: referer,
                time: time
            }
        );
    });
    next();
}

/**
 * This function intended to replace `console.log`, `console.error`,
 *  it redirects any logging to winston.
 * @param {string} level - logging level, e.g. 'error'
 * @param  {...any} values - values to log
 */
function logValues(level, ...values)
{
    const valuesStr = values.map((arg) => { return JSON.stringify(arg); }).join(' ');
    logger.log(
        level,
        valuesStr
    );
}

module.exports.logger = logger;
module.exports.logValues = logValues;
module.exports.logResponse = logResponse;
