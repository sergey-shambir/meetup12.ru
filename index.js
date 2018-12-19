const http = require('http');
const serveStatic = require('serve-static');

const app = require('./src/app');
const config = require('./src/config');

app.get('/', function(req, res) {
    res.redirect('/events')
});

app.get('/events', function(req, res) {
    res.send('TODO: events page');
});

app.get('/events/new', function(req, res) {
    res.send('TODO: new event page');
});

app.post('/events/new', function(req, res) {
    res.sendStatus(200);
});

app.get('/login', function(req, res) {
    res.send('TODO: login page');
});

app.post('/login', function(req, res) {
    res.sendStatus(200);
});

app.get('/profile', function(req, res) {
    res.send('TODO: profile page')
});

app.get('/members', function(req, res) {
    res.send('TODO: members list')
});

app.use(serveStatic(app.get('www')));

const port = config.get('port');
console.log(`starting server on :${port}...`)
http.createServer(app).listen(config.get('port'));
