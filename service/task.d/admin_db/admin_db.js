const fs = require('fs');
const mysql = require('mysql');
const { ArgumentParser } = require('argparse');
const { version } = require('../../package.json');

const parser = new ArgumentParser({
  description: 'database admin procedure'
});

parser.add_argument('-v', '--version', { action: 'version', version });
parser.add_argument('-f', '--mysql_admin_file', { help: 'mysql admin config file' });

args = parser.parse_args();

mysql_conf = JSON.parse(fs.readFileSync(args['mysql_admin_file']));

var connection = mysql.createConnection({
    host: mysql_conf.host,
    port: mysql_conf.port,
    user: mysql_conf.user,
    password: mysql_conf.pass
})

console.log(connection)
