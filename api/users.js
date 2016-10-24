/*
 * Implement router for /api endpoints.
 */
const express  = require('express');
const passport = require('passport');
const db = require('../models');

var apirouter = express.Router();

apirouter.route('/')
    .post(function(req, res) {
        db.User.find(
            {
                where: {
                    username: req.body.username
                }
            }
        )
        .then(function(user) {
            if(!user) {
                db.User.create(
                    {
                        username: req.body.username,
                        password: req.body.password,
                        firstname: req.body.firstname,
                        lastname: req.body.lastname,
                        email: req.body.email
                    }
                )
                    .then(function(newUser) {
                        res.json(
                            {
                                id: newUser.id
                            }
                        );
                    });
            } else {
                res.status(409).json("User exists");
            }
        });
    })
    .get(function(req, res) {
        if(JSON.stringify(req.query) === "{}") {
            db.User.findAll(
                {
                    limit: 10
                }
            )
            .then(function(users) {
                users = [];
                for(user in users) {
                    users.push({
                        username: user.username,
                        firstname: user.firstname,
                        lastname: user.lastname,
                        email: user.email
                    });
                }

                res.json(users);
            });
        } else {
            db.User.findAll(
                {
                    limit: 10,
                    offset: (10 * req.query.page)
                }
            )
            .then(function(users) {
                users = [];
                for(user in users) {
                    users.push({
                        username: user.username,
                        firstname: user.firstname,
                        lastname: user.lastname,
                        email: user.email
                    });
                }
                res.json(users);
            });
        }
    });

apirouter.route('/:user_id')
    .get(function(req, res) {
        db.User.findOne(
            {
                where: {
                    id: req.params.user_id
                }
            }
        )
        .then(function(user) {
            if(user.flag){
                res.json({
                    username: user.username,
                    firstname: user.firstname,
                    lastname: user.lastname,
                    email: user.email
                });
            } else {
                res.status(403).json("Not authenticated");
            }
        })
    })
    .put(function(req, res) {
        db.User.findOne(
            {
                where: {
                    id: req.params.user_id
                }
            }
        )
        .then(function(user) {
            user.update(
                {
                    password: req.body.password,
                    lastname: req.body.lastname
                });
            }
        );
    });


module.exports = apirouter
