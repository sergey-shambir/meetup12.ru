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
    res.on('finish', () => {
        const end = performance.now();
        const isError = (res.statusCode >= 400);
        logger.log(
            isError ? 'error' : 'info',
            isError ? 'request failed' : 'request succeed',
            {
                url: url,
                status: res.statusCode,
                duration: (end - start).toFixed(0) + 'ms',
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
    const argsStr = args.map((arg) => { return JSON.stringify(arg); }).join(' ');
    this.logger.log(
        level,
        argsStr
    );
}

module.exports.logger = logger;
module.exports.logValues = logValues;
module.exports.logResponse = logResponse;
