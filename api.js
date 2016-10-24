/**
 * Main module for API server
 */
const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const db = require('./models');
const app = express();

SALT_WORK_FACTOR = 12;
// configure body parser; this middleware module will parse the body of
// requests to retrieve parameters passed to REST calls.  We support
// both URL-encoded bodies and JSON bodies.
//
// https://www.npmjs.com/package/body-parser#bodyparserurlencodedoptions
app.use(bodyParser.urlencoded({ extended: true }));
// https://www.npmjs.com/package/body-parser#bodyparserjsonoptions
app.use(bodyParser.json());

// https://www.npmjs.com/package/express-session
const session = require('express-session')
// https://www.npmjs.com/package/session-file-store#express-or-connect-integration
const FileStore = require('session-file-store')(session);

app.use(session({ 
    store : new FileStore({ }), // if omitted, would default to MemoryStore
    secret: 'keyboard mouse secret sauce', 
    resave: false, 
    saveUninitialized: false }));

// Initialize Passport and restore authentication state, 
// if any, from the session.
app.use(passport.initialize());
app.use(passport.session());

const port     = process.env.PORT || 3000

// mount API routes to /api
app.use('/api', require('./api/'));

module.exports = app
