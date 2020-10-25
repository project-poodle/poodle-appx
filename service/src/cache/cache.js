const fs = require('fs');
const YAML = require('yaml')
const db = require('../db/db')
const { sql_load } = require('../transform/sql_load')
const { json_transform } = require('../transform/json_transform')


//console.log('input')
let input = sql_load(__dirname + "/model.input.yaml")
//console.log(JSON.stringify(input, null, 4))

//console.log('transform')
let transform = YAML.parse(fs.readFileSync(__dirname + "/model.transform.yaml", 'utf8'))
//console.log(JSON.stringify(transform, null, 4))

let result = json_transform(transform, input)
console.log(JSON.stringify(result, null, 4))
