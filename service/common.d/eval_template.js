const fs = require('fs');
const YAML = require('yaml');
const Mustache = require('mustache');
const { ArgumentParser } = require('argparse');


const parser = new ArgumentParser({
  description: 'evaluate template'
});

parser.add_argument('-t',   '--template',   { help: 'template file', required: true });
for (let i = 1; i < 10; i++) {
    parser.add_argument('-y'  +i,   '--yaml_file'  +i, { help: 'yaml variable file '+i });
    parser.add_argument('-ys' +i,   '--yaml_scope' +i, { help: 'yaml variable scope '+i });
    parser.add_argument('-j'  +i,   '--json_file'  +i, { help: 'json variable file '+i });
    parser.add_argument('-js' +i,   '--json_scope' +i, { help: 'json variable scope '+i });
}
args = parser.parse_args();
//console.log(JSON.stringify(args, null, 4))
//process.exit(0)

// validate template file
if (!fs.existsSync(args.template)) {
    console.error("ERROR: template file do not exist [" + args.template + "] !")
    process.exit(1)
}

let template = fs.readFileSync(args.template, 'utf8')


// process variables
let variables = {}
let initialized = false

for (let i = 1; i < 10; i++) {
    // process yaml
    if (args['yaml_file'+i] != undefined) {

        if (!fs.existsSync(args['yaml_file'+i])) {
            console.error("ERROR: yaml file does not exist [" + args['yaml_file'+i] + "] !")
            process.exit(1)
        }

        if (args['yaml_scope'+i] != undefined) {
            variables[args['yaml_scope'+i]] = YAML.parse(fs.readFileSync(args['yaml_file'+i], 'utf8'))
        } else {
            variables = Object.assign(variables, YAML.parse(fs.readFileSync(args['yaml_file'+i], 'utf8')))
        }

        initialized = true
    }

    // proces json
    if (args['json_file'+i] != undefined) {

        if (!fs.existsSync(args.json)) {
            console.error("ERROR: json file does not exist [" + args['json_file'+i] + "] !")
            process.exit(1)
        }

        if (args['json_scope'+i] != undefined) {
            variables[args['json_scope'+i]] = JSON.parse(fs.readFileSync(args['json_file'+i], 'utf8'))
        } else {
            variables = Object.assign(variables, JSON.parse(fs.readFileSync(args['json_file'+i], 'utf8')))
        }

        initialized = true
    }
}

if (! initialized) {

    console.error("ERROR: at least one variable file, either yaml or json is required !")
    process.exit(1)
}


// evaluate template with variables
let rendered = Mustache.render(template, variables);
console.log(rendered)
