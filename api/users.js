/*
 * Implement router for /api endpoints.
 */
const express  = require('express');
const passport = require('passport');
const passportConfig = require('../passport.js')
const db = require('../models');
const ensureLogin = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.status(403).json({ message: "Access denied"});
    }
}

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
                })
                .catch( (err) => {;
                    console.log('user err post json');
                    console.log(err);

                });
            } else {
                res.status(409).json("User exists");
            }
        })
        .catch((err) => {
            console.log("err for post user");
            console.log(err);
        });
    });

apirouter
    .get('/',
        ensureLogin,
        (req, res) => {
            if (req.user.admin != true && req.user.id != req.params.user_id) {
                res.status(403).json({message: "User have not the right credentials"});
            } else {
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
                    })
                    .catch( (err) => {
                        console.log("err pagination of first 10");
                        console.log(err);
                        res.json(err);
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
                    })
                    .catch( (err) => {
                        console.log("err of offset 10");
                        console.log(err);
                        res.json(err);
                    });
                }
            }
        }
    );

apirouter
    .get('/:user_id',
        ensureLogin,
        (req, res) => {
            if (req.user.admin != true && req.user.id != req.params.user_id) {
                res.status(403).json({message: "User have not the right credentials"});
            } else {
                db.User.findOne(
                    {
                        where: {
                            id: req.user.id
                        }
                    }
                )
                .then( (user) => {
                    res.json(
                        {
                            username: user.username,
                            email: user.email,
                            firstname: user.firstname,
                            lastname: user.lastname,
                            id: user.id
                        }
                    );
                })
                .catch( (user) => {
                    console.log("user get id");
                    console.log(user);
                });
            }
        }
    );

apirouter
    .put('/:user_id',
        ensureLogin,
        (req, res) => {
            if (req.user.admin != true && req.user.id != req.params.user_id) {
                res.status(403).json({message: "User have not the right credentials"});
            } else {
                db.User.findOne(
                    {
                        where: {
                            id: req.params.user_id
                        }
                    }
                )
                .then( (user) => {
                    for(const key in req.body) {
                        if(key !== 'id')
                            user[key] = req.body[key] || user[key];
                    }

                    return user.save();
                })
                .then( () => {
                    res.json({ message: "User updated" });
                })
                .catch( (err) => {
                    console.log('put err');
                    console.log(err);
                })
            }
        }
    );

module.exports = apirouter
