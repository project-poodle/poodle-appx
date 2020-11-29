const fs = require('fs')
const util = require('util')
const objPath = require('object-path')
const YAML = require('yaml')
const Mustache = require('mustache')
const { ArgumentParser } = require('argparse')

const MAX_COUNT = 20

const parser = new ArgumentParser({
  description: 'evaluate template with one or more input variable files (YAML or JSON)'
});

parser.add_argument('-t',       '--template',       { help: 'template file', required: true });
for (let i = 1; i < MAX_COUNT; i++) {
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
    console.error("ERROR: template file does NOT exist [" + args.template + "] !")
    process.exit(1)
}

let template = fs.readFileSync(args.template, 'utf8')


// process variables
let variables = {

    "APPX": {

        /*
         * --- template file ---
         * {{#APPX}}
         * {{#parent}}
         * {{#DOT_KEY}}child.key.with.dot{{/DOT_KEY}}
         * {{/parent}}
         * {{/APPX}}
         *
         * --- yaml input file ---
         * parent:
         *     child.key.with.dot: child.value.with.dot
         *
         * --- output ---
         * child.value.with.dot
         *
         */
        "DOT_KEY": function() {
            return function(text, render) {
                return objPath.get(this, [text], "")
            }
        },

        "TO_MYSQL_JSON": function() {

            let render_func = function(data, depth) {

                if (typeof data == null || typeof data == "undefined") {
                    return 'null';
                } else if (typeof data == "number") {
                    return data.toString()
                } else if (typeof data == "boolean") {
                    return data.toString()
                } else if (typeof data == "string") {
                    if (data.startsWith('`') && data.endsWith('`')) {
                        return data.substring(1, data.length-1)
                    } else {
                        return '"' + data.replace(/"/g, '\\"') + '"'
                    }
                } else if (data instanceof Array) {
                    let results = []
                    data.forEach((value) => {
                        results.push(render_func(value, depth+1))
                    });
                    return 'JSON_ARRAY(' + results.join(', ') + ')'
                } else {
                    if (data) {
                        let results = []
                        Object.keys(data).forEach((key) => {
                            results.push('"' + key + '", ' + render_func(data[key], depth+1))
                        });
                        return 'JSON_OBJECT(' + results.join(', ') + ')'
                    } else {
                        return 'null'
                    }
                }
            }

            return function(text, render) {
                return render_func(this, 0)
            }
        }
    }
}

// initialize variables
let variable_initialized = false
for (let i = 1; i < MAX_COUNT; i++) {

    // process yaml
    if (args['yaml_file'+i] != undefined) {

        if (!fs.existsSync(args['yaml_file'+i])) {
            console.error("ERROR: yaml file does not exist [" + args['yaml_file'+i] + "] !")
            process.exit(1)
        }

        if (args['yaml_scope'+i] != undefined) {
            variables[args['yaml_scope'+i]] = YAML.parse(fs.readFileSync(args['yaml_file'+i], 'utf8'))
        } else {
            variables = Object.assign({}, variables, YAML.parse(fs.readFileSync(args['yaml_file'+i], 'utf8')))
        }

        variable_initialized = true
    }

    // proces json
    if (args['json_file'+i] != undefined) {

        if (!fs.existsSync(args['json_file'+i])) {
            console.error("ERROR: json file does not exist [" + args['json_file'+i] + "] !")
            process.exit(1)
        }

        if (args['json_scope'+i] != undefined) {
            variables[args['json_scope'+i]] = JSON.parse(fs.readFileSync(args['json_file'+i], 'utf8'))
        } else {
            variables = Object.assign({}, variables, JSON.parse(fs.readFileSync(args['json_file'+i], 'utf8')))
        }

        variable_initialized = true
    }
}

if (! variable_initialized) {

    console.error("ERROR: at least one variable file, either yaml or json is required !")
    process.exit(1)
}


// evaluate template with variables
let rendered = Mustache.render(template, variables);
console.log(rendered)
