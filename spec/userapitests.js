/* 
 * Test setup. 
 *
 * Before running the test, put your database configuration (for testing) 
 * in config/test.json
 *
 * We assume that you have created all necessary tables (via sql/createdb.sql) before
 * running this test.
 */
const nconf = require('nconf')
nconf.argv()
    .env()
    .file({ file: 'config/test.json' })

// now that nconf defaults are set, we can require api (which reads those defaults).
const api = require('../api')

// put your database code in this file
const db = require('../db/queries')

const request = require('supertest');
const Promise = require('bluebird');    // for coroutines and other goodies

/*
 * Implementation notes. supertest object can use a '.end' method or alternatively
 * support promises (via .then).
 *
 * jasmine (unlike mocha) does not support done(err) to fail a spec, we must use
 * done.fail(err) instead.
 */

function fetchJSON(path) {
    return request(api)
            .get(path)
            .expect('Content-Type', /json/)
            .expect(200)
            .then((res) => res.body)
}

describe("Basic API Tests", function() {
    it("checks that the API is up", (done) => {
        fetchJSON('/api').then((rc) => {
            expect (rc.status).toBeTruthy();
            expect (rc.message).toBe('API is accessible');
            done() 
        })
        .catch(done.fail)
    });
});

/* 
 * Generally, we want specs to be independent so that the testing framework
 * can execute them in random order.  Here, however, I am relying on Jasmine
 * executing them in order.
 */
// courtesy http://listofrandomnames.com/
const users = [
    [ "Matilda", "Slade", "matilda@example.com" ],
    [ "Leah", "Srour", "leah@example.com" ],
    [ "Joetta", "Sol", "joetta@example.com" ],
    [ "Bobby", "Mauro", "bobby@example.com" ],
    [ "Britney", "Dumond", "britney@example.com" ],
    [ "Zonia", "Coombs", "zonia@example.com" ],
    [ "Aundrea", "Strate", "aundrea@example.com" ],
    [ "Martine", "Danielson", "martine@example.com" ],
    [ "Christie", "Yancy", "christie@example.com" ],
    [ "Cinderella", "Adan", "cinderella@example.com" ],
    [ "Tennille", "Goatley", "tennille@example.com" ],
    [ "Gertrud", "Gunn", "gertrud@example.com" ],
    [ "Nigel", "Schlicher", "nigel@example.com" ],
    [ "Parker", "Tiller", "parker@example.com" ],
    [ "Antwan", "Saeger", "antwan@example.com" ],
    [ "Cynthia", "Migues", "cynthia@example.com" ],
    [ "Joe", "Barrus", "joe@example.com" ],
    [ "Jo", "Marquis", "jo@example.com" ],
    [ "Kellee", "Cape", "kellee@example.com" ],
    [ "Lacy", "Lozier", "lacy@example.com" ],
    [ "Ivelisse", "Deak", "ivelisse@example.com" ],
    [ "Myrtle", "Session", "myrtle@example.com" ],
    [ "Alpha", "Mijares", "alpha@example.com" ],
    [ "Lorna", "Crabill", "lorna@example.com" ],
    [ "Tabatha", "Scicchitano", "tabatha@example.com" ],
    [ "Allen", "Hood", "allen@example.com" ],
    [ "Latonya", "Conde", "latonya@example.com" ],
    [ "Shantay", "Quon", "shantay@example.com" ],
    [ "Stephaine", "Dauer", "stephaine@example.com" ],
    [ "Vashti", "Ballengee", "vashti@example.com" ],
    [ "Ashima", "Ballengee", "ashima@example.com" ]
]

const signupfailures = [
    [ "Vashti", "Khera", "vashti@example.com" ]
]

// for our purposes, we compute the password as the first name spelled backwards
function makePassword(firstname) {
    return firstname.toLowerCase().split('').reverse().join('')
}

describe("Supplementary Tests", function() {
    it("Tests that makePassword works the way I think it does", function () {
        expect(makePassword("Stephaine")).toBe("eniahpets");
    })
})

// authenticate as a given user, on success return a promise that yields an
// superagent that carries the authentication credentials in its
// cookie jar.
function loginAs(user, password = makePassword(user.firstname)) {
    // console.log(`logging in as ${user.username} with ${password}`)
    const superagent = request.agent;
    const authreq = superagent(api)
    return authreq.post('/api/login')
                  .send({ username : user.username, password })
                  .then((res) => { 
                      if (res.status == 401) 
                          throw Error() 
                      else
                          return authreq
                  })
}

// upon successful creation, index created users by their id.
const usersById = { }

describe("Test User Creation", function() {
    /*
     * The following specs must be done in order.
     */
    for (const [firstname, lastname, email] of users) {
        it("tests that a user can be created", (done) => {
            const username = email.replace("@example.com", "");
            const user =
                {
                    username, firstname, lastname, email, 
                    password: makePassword(username)
                }
            request(api)
                .post('/api/users')
                .send(user)
                .expect(200)
                .then((res) => {
                    expect ('id' in res.body).toBeTruthy();
                    usersById[res.body.id] = user;
                    done()
                }).catch(done.fail)
        })
    }

    for (const [firstname, lastname, email] of signupfailures) {
        it("tests that user fails if there is a problem", (done) => {
            const username = email.replace("@example.com", "");
            const user =
                {
                    username, firstname, lastname, email, 
                    password: makePassword(username)
                }
            request(api)
                .post('/api/users')
                .send(user)
                .expect(409)
                .then((res) => {
                    done()
                }).catch(done.fail)
        })
    }

    it("checks that unauthorized users do not have access to user information", function (done) {
        request(api)
            .get(`/api/users/1`)
            .expect(403)
            .then(done)
            .catch(done.fail)
    })

    it ("tests that authenticated users can retrieve their own info", function (done) {
        function testUser(id) {
            const user = usersById[id]
            return loginAs(user).then((authreq) => {
                return authreq.get(`/api/users/${id}`)
                    .expect(200)
                    .then((res) => res.body)
                    .then((body) => {
                        expect(body.username).toBe(user.username);
                        expect(body.password).not.toBeDefined();
                        return authreq
                    })
            })
        }

        const checkAllUsers = []
        for (const id in usersById)
            checkAllUsers.push(testUser(id))

        Promise.all(checkAllUsers).then((results) => {
            expect(results.length).toBe(checkAllUsers.length);
            done()
        })
    })

    it ("tests that user A cannot retrieve information about user B", function (done) {
        const id_usera = 1
        const id_userb = 2
        const usera = usersById[id_usera]
        loginAs(usera).then((authreq) => {
            authreq.get(`/api/users/${id_userb}`)
                   .expect(403)
                   .then(done)
                   .catch(done.fail)
        })
    })

    it ("tests that an admin can retrieve information about user B", function (done) {
        const id_usera = 1
        const id_userb = 2
        db.appointAdmin(id_usera).then(() => {
            const usera = usersById[id_usera]
            const userb = usersById[id_userb]
            loginAs(usera).then((authreq) => {
                authreq.get(`/api/users/${id_userb}`)
                    .expect(200)
                    .then((res) => {
                        expect(res.body.firstname).toBe(userb.firstname);
                        expect(res.body.lastname).toBe(userb.lastname);
                        expect(res.body.email).toBe(userb.email);
                        expect(res.body.username).toBe(userb.username);
                        done();
                }).catch(done.fail)
            })
        });
    })

    it ("tests that non-existing users return 404", function (done) {
        const id_usera = 1
        const usera = usersById[id_usera]
        loginAs(usera).then((authreq) => {
            authreq.get(`/api/users/19999`)
                .expect(404)
                .then(done)
                .catch(done.fail)
        })
    })

    it("tests that users cannot be listed by a non-admin", function (done) {
        const id_userb = 2
        const userb = usersById[id_userb]
        loginAs(userb).then((authreq) => {
            authreq.get(`/api/users?page=5`)
                   .expect(403)
                   .then(done)
                   .catch(done.fail)
        })
    });

    // user a is now admin
    // expected response for each page: { has_more: true/false, users: [ ... ] }
    it("tests that users can be listed by an admin", function (done) {
        const id_usera = 1
        const usera = usersById[id_usera]
        loginAs(usera).then((authreq) => {
            function *listallusers() {
                let userlist = []
                for (let page = 0; ; page++) {
                    // superagent's authreq is not a promise, so we wrap it into one
                    //
                    // yielding a promise gets the promise's resolved value back once
                    // the function continues.
                    const chunk = yield authreq
                        .get(`/api/users?page=${page}`) 
                        .expect(200)
                        .then((res) => res.body) 

                    expect(chunk).not.toBeNull();
                    expect(chunk.users).not.toBeNull();
                    userlist = userlist.concat(chunk.users);
                    if (!chunk.has_more)
                        break;
                }
                return userlist
            }

            // crank it
            Promise.coroutine(listallusers)().then((userlist) => {
                expect(users.length).toBe(userlist.length);
                for (let user of userlist) {
                    const originaluser = usersById[user.id]
                    expect(originaluser.username).toBe(user.username);
                    expect(originaluser.email).toBe(user.email);
                    expect(originaluser.firstname).toBe(user.firstname);
                    expect(originaluser.lastname).toBe(user.lastname);
                }
                done();
            }).catch(done.fail)
        })
    });

    it("tests that a user can change their password and last name", function (done) {
        const id_userb = 2
        const userb = usersById[id_userb]
        const newpassword = "easypass"
        const newlast = "NewLastName"
        loginAs(userb).then((authreq) => {
            return authreq.put(`/api/users/${id_userb}`)
                   .send({ password : newpassword, lastname: newlast })
                   .expect(200)
                   .then((res) => {
                        return loginAs(userb, newpassword).then((authreq) => {
                            return authreq.get(`/api/users/${id_userb}`)
                                .expect(200)
                                .then((res) => res.body)
                                .then((body) => {
                                    expect(body.lastname).toBe(newlast);
                                    expect(body.password).not.toBeDefined();
                                    done()
                                })
                        })
                  })
        }).catch(done.fail)
    });

    it("tests that a user cannot change another user's password or last name", function (done) {
        const id_userb = 3
        const id_userc = 4
        const userb = usersById[id_userb]
        const userc = usersById[id_userc]
        const newpassword = "easypass"
        const newlast = "NewLastName"
        loginAs(userb).then((authreq) => {
            return authreq.put(`/api/users/${id_userc}`)
                   .send({ password : newpassword, lastname: newlast })
                   .expect(403)
                   .then((res) => {
                        loginAs(userc, newpassword).then(done.fail).catch(done)
                        return  // let promise succeed
                   })
        }).catch(done.fail)
    });
});
