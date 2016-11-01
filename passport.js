const passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    db = require('./models')

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    db.User.findOne(
        {
            where: { id: user.id }
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
                db.User.validPassword(password, passwd,function(err,isMatch) {
                    if(err)
                        done(err);

                    if(isMatch)
                        done(null, user)

                    done(null, false);
                });
            })
            .catch(function(err) {
                done(err)
            });
        })
    );
