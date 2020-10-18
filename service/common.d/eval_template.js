const fs = require('fs');
const YAML = require('yaml');
const Mustache = require('mustache');
const { ArgumentParser } = require('argparse');


const parser = new ArgumentParser({
  description: 'evaluate template'
});

parser.add_argument('-t', '--template', { help: 'template file', required: true });
parser.add_argument('-y', '--yaml', { help: 'yaml value file' });
parser.add_argument('-j', '--json', { help: 'json value file' });

args = parser.parse_args();


let value = {}
if (args.yaml == undefined && args.json == undefined) {

    console.error("ERROR: either yaml or json is required !")
    process.exit(1)

} else if (args.yaml != undefined && args.json != undefined ) {

    console.error("ERROR: cannot have both yaml and json at the same time !")
    process.exit(1)

} else if (args.yaml != undefined) {

    if (!fs.existsSync(args.yaml)) {
        console.error("ERROR: yaml file does not exist [" + args.yaml + "] !")
        process.exit(1)
    } else {
        value = YAML.parse(fs.readFileSync(args.yaml, 'utf8'))
    }

} else if (args.json != undefined) {

    if (!fs.existsSync(args.json)) {
        console.error("ERROR: json file does not exist [" + args.json + "] !")
        process.exit(1)
    } else {
        value = JSON.parse(fs.readFileSync(args.json, 'utf8'))
    }

} else {

    console.error("ERROR: THIS SHOULD NEVER HAPPEN !")
    process.exit(1)
}


if (!fs.existsSync(args.template)) {
    console.error("ERROR: template file do not exist [" + args.template + "] !")
    process.exit(1)
}

let template = fs.readFileSync(args.template, 'utf8')


let rendered = Mustache.render(template, value);
console.log(rendered)
