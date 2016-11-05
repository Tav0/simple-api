const bcrypt = require('bcrypt-nodejs');

module.exports = function(sequelize, DataTypes) {
    var User = sequelize.define('User', {
        admin: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            field: 'user_id'
        },
        username: {
            type: DataTypes.STRING,
            unique: true,
            validate: {
                notEmpty: true
            }
        },
        password: {
            type: DataTypes.STRING,
            validate: {
                notEmpty: true
            }
        },
        firstname: DataTypes.STRING,
        lastname: {
            type: DataTypes.STRING,
            validate: {
                is: /^[a-z]+$/i,
                notEmpty: true
            }
        },
        email: {
            type: DataTypes.STRING,
            validate: {
                isEmail: true,
                notEmpty: true
            }
        }
    }, {
        classMethods: {
            validPassword: function(password, passwd, done) {
                bcrypt.compare(password, passwd, function(err, isMatch) {
                    done(err, isMatch);
                });
            }
        }
    }, {
        dialect: 'mysql'
    });

    User.hook('beforeCreate', function(user, options, fn) {
        const salt = bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
            return salt;
        });
        bcrypt.hash(user.password, salt, null, function(err, hash) {
            if (err) fn(err);

            user.password = hash;
            fn(null, user);
        });
    });

    User.hook('beforeUpdate', function(user, options, fn) {
        if(options.fields.indexOf("password") !== -1) {
            const salt = bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
                return salt;
            });
            return bcrypt.hash(user.password, salt, null, function(err, hash) {
                if (err) fn(err);

                user.password = hash;
                fn(null, user);
            });
        }
        return fn(null, false);
    });
    return User;
};
