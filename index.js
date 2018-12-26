const http = require('http');
const serveStatic = require('serve-static');
const express = require('express');
const favicon = require('serve-favicon');
const path = require('path');
const compression = require('compression');
const cookieSession = require('cookie-session');
const timeout = require('connect-timeout');
const errorhandler = require('errorhandler');

const config = require('./src/config');
const logging = require('./src/logging');

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

app.get('/', function(req, res) {
    res.redirect('/events');
});

app.get('/events', function(req, res) {
    const page = {
        navbar: {
            pageUrl: req.path
        }
    }
    res.render('events', {
        page: page
    });
});

app.get('/events/new', function(req, res) {
    res.render('events-new');
});

app.post('/events/new', function(req, res) {
    res.sendStatus(200);
});

app.get('/login', function(req, res) {
    res.render('login');
});

app.post('/login', function(req, res) {
    res.sendStatus(200);
});

app.get('/profile', function(req, res) {
    res.render('profile');
});

app.get('/members', function(req, res) {
    const page = {
        navbar: {
            pageUrl: req.path
        }
    }
    res.render('members', {
        page: page
    });
});

app.use(serveStatic(staticDir));

const port = config.port();
http.createServer(app).listen(port, () => {
    logging.logger.info(`started server on :${port}`);
});
