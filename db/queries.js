const Promise = require('bluebird') // override ES6 Promise to be able to use '.using'
const dbConn = require('./connection')
const db = require('../models')

// look up user by id
// return (id, username, firstname, lastname, email, admin)
function getUserById(userid) {
}

// look up user by name
// return (*)
function getUserByName(username) {
}

// insert a new user and return its id
function insertNewUser({ username, firstname, lastname, email, password, admin }) {
}

// appoint a user to be an admin
function appointAdmin(userid) {
    return db.User.findOne(
        {
            where: {
                id: userid
            }
        }
    )
    .then(function(user) {
        user.admin = true;
        user.save();
        return null;
    })
    .catch( (err) => {
        console.log('appoint admin queries');
        console.log(err);
        return err;
    });
}

// update a user's information
// user is an object with some or all fields
function updateUserInfo(id, user) {
}

// return list of up to pgSize users starting at page * pgSize
// for each user, list (id, username, lastname, firstname, email)
function listUsers(page, pgSize = 10) {
}

module.exports = {
    getUserByName,
    getUserById,
    insertNewUser,
    listUsers,
    updateUserInfo,
    appointAdmin
}
