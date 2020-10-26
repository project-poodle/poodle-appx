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
const { router, endpoints } = require('./src/rest/router')

app.use('/api', router)
app.get('/doc', (req, res) => {
    // console.log(req.route)
    res.send(JSON.stringify(endpoints, null, 4))
})

// console.log(app._router.stack)

//////////////////////////////////////////////////
// start listening
var server = app.listen(0, () => {
    console.log(`INFO: appx rest api server listening at http://${server.address().address}:${server.address().port}`)
})
