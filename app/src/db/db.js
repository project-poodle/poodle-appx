const fs = require('fs');
const mysql = require('mysql');
const deasync = require('deasync');

const DEFAULT_POOL_SIZE = 15;

var db_pool = null;
var conf_file = null;

var getPool = (mysql_conf_file) => {

    if (db_pool == null) {

        if (conf_file == null) {
            conf_file = mysql_conf_file
        }

        mysql_conf = JSON.parse(fs.readFileSync(conf_file, 'utf8'))

        db_pool = mysql.createPool({
            connectionLimit : ('appx_node_pool' in mysql_conf ? mysql_conf['appx_node_pool'] : DEFAULT_POOL_SIZE),
            host            : mysql_conf.host,
            port            : mysql_conf.port,
            user            : mysql_conf.user,
            password        : mysql_conf.pass,
            database        : mysql_conf.schema_prefix,
            typeCast        : function(field, next) {
                if ((field.type == 'BLOB' || field.type == 'JSON') && field.length == 4294967295) {
                    let value = field.string();
                    try {
                        return JSON.parse(value);
                    } catch (e) {
                        return value;
                    }
                }
                return next();
            }
        });
    }

    return db_pool
}

// utility method
function get_random_between(min, max) {
    return min + Math.random() * Math.abs(max - min)
}

var query = (sql, variables, callback) => {

    // console.log(`INFO: [${sql}]`)
    getPool().query(sql, variables, (error, results, fields) => {

        if (error) {
            console.log(`ERROR: [${sql}] -- ${error.toString()}`)
            // check if error is operation error
            // https://github.com/mysqljs/mysql#error-handling
            // err.fatal:
            //      Boolean, indicating if this error is terminal to the connection object.
            //      If the error is not from a MySQL protocol operation, this property will not be defined.
            if (error.fatal) {
                console.log(`INFO: retry connection error [${sql}] -- ${error.toString()}`)
                // if yes, release the pool, and retry
                db_pool.end(function (err) {
                    if (err) {
                        console.log(`ERROR: db_pool.end failed [${err.toString()}]`)
                    }
                });
                // sleep between 150 to 300 ms
                deasync.sleep(get_random_between(150, 300))
                // re-establish connection, and try again
                try {
                    db_pool = null
                    getPool().query(sql, variables, (error, results, fields) => {
                        if (error) {
                            console.log(`ERROR: unrecoverable error [${sql}] -- ${error.toString()}`)
                        }
                        // callback
                        if (callback) {
                            if (fields) {
                                callback(error, results, fields)
                            } else {
                                callback(error, results)
                            }
                        }
                    })
                } catch (err) {
                    console.log(`ERROR: failed to re-execute query [${err.toString()}]`)
                    if (callback) {
                        callback(err, null)
                    }
                } finally {
                    // callback should have already been called, just return
                    return
                }
            }
        }
        // callback
        if (callback) {
            if (fields) {
                callback(error, results, fields)
            } else {
                callback(error, results)
            }
        }
    })
}

module.exports = {

    getPool: getPool,

    query: query,

    query_sync: deasync(query)
}
