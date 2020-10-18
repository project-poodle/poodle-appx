const fs = require('fs');
const mysql = require('mysql');
const { ArgumentParser } = require('argparse');


const parser = new ArgumentParser({
  description: 'evaluate mysql commands'
});

parser.add_argument('-c', '--conf', { help: 'mysql config file', required: true });
parser.add_argument('-f', '--filepath', { help: 'mysql command(s) filepath' });
parser.add_argument('-e', '--execute', { help: 'execute mysql command line' });

args = parser.parse_args();


let commands = ""
if (args.filepath == undefined && args.execute == undefined) {

    console.error("ERROR: either filepath or execute is required !")
    process.exit(1)

} else if (args.filepath != undefined && args.execute != undefined ) {

    console.error("ERROR: cannot have both filepath and execute at the same time !")
    process.exit(1)

} else if (args.filepath != undefined) {

    if (!fs.existsSync(args.filepath)) {
        console.error("ERROR: path file does not exist [" + args.filepath + "] !")
        process.exit(1)
    } else {
        commands = fs.readFileSync(args.filepath, 'utf8')
    }

} else if (args.execute != undefined) {

    commands = args.execute

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

conn.query(commands, function (error, results, fields) {
  if (error) {
      console.log(error);
      process.exit(1);
  }
  console.log(results);
});

conn.end();
