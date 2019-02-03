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

        const allowHttps = (httpsPort !== null && sslData !== null);
        const closeFn = allowHttps
            ? this._serveHttps(httpPort, httpsPort, sslData)
            : this._serveHttp(httpPort);

        const signalName = waitForPromise(this._trackSignals());
        console.log(`got signal ${signalName}, shutting down`);

        waitForPromise(closeFn());
        this._runActions(this._postListenActions);
    }

    /**
     * Starts serving https and http with automatic redirection from http to https
     * @param {number} httpPort - http server port, e.g. 80
     * @param {?number} httpsPort - http server port, e.g. 443
     * @param {?Object} sslData - ssl options for https package
     * @returns {Function} async close function
     */
    _serveHttps(httpPort, httpsPort, sslData)
    {
        let redirectToHttps = (req, res) => {
            let location = "https://" + req.headers['host'] + req.url;
            res.writeHead(301,  {
                "Location": location
            });
            res.end();
        }
        let serverHttp = http.createServer(redirectToHttps).listen(httpPort, () => {
            logging.logger.info(`redirecting from http to https on ${httpPort}`);
        });
        let serverHttps = https.createServer(sslData, this._router).listen(httpsPort, () => {
            logging.logger.info(`started listening https requests on ${httpsPort}`);
        });
        return () => {
            return Promise.all([
                this._closeAsync(serverHttp),
                this._closeAsync(serverHttps)
            ]);
        };
    }

    /**
     * Starts serving http only
     * @param {number} httpPort - http server port, e.g. 80
     * @returns {Function} async close function
     */
    _serveHttp(httpPort)
    {
        let serverHttp = http.createServer(this._router).listen(httpPort, () => {
            logging.logger.info(`started listening http requests on ${httpPort}`);
        });
        return () => {
            return this._closeAsync(serverHttp);
        }
    }

    _trackSignals()
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
