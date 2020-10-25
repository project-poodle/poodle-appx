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
                if (field.type == 'BLOB' && field.length == 4294967295) {
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

var query = (sql, variables, callback) => {

    // console.log(`INFO: [${sql}]`)
    getPool().query(sql, variables, (error, results, fields) => {
        if (error) {
            console.log(`ERROR: [${sql}] -- ${error}`)
        }
        // callback
        if (typeof fields == 'undefined') {
            callback(error, results)
        } else {
            // console.log(fields)
            callback(error, results, fields)
        }
    })
}

module.exports = {

    getPool: getPool,

    query: query,

    query_sync: deasync(query)
}
