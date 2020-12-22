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

var query = (sql, variables, callback, query_conn_retries=4) => {

    // console.log(`INFO: [${sql}]`)
    getPool().query(sql, variables, (error, results, fields) => {

        if (error) {
            console.log(`ERROR: [${sql}] -- ${error.toString()} [${query_conn_retries}]`)
            // check if error is operation error
            // https://github.com/mysqljs/mysql#error-handling
            // err.fatal:
            //      Boolean, indicating if this error is terminal to the connection object.
            //      If the error is not from a MySQL protocol operation, this property will not be defined.
            if (error.fatal) {
                query_conn_retries = query_conn_retries - 1
                if (query_conn_retries > 0) {
                    // retry connection
                    console.log(`INFO: retry for connection error [${sql}] -- ${error.toString()} [${query_conn_retries}]`)
                    // if yes, release the pool, and retry
                    db_pool.end(function (err) {
                        if (err) {
                            console.log(`ERROR: db_pool.end failed [${err.toString()}] [${query_conn_retries}]`)
                        }
                    })
                    // sleep between 500 to 1000 ms
                    const sleep_ms = get_random_between(500, 1000)
                    console.log(`INFO: db_pool sleep [${sleep_ms}] ms before retry [${query_conn_retries}] ...`)
                    deasync.sleep(sleep_ms)
                    // re-establish connection, and try again
                    query(sql, variables, callback, query_conn_retries)
                } else {
                    // we have exhausted all the retry count
                    console.log(`ERROR: all connection retries has failed [${sql}] -- ${error.toString()}`)
                    if (callback) {
                      callback(error, null)
                    }
                }
            } else {
                // for non connection error, callback error message immediately without retries
                if (callback) {
                  callback(error, null)
                }
            }
        } else {
            // callback
            if (callback) {
                if (fields) {
                    callback(error, results, fields)
                } else {
                    callback(error, results)
                }
            }
        }
    })
}

module.exports = {

    getPool: getPool,

    query: query,

    query_sync: deasync(query)
}
