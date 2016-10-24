const bcrypt = require('bcrypt-nodejs');

module.exports = function(sequelize, DataTypes) {
    var User = sequelize.define('User', {
        flag: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
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
            validPassword: function(password, passwd, done, user) {
                bcrypt.compare(password, passwd, function(err, isMatch) {

                    if (err) console.log(err)
                    if (isMatch) {
                        return done(null, user);
                    } else {
                        return done(null, false);
                    }
                });
            }
        }
    }, {
        dialect: 'mysql'
    });

    User.hook('beforeCreate', function(user, fields, fn) {
        const salt = bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
            return salt;
        });
        bcrypt.hash(user.password, salt, null, function(err, hash) {
            if (err) return err;

            user.password = hash;
            return fn(null, user);
        });
    });

    return User;
};
