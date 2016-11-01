/*
 * Implement router for /api endpoints.
 */
const express  = require('express');
const passport = require('passport');
const passportConfig = require('../passport.js')
const db = require('../models');

var apirouter = express.Router();

const ensureLogin = (req, res, next) => {
    debugger;
    if (req.isAuthenticated()) {
        next();
    } else {
        res.status(403).json({ message: "Access denied"});
    }
}

const usersArr = (arrayUsers) => {
    arr = [];

    for(user of arrayUsers) {
        arr.push({
            username: user.username,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email
        });
    }
        return arr;
};

apirouter.route('/')
    .post(function(req, res) {
        db.User.findOne(
            {
                where: {
                    username: req.body.username
                }
            }
        )
        .then(function(user) {
            if(!user) {
                return db.User.create(
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
                    res.status(400).json({ message: err });
                });
            } else {
                return res.status(409).json({ message: "User exists" });
            }
        })
        .catch((err) => {
            res.status(407).json({ message: err });
        });
    });

apirouter
    .get('/',
        ensureLogin,
        (req, res) => {
            if (req.user.admin != true) {
                return res.status(403).json({message: "User have not the right credentials"});
            } else {
                if(JSON.stringify(req.query) === "{}") {
                    return db.User.findAll(
                        {
                            limit: 10
                        }
                    )
                    .then(function(users) {
                        res.json(usersArr(users));
                    })
                    .catch( (err) => {
                        res.status(400).json({ message: err });
                    });
                } else {
                    return db.User.findAll(
                        {
                            limit: 10,
                            offset: (10 * req.query.page)
                        }
                    )
                    .then(function(users) {
                        res.json(usersArr(users));
                    })
                    .catch( (err) => {
                        res.status(400).json({ message: err });
                    });
                }
            }
        }
    );

apirouter
    .get('/:user_id',
        ensureLogin,
        (req, res) => {
            return db.User.count()
                .then( (numUsers) => {
                    if(numUsers < req.params.user_id || req.params.user_id <= 0) {
                        return res.status(404).json({message: "User does not exist."});
                    }

                    if (req.user.admin != true && req.user.id != req.params.user_id) {
                        return res.status(403).json({message: "Bad input."});
                    }

                    return db.User.findOne(
                        {
                            where: {
                                id: req.params.user_id
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
                    .catch( (err) => {
                        res.status(404).json(err);
                    });
                })
                .catch( err => {
                    res.status(404).json(err);
                });
        }
    );

apirouter
    .put('/:user_id',
        ensureLogin,
        (req, res) => {
            db.User.count()
                .then( (numUsers) => {
                    if(numUsers < req.params.user_id || req.params.user_id <= 0) {
                        return res.status(404).json({message: "User does not exist."});
                    }

                    if (req.user.admin != true && req.user.id != req.params.user_id) {
                        //the top lvl returns are being tests for promises
                        return res.status(403).json({message: "User have not the right credentials"});
                    }

                    return db.User.findOne(
                        {
                            where: {
                                id: req.params.user_id
                            }
                        }
                    )
                    .then( (user) => {
                        for(const key in req.body) {

                            if(key == "firstname" ||
                               key == "lastname" ||
                               key == "password" ||
                               key == "username" ||
                               key == "email") {

                                user[key] = req.body[key] || user[key];
                            }
                        }
                        user.save();
                        return user.changed();
                    })
                    .then( (userUpdated) => {
                        if(!userUpdated) {
                            res.status(400).json({ message: "Bad input." });
                        }
                        res.json({ message: "User updated" });
                    })
                    .catch( (err) => {
                        console.log('put err');
                        console.log(err);
                        res.json(400).json({ message: err });
                    });
                })
                .catch( err => {
                    res.status(400).json({ message: err });
                });
        }
    );

module.exports = apirouter
