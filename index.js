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

const db = require('./src/db');
const config = require('./src/config');
const logging = require('./src/logging');
const { Server } = require('./src/server');
const AuthService = require('./src/AuthService');
const AuthRouter = require('./src/AuthRouter');

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

if (app.get('env') == 'development')
{
    app.use(errorhandler());
}

app.use(passport.initialize());
app.use(passport.session());

const dbClient = new db.Client(config.dsn());

const authRouter = new AuthRouter('/login');
app.use(authRouter.makeRouter('/', '/login'));

const authService = new AuthService(dbClient.repository());
authService.use(authRouter);

const router = expressPromiseRouter();
app.use(router);

router.get('/', function(req, res) {
    res.redirect('/events');
});

router.get('/events', function(req, res) {
    const page = {
        navbar: {
            pageUrl: req.path
        }
    }
    res.render('events', {
        page: page
    });
});

router.get('/events/new', function(req, res) {
    res.render('events-new');
});

router.post('/events/new', function(req, res) {
    res.sendStatus(200);
});

router.get('/login', function(req, res) {
    const page = {
        navbar: {
            pageUrl: req.path
        }
    }
    res.render('login');
});

router.get('/profile', function(req, res) {
    res.render('profile');
});

router.get('/members', function(req, res) {
    const page = {
        navbar: {
            pageUrl: req.path
        }
    }
    res.render('members', {
        page: page
    });
});

router.use(serveStatic(staticDir));

const port = config.port();
const server = new Server(app);
server.preListenAction(async () => {
    await dbClient.connect();
});
server.postListenAction(async () => {
    await dbClient.end();
});
server.listen(port);
