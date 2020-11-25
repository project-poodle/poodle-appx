const fs = require('fs')
const path = require('path');

//////////////////////////////////////////////////
// process cli arguments
const { ArgumentParser } = require('argparse')
const parser = new ArgumentParser({
    description: 'launch appx rest api server'
});

parser.add_argument('-c', '--conf', { help: 'mysql config file', required: true });
args = parser.parse_args();

let db_conf_options = JSON.parse(fs.readFileSync(args.conf))

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
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
//const session = require("express-session")
//const MySQLStore = require('express-mysql-session')(session);

// express app
const app = express()
//app.use(cookieParser)
//app.configure(function() {
//    app.use(express.cookieParser())
//})

/*
// initialize sessions
let sessionStore = new MySQLStore(db_conf_options);
app.use(session({
    store: sessionStore,
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}))
*/

//////////////////////////////////////////////////
// initialize authenticator --- Note: perform this step only after db_pool is initialized
const { authenticator } = require("./src/auth")
//app.use(passport.initialize())
//app.use(passport.session())

//////////////////////////////////////////////////
// initialize router --- Note: perform this step only after db_pool is initialized
const { api_dispatcher } = require('./src/api/api_dispatcher')

app.use('/appx/api', bodyParser.json())
app.use('/appx/api', authenticator, api_dispatcher)

//////////////////////////////////////////////////
// initialize ui router --- Note: perform this step only after db_pool is initialized
const { ui_dispatcher } = require('./src/ui/ui_dispatcher')

app.use('/appx/ui', ui_dispatcher)

//////////////////////////////////////////////////
// static files
const rootDir = path.join(__dirname, '../ui/')
app.use('/',
    express.static(rootDir),
    (req, res, next) => {
        let url_comps = req.url.split('/')
        //console.log(url_comps)
        if (url_comps.length > 1 && fs.existsSync(path.join(rootDir, url_comps[1]))) {
            next()
        } else {
            res.type('html').sendFile(path.join(rootDir, 'index.html'))
        }
    }
)

//////////////////////////////////////////////////
// start listening
var server = app.listen(3000, () => {
    console.log(`INFO: appx rest api server listening at http://${server.address().address}:${server.address().port}`)
})
