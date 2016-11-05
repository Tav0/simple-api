const passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    db = require('./models')

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(userID, done) {
    db.User.findOne(
        {
            where: { id: userID }
        }
    )
    .then(function(user) {
        done(null, user);
    })
    .catch(function(err) {
        done(err)
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
                if(!user)
                    done(null, false);

                passwd = user ? user.password : '';
                return db.User.validPassword(password, passwd,function(err,isMatch) {
                    if(err)
                        return done(err);

                    if(isMatch)
                        return done(null, user)

                    return done(null, false);
                });
            })
            .catch(function(err) {
                done(err)
            });
        })
    );
