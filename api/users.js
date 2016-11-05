/*
 * Implement router for /api endpoints.
 */
const express  = require('express');
const passport = require('passport');
const passportConfig = require('../passport.js')
const db = require('../models');

var apirouter = express.Router();

const ensureLogin = (req, res, next) => {
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
            email: user.email,
            id: user.id
        });
    }
    return arr;
};

apirouter.route('/')
    .post(function(req, res) {
        debugger;
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
                    return res.json(
                        {
                            id: newUser.id
                        }
                    );
                })
                .catch( (err) => {;
                    return res.status(400).json({ message: err });
                });
            } else {
                return res.status(409).json({ message: "User exists" });
            }
        })
        .catch((err) => {
            res.status(407).json({ message: err });
        });
    });

//
apirouter
    .get('/',
        ensureLogin,
        (req, res) => {
            if (!req.user.admin) {
                return res.status(403).json({message: "User have not the right credentials"});
            }
            const query = req.query.page;

            if(!query || query === '0') {
                return db.User.findAll(
                    {
                        limit: 10
                    }
                )
                .then(function(result) {
                    return res.json({
                        users: usersArr(result),
                        has_more: (result.length < 10) ? false : true
                    });
                })
                .catch( (err) => {
                    return res.status(404).json({
                        message: "No more users.",
                        has_more: false
                    });
                });
            } else {
                db.User.findAll(
                    {
                        limit: 10,
                        offset: (10 * req.query.page)
                    }
                )
                .then(function(result) {
                    return res.json({
                        users: usersArr(result),
                        has_more: (result.length < 10) ? false : true
                    });
                })
                .catch( (err) => {
                    return res.status(404).json({
                        message: "No more users.",
                        has_more: false
                    });
                });
            }
        }
    );

//Admins and owner of id can GET
apirouter
    .get('/:user_id',
        ensureLogin,
        (req, res) => {
            db.User.findOne(
                {
                    where: {
                        id: req.params.user_id
                    }
                }
            )
            .then( (user) => {
                if (user) {
                    if (req.user.admin || req.user.id === user.id) {
                        return res.json(
                            {
                                username: user.username,
                                email: user.email,
                                firstname: user.firstname,
                                lastname: user.lastname,
                                id: user.id
                            }
                        );
                    }
                    return res.status(403).json({message: "Bad permissions."});
                }

                return res.status(404).json({ message: "User not found." });
            })
            .catch( (err) => {
                return res.status(404).json({ message: err });
            });
        }
    );

//Owner of id can PUT
apirouter
    .put('/:user_id',
        ensureLogin,
        (req, res) => {
            db.User.findOne(
                {
                    where: {
                        id: req.params.user_id
                    }
                }
            )
            .then( (user) => {
                if(!user) {
                    return res.status(404).json({ message: "User not found." });
                }
                if(user.id !== req.user.id){
                    return res.status(403).json({message: "Bad permissions."});
                }

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

                if (!user.changed()) {
                    return res.status(400).json({ message: "No update." });
                }
                return res.json({ message: "User updated." });
            })
            .catch( (err) => {
                return res.json(404).json({ message: err });
            });
        }
    );

module.exports = apirouter;
