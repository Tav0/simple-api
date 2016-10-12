/*
 * Implement router for /api endpoints.
 */
const express  = require('express');
const passport = require('passport');

var apirouter = express.Router();

apirouter.get('/', function(req, res) {
	res.json({ status : true, message: 'API is accessible' });	
});

apirouter.use('/users', require('./users'))

// Implement /api/login authentication entry point.
// For this to work, passport must be using a strategy
// from passport-local.
// You should implement that strategy in users.js
apirouter.post('/login',
    passport.authenticate('local'),
    (req, res) => {
        res.json({ message: "you are successfully authenticated" })
    }
)
 
module.exports = apirouter
