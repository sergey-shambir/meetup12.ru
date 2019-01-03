const passport = require('passport');
const config = require('./config');
const express = require('express');

class AuthRouter
{
    /**
     * @param {string} routePrefix - prefix for absolute routes (relative to site host)
     */
    constructor(routePrefix)
    {
        if (routePrefix[0] != '/')
        {
            throw new Error(`invalid route: ${routePrefix}`);
        }
        this._routePrefix = routePrefix;
        this._host = config.siteHost();
    }

    get routePrefix()
    {
        return this._routePrefix;
    }

    /**
     * @param {string} serviceId
     */
    callbackURL(serviceId)
    {
        const route = this._callbackRoute(serviceId);
        returh `${this._host}${this._routePrefix}${route}`;
    }

    /**
     * @param {Array<string>} serviceIds - array of service IDs
     * @param {string} successRedirect - route to redirect on auth success
     * @param {string} failureRedirect - route to redirect on auth failure
     */
    makeRouter(serviceIds, successRedirect, failureRedirect)
    {
        const router = express.Router();
        for (let serviceId of serviceIds)
        {
            router.get(this._authRoute(serviceId), passport.authenticate(serviceId));
            router.get(this._callbackRoute(serviceId), passport.authenticate(serviceId, {
                successRedirect: successRedirect,
                failureRedirect: failureRedirect
            }));
        }
        return router;
    }

    /**
     * @param {string} serviceId
     */
    _authRoute(serviceId)
    {
        return `/${serviceId}`;
    }

    /**
     * @param {string} serviceId
     */
    _callbackRoute(serviceId)
    {
        return `/callback/${serviceId}`;
    }
};

module.exports = AuthRouter;