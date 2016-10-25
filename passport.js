const passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    db = require('./models')

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    db.User.findOne(
        {
            where: { id }
        }
    )
    .then(function(user) {
        done(null, user);
    })
    .catch(function(err) {
        done(err, null)
    });
});

//Auth
passport
    .use(new LocalStrategy(
        function(username, password, done) {
            db.User.findOne(
                {
                    where: {
                        username: username
                    }
                }
            )
            .then(function(user) {
                passwd = user ? user.password : '';
                isMatch = db.User.validPassword(password, passwd, done, user);
            })
            .catch(function(err) {
                return done(err)
            });
        })
    );
