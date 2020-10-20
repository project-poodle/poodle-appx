const fs = require('fs');
const mysql = require('mysql');
const db = require('./src/db/db')
const { ArgumentParser } = require('argparse');

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

app.get('/', (req, res) => {
    res.send('Hello World!')
})

var server = app.listen(3000, () => {
    console.log(`INFO: appx rest api server listening at http://${server.address().address}:${server.address().port}`)
})
