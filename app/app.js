const fs = require('fs')
const path = require('path');

//////////////////////////////////////////////////
// process cli arguments
const { ArgumentParser } = require('argparse')
const parser = new ArgumentParser({
    description: 'launch appx server'
})

parser.add_argument('-c', '--conf', { help: 'mysql config file', required: true })
parser.add_argument('-m', '--mount', { help: 'mount config file', required: true })
args = parser.parse_args()

let db_conf_options = JSON.parse(fs.readFileSync(args.conf))
let mount_options = JSON.parse(fs.readFileSync(args.mount))

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
// const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')

// express app
const app = express()
//app.use(cookieParser)
//app.configure(function() {
//    app.use(express.cookieParser())
//})

//////////////////////////////////////////////////
// recursively walk app-x path
var appx_paths = []
const staticRootDir = path.join(__dirname, '../ui/')
const { walk_recursive } = require('./src/ui/util_lookup')
walk_recursive(path.join(staticRootDir, 'app-x'), (err, results) => {
  if (err) {
    console.log(err)
    return
  }

  const result = []
  results.map(r => {
    // console.log(r)
    if (r.startsWith(staticRootDir) && r.endsWith('.js')) {
      const relPath = r.substring(staticRootDir.length)
      const importPath = relPath.substring(0, relPath.length - 3)
      console.log(`INFO: found app-x path [${importPath}]`)
      result.push(importPath)
    }
  })

  if (result.length) {
    appx_paths = result
  }
})

//////////////////////////////////////////////////
// initialize auth_dispatcher and authenticator --- Note: perform this step only after db_pool is initialized
const { auth_dispatcher, authenticator } = require("./src/auth")
////app.use(passport.initialize())
////app.use(passport.session())
// auth endpoints
app.use(mount_options.auth_root, bodyParser.json())
app.use(mount_options.auth_root,
  (req, res, next) => {
    req.mount_options = mount_options
    next()
  },
  auth_dispatcher)

//////////////////////////////////////////////////
// initialize router --- Note: perform this step only after db_pool is initialized
const { api_dispatcher } = require('./src/api/api_dispatcher')
// api endpoints
app.use(mount_options.api_root, bodyParser.json())
app.use(mount_options.api_root,
  (req, res, next) => {
    req.mount_options = mount_options
    next()
  },
  authenticator,
  api_dispatcher)

  //////////////////////////////////////////////////
  // initialize ui router --- Note: perform this step only after db_pool is initialized
  const { ui_dispatcher } = require('./src/ui/ui_dispatcher')
  // ui endpoints
  app.use(mount_options.ui_root, bodyParser.json())
  app.use(mount_options.ui_root, bodyParser.urlencoded({extended: true}))
  app.use(mount_options.ui_root,
    (req, res, next) => {
      req.mount_options = mount_options
      req.appx_paths = appx_paths
      next()
    },
    ui_dispatcher)

//////////////////////////////////////////////////
// initialize static files and launch page
// static files and launch page
app.use('/',
    (req, res, next) => {
        if (req.url.startsWith('/app-x/')
            || req.url.startsWith('/dist/')
            || req.url.startsWith('/static/')
            || req.url == '/sw.js') {
            // handle static files
            next()
        } else {
          // redirect everything else to landing page
          res.status(302).redirect(mount_options.ui_root + '/sys/console/base/')
        }
    },
    // service worker needs to be at the root
    express.static(staticRootDir)
)

//////////////////////////////////////////////////
// start listening
var server = app.listen(3000, () => {
    console.log(`INFO: appx rest api server listening at http://${server.address().address}:${server.address().port}`)
})
