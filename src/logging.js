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

function logResponse(req, res, next)
{
    const url = req.url;
    const start = performance.now();
    res.on('finish', () => {
        const end = performance.now();
        const isError = (res.statusMessage >= 400);
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

module.exports.logger = logger;
module.exports.logResponse = logResponse;
