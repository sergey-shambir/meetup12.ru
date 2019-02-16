const serveStatic = require('serve-static');
const express = require('express');
const favicon = require('serve-favicon');
const path = require('path');
const compression = require('compression');
const cookieSession = require('cookie-session');
const timeout = require('connect-timeout');
const passport = require('passport');
const errorhandler = require('errorhandler');
const expressPromiseRouter = require('express-promise-router');

const Client = require('./db/Client');
const config = require('./core/config');
const logging = require('./core/logging');
const { Server } = require('./core/server');
const AuthService = require('./auth/AuthService');
const AuthRouter = require('./auth/AuthRouter');
const SiteService = require('./site/SiteService');

const staticDir = path.join(__dirname, 'www');
const viewsDir = path.join(__dirname, 'views');

const app = express();

app.set('views', viewsDir);
app.set('view engine', 'ejs');

app.use(favicon(path.join(staticDir, 'favicon.ico')));
app.use(compression());
app.use(timeout('3s'));
app.use(cookieSession({
    name: 'session',
    keys: [ config.sessionSecret() ],
}));
app.use(logging.logResponse);
if (config.isDevEnv())
{
    app.use(errorhandler());
}
app.use(passport.initialize());
app.use(passport.session());

const dbClient = new Client(config.dsn());
const authRouter = new AuthRouter('/login');
const authService = new AuthService(dbClient);
const siteService = new SiteService();
authService.use(authRouter);
app.use('/login', authRouter.makeRouter(authService.serviceIds(), '/', '/login'));

const router = expressPromiseRouter();
app.use(router);

router.get('/', function(req, res) {
    res.redirect('/events');
});

router.get('/events', function(req, res) {
    res.render('events', {
        page: {
            navbar: siteService.getNavbarOptions(req),
        }
    });
});

router.get('/events/new', function(req, res) {
    res.render('events-new', {
        page: {
            navbar: siteService.getNavbarOptions(req),
        }
    });
});

router.post('/events/new', function(req, res) {
    res.sendStatus(200);
});

router.get('/login', function(req, res) {
    res.render('login', {
        page: {
            navbar: siteService.getNavbarOptions(req),
        }
    });
});

router.get('/profile', function(req, res) {
    res.render('profile', {
        page: {
            navbar: siteService.getNavbarOptions(req),
        }
    });
});

router.get('/members', function(req, res) {
    res.render('members', {
        page: {
            navbar: siteService.getNavbarOptions(req),
        }
    });
});

router.use(serveStatic(staticDir));

const server = new Server(app);
server.preListenAction(async () => {
    await dbClient.initialize();
});
server.postListenAction(async () => {
    await dbClient.end();
});
server.runSync(config.portHttp(), config.portHttps(), config.sslData());
