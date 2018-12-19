const express = require('express');
const path = require('path');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon(path.join(__dirname, 'www', 'favicon.ico')));

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
