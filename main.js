const nconf = require('nconf')

nconf.argv()
    .env()
    .file({ file: 'config/test.json' })

// start the user REST API server
const api = require('./api')

const port = process.env.PORT || 3000;

function startApp() {
    api.listen(port, () => {
        console.log(`Server running on port ${port}`)
    });
}

//Create model table and admin account
db
    .sequelize
    .sync({ force: true })
    .then(function(data) {
        console.log("Drop old tables if found else sync models");
        startApp();
    })
    .catch(function(err) {
        throw Error(err);
    });
