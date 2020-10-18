const fs = require('fs');
const mysql = require('mysql');
const { ArgumentParser } = require('argparse');


const parser = new ArgumentParser({
  description: 'evaluate mysql commands'
});

parser.add_argument('-f', '--conf', { help: 'mysql config file', required: true });
parser.add_argument('-p', '--path', { help: 'mysql command file path' });
parser.add_argument('-c', '--command', { help: 'mysql command lines' });

args = parser.parse_args();


let value = ""
if (args.path == undefined && args.command == undefined) {

    console.error("ERROR: either path or command is required !")
    process.exit(1)

} else if (args.path != undefined && args.command != undefined ) {

    console.error("ERROR: cannot have both path and command at the same time !")
    process.exit(1)

} else if (args.path != undefined) {

    if (!fs.existsSync(args.path)) {
        console.error("ERROR: path file does not exist [" + args.path + "] !")
        process.exit(1)
    } else {
        value = fs.readFileSync(args.path, 'utf8')
    }

} else if (args.command != undefined) {

    value = args.command

} else {

    console.error("ERROR: THIS SHOULD NEVER HAPPEN !")
    process.exit(1)
}


if (!fs.existsSync(args.conf)) {
    console.error("ERROR: mysql config file do not exist [" + args.conf + "] !")
    process.exit(1)
}

let mysql_conf = JSON.parse(fs.readFileSync(args.conf, 'utf8'))

var conn = mysql.createConnection({
    host: mysql_conf.host,
    port: mysql_conf.port,
    user: mysql_conf.user,
    password: mysql_conf.pass
})
