const fs = require('fs');
const mysql = require('mysql');
const YAML = require('yaml');
const { ArgumentParser } = require('argparse');

const DEFAULT_MAX_RETRIES = 9

// sleep
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const parser = new ArgumentParser({
  description: 'evaluate mysql commands'
});

parser.add_argument('-c', '--conf',         { help: 'mysql config file', required: true });
parser.add_argument('-f', '--filepath',     { help: 'mysql command(s) filepath' });
parser.add_argument('-e', '--execute',      { help: 'execute mysql command line' });
parser.add_argument('-p', '--print',        { action: 'store_true', help: 'print command' });
parser.add_argument('-j', '--json',         { action: 'store_true', help: 'print JSON results' });
parser.add_argument('-y', '--yaml',         { action: 'store_true', help: 'print YAML results' });
parser.add_argument('-b', '--top_obj',      { help: 'top object for results' });
parser.add_argument('-r', '--max_retries',  { help: 'max retry count' });

args = parser.parse_args();


let commands = []
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
        let content = fs.readFileSync(args.filepath, 'utf8')
        commands = content.toString().split(/;\s*\n/);
    }

} else if (args.execute != undefined) {

    commands.push(args.execute)

} else {

    console.error("ERROR: THIS SHOULD NEVER HAPPEN !")
    process.exit(1)
}

if (!fs.existsSync(args.conf)) {
    console.error("ERROR: mysql config file do not exist [" + args.conf + "] !")
    process.exit(1)
}

let mysql_conf = JSON.parse(fs.readFileSync(args.conf, 'utf8'))
// console.error(mysql_conf)

////////////////////////////////////////////////////////////////////////////////
// db connection
let conn = null
// get async synchronous method
let query_async = function(sql, variables) {
    return new Promise((resolve, reject) => {
        conn.query(sql, variables, (error, result) => {
            if (!!error) {
                reject(error)
            } else {
                // console.error(`RESOLVE !!!`)
                resolve(result || [])
            }
        })
    })
}

////////////////////////////////////////////////////////////////////////////////
// get a random host
function get_host_or_random(input) {
    if (typeof input === 'object' && Array.isArray(input.list)) {
      const random = Math.floor(Math.random() * input.list.length);
      return input.list[random]
    } else {
      return input
    }
}

// utility method
function get_random_between(min, max) {
    return min + Math.random() * Math.abs(max - min)
}

// async run method
async function run() {
    ////////////////////////////////////////////////////////////////////////////////
    // max retries
    const max_retries = !!args.max_retries ? args.max_retries : DEFAULT_MAX_RETRIES
    for (let i=0; i<max_retries; i++) {

        try {

            const chosen_host = get_host_or_random(mysql_conf.host)

            conn = mysql.createConnection({
                host: chosen_host,
                port: mysql_conf.port,
                user: mysql_conf.user,
                password: mysql_conf.pass,
                typeCast: function(field, next) {
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
            })

            console.error(`INFO: [DB] connecting to ${chosen_host}...`)

            ////////////////////////////////////////////////////////////////////////////////
            // execute sql commands
            for (const command of commands) {

                try {

                    // skip empty command
                    if (command.trim() == "") {
                        continue
                    }

                    // execute query
                    let results = await query_async(command, [])

                    // print command
                    if (args.print) {
                        console.log(`INFO: success! [${command}]`)
                    }

                    // print json result
                    if (args.json) {
                        if (args.top_obj) {
                          const output = {}
                          output[args.top_obj] = results
                          console.log(JSON.stringify(output, null, 2))
                        } else {
                          console.log(JSON.stringify(results, null, 2))
                        }
                    }

                    // print yaml result
                    if (args.yaml) {
                        if (args.top_obj) {
                          const output = {}
                          output[args.top_obj] = results
                          console.log(YAML.stringify(output, null, 2))
                        } else {
                          console.log(YAML.stringify(results, null, 2))
                        }
                    }

                } catch (error) {

                    if (error.fatal) {
                        // connection error, retry
                        // console.error(error)
                        throw error

                    } else {
                        console.error(`ERROR: [${command}]` + (error.length > 255 ? error.substring(0,255) : error));
                        process.exit(1);
                    }
                }
            }

            try {
              const end = async function() {
                // console.error(`end`)
                conn.end()
              }
              await end()
            } catch (error) {
              // ignore
            }

            // success, exit 0
            await(sleep(300))
            process.exit(0)

        } catch (error) {

            console.error(error)
            if (error.fatal) {
                // for connection errors
                const sleep_ms = Math.round(get_random_between(1, 500) + 500 * i)
                if (i < max_retries - 1) {
                    console.error(`ERROR: connection error [${i+1}] [${error.toString()}], retry in [${sleep_ms} ms] ...`)
                } else {
                    console.error(`ERROR: connection error [${error.toString()}], query terminated.`)
                }
                await sleep(sleep_ms)

            } else {
                // for all other errors, just quit
                process.exit(1)
            }
        }
    }

    // we are here all retries has failed
    process.exit(1)
}

run()
