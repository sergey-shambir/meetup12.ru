const express = require('express');
const favicon = require('serve-favicon');
const path = require('path');
const compression = require('compression');
const cookieSession = require('cookie-session');
const timeout = require('connect-timeout');
const errorhandler = require('errorhandler');
const config = require('./config');

const app = express();

const staticDir = path.join(__dirname, '..', 'www');
const viewsDir = path.join(__dirname, '..', 'views');

app.set('www', staticDir);
app.set('views', viewsDir);
app.set('view engine', 'ejs');

app.use(favicon(path.join(staticDir, 'favicon.ico')));

app.use(compression());

app.use(timeout('3s'));

app.use(cookieSession({
    name: 'session',
    keys: [ config.get('session_secret') ],
}));

if (app.get('env') == 'development')
{
    app.use(errorhandler());
}

module.exports = app;
