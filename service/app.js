const fs = require('fs')
const mysql = require('mysql')
const db = require('./src/db/db')
const { ArgumentParser } = require('argparse')

const parser = new ArgumentParser({
    description: 'launch appx rest api server'
});

parser.add_argument('-c', '--conf', { help: 'mysql config file', required: true });
args = parser.parse_args();

//////////////////////////////////////////////////
// check database connectivity
let db_pool = db.getPool(args.conf)

//////////////////////////////////////////////////
// initialize express
const express = require('express')
const app = express()

//////////////////////////////////////////////////
// initialize router --- Note: perform this step only after db_pool is initialized
const { router, endpoints } = require('./src/rest/router')

app.use('/api', router)
app.get('/doc', (req, res) => {
    res.send(JSON.stringify(endpoints, null, 4))
})

var server = app.listen(0, () => {
    console.log(`INFO: appx rest api server listening at http://${server.address().address}:${server.address().port}`)
})
