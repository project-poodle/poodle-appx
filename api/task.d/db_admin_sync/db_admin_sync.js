const fs = require('fs');
const mysql = require('mysql');
const { ArgumentParser } = require('argparse');

const parser = new ArgumentParser({
  description: 'database admin sync process'
});

parser.add_argument('-c', '--conf', { help: 'mysql admin config file' });

args = parser.parse_args();

mysql_conf = JSON.parse(fs.readFileSync(args['conf']));

var pool = mysql.createPool({
    connectionLimit: 10,
    host: mysql_conf.host,
    port: mysql_conf.port,
    user: mysql_conf.user,
    password: mysql_conf.pass
})

var count_schemas = -1
var count_success = 0
var count_failure = 0

let pattern = mysql_conf.schema_prefix + '%'
pool.query('SHOW DATABASES LIKE "' + pattern + '"', function (error, results) {
    if (error) {
        console.log(error);
        process.exit(1);
    }
    // console.log(results)
    count_schemas = results.length
    // loop through all databases
    results.forEach((result, i) => {
        // grant privileges to mysql_conf.node_user
        let grant_sql = 'GRANT ALL PRIVILEGES ON `' + result[Object.keys(result)[0]] + '`.* TO "' + mysql_conf.mysql_node_user + '"@"%"'
        pool.query(grant_sql, function (error, results) {
            if (error) {
                count_failure += 1
                console.log('ERROR: ' + grant_sql + ' --- Failure !')
                console.log(grant_sql)
                console.log(error);
            } else {
                count_success += 1
                console.log('INFO: ' + grant_sql + ' --- Success !')
                //console.log(results);
            }
        });
    });
});

function check() {
    console.log(`INFO: db_admin_sync status: schemas: ${count_schemas}, success: ${count_success}, failure: ${count_failure}`)
    if (count_schemas < 0 || count_success + count_failure < count_schemas) {
        setTimeout(check, 500)
    } else if (count_failure > 0) {
        pool.end()
        process.exit(1)
    } else {
        pool.end()
        process.exit(0)
    }
}

setTimeout(check, 500);

//pool.end();
