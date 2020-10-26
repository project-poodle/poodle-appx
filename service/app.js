//const fs = require('fs')
//const mysql = require('mysql')

//////////////////////////////////////////////////
// process cli arguments
const { ArgumentParser } = require('argparse')
const parser = new ArgumentParser({
    description: 'launch appx rest api server'
});

parser.add_argument('-c', '--conf', { help: 'mysql config file', required: true });
args = parser.parse_args();

//////////////////////////////////////////////////
// check database connectivity
const db = require('./src/db/db')
let db_pool = db.getPool(args.conf)

//////////////////////////////////////////////////
// load cache to memory
const cache = require('./src/cache/cache')

//////////////////////////////////////////////////
// initialize express
const express = require('express')
const app = express()

//////////////////////////////////////////////////
// initialize router --- Note: perform this step only after db_pool is initialized
const { dispatcher } = require('./src/rest/dispatcher')

app.use('/api', dispatcher)

// console.log(app._router.stack)

//////////////////////////////////////////////////
// start listening
var server = app.listen(3000, () => {
    console.log(`INFO: appx rest api server listening at http://${server.address().address}:${server.address().port}`)
})
