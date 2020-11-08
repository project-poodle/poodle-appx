const db = require('../db/db')
const passport = require('passport')
const BasicStrategy = require('passport-http').BasicStrategy
const LocalStrategy = require('passport-local').Strategy
const BearerStrategy = require('passport-http-bearer').Strategy
const cache = require('../cache/cache')
const { REGEX_VAR }  = require('../api/util')


function findUserWithPass(username, password) {

    let sql = `SELECT
                    id,
                    realm,
                    username,
                    user_spec,
                    deleted
                FROM _realm_user
                WHERE realm='appx'
                AND username=?
                AND password=PASSWORD(?)
                AND deleted=0`

    let result = db.query_sync(sql, [username, password])

    if (!result || result.length == 0) {
        //console.log(`findUserWithPass failed !`)
        //console.log(`${sql}, [${username}, ${password}]`)
        return null
    } else {
        //console.log(`findUserWithPass success !`)
        return {
            domain: result[0].domain,
            username: result[0].username,
            user_info: result[0].user_info
        }
    }
}

function findToken(token) {

    let sql = `SELECT
                    id,
                    domain,
                    token,
                    username,
                    token_info,
                    deleted
                FROM _token
                WHERE domain='appx'
                AND token=?
                AND deleted=0`

    let result = db.query_sync(sql, [token])

    if (!result || result.length == 0) {
        //console.log(`findLocalToken failed !`)
        //console.log(`${sql}, [${token}]`)
        return null
    } else {
        //console.log(`findLocalToken success !`)
        return {
            domain: result[0].domain,
            token: result[0].token,
            username: result[0].username,
            token_info: result[0].token_info
        }
    }
}

// basic auth
passport.use(new BasicStrategy(
    function(username, password, done) {
        try {
            let user = findUserWithPass(username, password)
            if (user == null) {
                done(null, false)
            } else {
                done(null, user)
            }
        } catch (err) {
            done(err)
        }
    }
))

// bearer strategy
passport.use(new BearerStrategy(
    function(token, done) {
        try {
            let user = findLocalToken(token)
            if (user == null) {
                done(null, false)
            } else {
                done(null, user, { scope: 'all' })
            }
        } catch (err) {
            done(err)
        }
    }
))

// local strategy
passport.use(new LocalStrategy(
    {
        usernameField: 'username',
        passwordField: 'password'
    },
    function(username, password, done) {
        try {
            let user = findUserWithPass(username, password)
            if (user == null) {
                done(null, false)
            } else {
                done(null, user)
            }
        } catch (err) {
            done(err)
        }
    })
)


// serialize
//passport.serializeUser(function(user, done) {
//    done(null, user);
//})

// deserialize
//passport.deserializeUser(function(user, done) {
//    try {
//        let user = findLocalUser(username)
//        if (user == null) {
//            done(null, false)
//        } else {
//            done(null, user)
//        }
//    } catch (err) {
//        done(err)
//    }
//})

// authenticator will choose between different strategies
const authenticator = function (req, res, next) {

    const realm_by_app = cache.get_cache_for('realm').realm_by_app
    const app_by_realm = cache.get_cache_for('realm').app_by_realm
    const realm_module = cache.get_cache_for('realm').realm_module

    // console.log(realm_by_app)
    // console.log(app_by_realm)
    // console.log(realm_module)

    // compute current url
    let url = req.url
    if (! url) {
        url = req.originalUrl.substring(req.baseUrl.length)
    }

    let realm = null
    let match = url.match(new RegExp(`(\/(${REGEX_VAR})\/(${REGEX_VAR})\/)`))
    if (match) {
        let namespace = match[2]
        let app_name = match[3]
        if (namespace in realm_by_app && app_name in realm_by_app[namespace] && 'realm' in realm_by_app[namespace][app_name]) {
            realm = realm_by_app[namespace][app_name]['realm']
        }
        if (!realm) {
            res.status(401).send(`ERROR: Authentication Realm NOT configured for [${namespace}/${app_name}]`)
            return
        }
    } else {
        res.status(401).send(`ERROR: Cannot determine Authentication Realm -- Missing namespace or app_name in url [${url}]`)
        return
    }

    // request authentication for specific realm
    if (!req.headers.authorization) {
        res.set('WWW-Authenticate', `Basic realm="${realm}"`)
        res.status(401).send(`Authentication required for realm [${realm}]`)
        return
    }

    // console.log(req.headers.authorization)
    if (req.headers.authorization.match(/Basic/i)) {

        let strategy = passport.authenticate('basic', { session: false })
        strategy(req, res, next)

    } else if (req.headers.authorization.match(/^Bearer/i)) {

        let strategy = passport.authenticate('bearer', { session: false })
        strategy(req, res, next)

    } else {

        return res.status(403).json({ status: 'error', message: 'unauthorized' });
    }
}

// exports
module.exports = {
    passport: passport,
    authenticator: authenticator
}
