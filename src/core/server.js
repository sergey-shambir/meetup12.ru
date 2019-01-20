const http = require('http');
const https = require('https');
const waitForPromise = require('wait-for-promise');
const logging = require('./logging');

class Server
{
    /**
     * @param {Function} router - Express.js router
     */
    constructor(router)
    {
        this._router = router;
        this._preListenActions = [];
        this._postListenActions = [];
        this._server = null;
    }

    /**
     * @param {Function} action - async function that must be called before listen
     */
    preListenAction(action)
    {
        this._preListenActions.push(action);
    }

    /**
     * @param {Function} action - async function that must be called after listen
     */
    postListenAction(action)
    {
        this._postListenActions.push(action);
    }

    /**
     * @param {number} httpPort - http server port, e.g. 80
     * @param {?number} httpsPort - http server port, e.g. 443
     * @param {?Object} sslData - ssl options for https package
     */
    runSync(httpPort, httpsPort, sslData)
    {
        this._runActions(this._preListenActions);
        let serverHttp = http.createServer(this._router).listen(httpPort, () => {
            logging.logger.info(`started listening http requests on ${httpPort}`);
        });
        let serverHttps = null;
        if (httpsPort !== null && sslData !== null)
        {
            serverHttps = https.createServer(sslData, this._router).listen(httpsPort, () => {
                logging.logger.info(`started listening https requests on ${httpsPort}`);
            });
        }

        const signalName = waitForPromise(this.trackSignals());
        console.log(`got signal ${signalName}, shutting down`);

        waitForPromise(Promise.all([
            this._closeAsync(serverHttp),
            this._closeAsync(serverHttps)
        ]));
        this._runActions(this._postListenActions);
    }

    trackSignals()
    {
        return new Promise((resolve, _) => {
            process.on('SIGTERM', () => {
                resolve('SIGTERM');
            });
            process.on('SIGINT', () => {
                resolve('SIGINT');
            });
        })
    }

    /**
     * Calls set of async functions and waits for results
     * @param {Array<Function>} actions - async actions that must be called syncronously
     */
    _runActions(actions)
    {
        const promises = [];
        for (let action of actions)
        {
            promises.push(action());
        }
        waitForPromise(Promise.all(promises));
    }

    _closeAsync(server)
    {
        if (!server)
        {
            return Promise.resolve();
        }
        return new Promise((resolve, _) => {
            server.close(() => {
                resolve();
            });
        });
    }
}

module.exports.Server = Server;
