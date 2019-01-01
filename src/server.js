const http = require('http');
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
     * @param {number} port - http server port, e.g. 8080
     */
    listen(port)
    {
        this._runActions(this._preListenActions);
        http.createServer(this._router).listen(port, () => {
            console.log("HACK: logging, started listening ", port);
            logging.logger.info(`started listening ${port}`);
        });
        this._runActions(this._postListenActions);
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
}

module.exports.Server = Server;
