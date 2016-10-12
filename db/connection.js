// https://github.com/lukeb-uk/node-promise-mysql
/* When accessing a database, it is important to not leak database
 * connections.  Generally, database connections are expensive to establish,
 * so we establish multiple of them and keep them in a pool for reuse.
 * In addition, we must be sure to release a connection when we're
 * done with it.
 * We use Promise.using, a bluebird extension, to that end:
 * http://bluebirdjs.com/docs/api/promise.using.html
 */

const mysql = require('promise-mysql');
const nconf = require('nconf')
const dbinfo = nconf.get('dbinfo')

console.log(`Connecting to db ${dbinfo.database} on host ${dbinfo.host} as user ${dbinfo.user}`);

// a wrapper around mysql.Pool https://github.com/mysqljs/mysql#pooling-connections
const pool = mysql.createPool(dbinfo)

pool.on('connection', (conn) => {
    // console.log("New connection to database was created.");
});

module.exports = {
    /* Get a new connection to be used in Promise.using() 
     * Promise.using will ensure that the connection is released back
     * into the pool no matter how the promise turns out.
     */
    get : () => {
        return pool.getConnection().disposer(function(connection) {
            pool.releaseConnection(connection);
        })
    },
    /* Shut down the underlying pool. If you don't do this, node.js
     * will not exit. */
    shutdown : () => {
        pool.end((err) => {
            if (err)
                console.dir(err);
        })
    }
}
