const crypto = require('crypto')
const objPath = require("object-path")
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const BasicStrategy = require('passport-http').BasicStrategy
const BearerStrategy = require('passport-http-bearer').Strategy
const db = require('../db/db')
const cache = require('../cache/cache')
const { REGEX_VAR }  = require('../api/util')
const { findLocalUserWithPass } = require('./auth_local')

function findToken(realm, token) {

    let sql = `SELECT
                    id,
                    realm,
                    token,
                    username,
                    token_spec,
                    deleted
                FROM _realm_token
                WHERE realm=?
                AND token=?
                AND deleted=0`

    let result = db.query_sync(sql, [realm, token])

    if (!result || result.length == 0) {
        return null
    } else {
        return {
            domain: result[0].domain,
            token: result[0].token,
            username: result[0].username,
            token_info: result[0].token_info
        }
    }
}

function findUserWithPass(realm, username, password) {

    const realm_modules = cache.get_cache_for('realm').realm_module

    if (! (realm in realm_modules)) {
        return {
            status: 'error',
            message: `Auth Module NOT configured for realm [${realm}]`
        }
    }

    let sorted_module = Object.keys(realm_modules[realm]).sort()
    for (let i=0; i<sorted_module.length; i++) {

        let realm_module = realm_modules[realm][sorted_module[i]]
        // console.log(realm_module)
        let matches = username.match(realm_module.module_pattern)
        if (matches) {

            if (realm_module.module_spec.protocol == 'local_db') {

                if (! ('auth_name_match' in realm_module.module_spec)) {
                    return {
                        status: 'error',
                        message: `local_db protocol missing [auth_name_match]`
                    }
                }
                if (! ('local_db' in realm_module.module_spec)) {
                    return {
                        status: 'error',
                        message: `local_db protocol missing [local_db]`
                    }
                }
                let local_db = realm_module.module_spec.local_db
                if (! ('table' in local_db)) {
                    return {
                        status: 'error',
                        message: `local_db protocol missing [local_db.table]`
                    }
                }

                let table = local_db.table
                let fields = {
                    realm: objPath.get(local_db, 'field.realm', 'realm'),
                    username: objPath.get(local_db, 'field.username', 'username'),
                    password: objPath.get(local_db, 'field.password', 'password'),
                    user_spec: objPath.get(local_db, 'field.user_spec', 'user_spec')
                }

                let user = findLocalUserWithPass(realm, username, password, table, fields)

                return user

            } else if (realm_module.module_spec.protocol == 'ldap') {
                found = true
                if (! ('auth_name_match' in realm_module.module_spec)) {
                    res.status(422).json({status: 'error', message: `ldap protocol missing [auth_name_match]`})
                    return
                }
                if (! ('ldap' in realm_module.module_spec)) {
                    res.status(422).json({status: 'error', message: `ldap protocol missing [ldap]`})
                    return
                }
            } else {

            }
        }
    }
}

function authenticateUserWithPass(req, res, next) {

    try {
        // console.log(req.body)
        if (! ('realm' in req.body)) {
            res.status(422).json({status: 'error', message: 'missing realm'})
            return
        } else if (! ('username' in req.body)) {
            res.status(422).json({status: 'error', message: 'missing username'})
            return
        } else if (! ('password' in req.body)) {
            res.status(422).json({status: 'error', message: 'missing password'})
            return
        }

        const realm_module = cache.get_cache_for('realm').realm_module

        let realm = req.body.realm
        let username = req.body.username
        let password = req.body.password

        let user = findUserWithPass(realm, username, password)

        if (user && user.user && user.status == 'ok') {

            console.log(`INFO: user [${username}] authenticated successfully`)
            crypto.randomBytes(64, function(err, buffer) {

                let token = buffer.toString('base64')
                let token_spec = {
                    user_spec: user.user.user_spec
                }

                let sql = `INSERT INTO
                                _realm_token (realm, token, username, expiration, token_spec)
                                VALUES (?, ?, ?, NOW() + INTERVAL 8 HOUR, ?)`

                // console.log(sql, [realm, token, username, JSON.stringify(token_spec)])
                db.query_sync(sql, [realm, token, username, JSON.stringify(token_spec)])
                res.status(200).json({status: 'ok', token: token})
            })

        } else {

            res.status(422).json(user)
            return

        }

    } catch (err) {

        res.status(422).json({status: 'error', message: `${err}`})
        return

    }
}

/*
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
*/

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

    let parts = req.headers.authorization.match(/^([a-zA-Z0-9]+) (.+)$/i)
    if (! parts) {
        res.set('WWW-Authenticate', `Basic realm="${realm}"`)
        res.status(401).send(`Authentication token unrecognized [${req.headers.authorization}]`)
        return
    }

    let auth_type = parts[1].trim()
    let auth_token = parts[2].trim()

    if (auth_type.toUpperCase() == 'AppX'.toUpperCase()) {

        try {
            let token = findToken(realm, auth_token)
            if (token == null) {
                res.set('WWW-Authenticate', `Basic realm="${realm}"`)
                res.status(401).json({ status: 'error', message: `Invalid Token` })
                return
            } else {
                req.user = token.user
                next()
            }
        } catch (err) {
            res.set('WWW-Authenticate', `Basic realm="${realm}"`)
            res.status(401).json({ status: 'error', message: `${err}` })
            return
        }

    } else if (auth_type.toUpperCase() == 'Basic'.toUpperCase()) {

        try {
            let credentials = Buffer.from(parts[2], 'base64').toString().split(':')
            if (credentials.length < 2) {
                res.set('WWW-Authenticate', `Basic realm="${realm}"`)
                res.status(401).send(`Basic auth token unrecognized [${req.headers.authorization}]`)
                return
            }

            let user = findUserWithPass(realm, credentials[0], credentials[1])
            if (user && user.user && user.status == 'ok') {
                req.user = user
                next()
            } else {
                res.set('WWW-Authenticate', `Basic realm="${realm}"`)
                res.status(401).json(user)
                return
            }
        } catch (err) {
            res.set('WWW-Authenticate', `Basic realm="${realm}"`)
            res.status(401).json({ status: 'error', message: `${err}` })
            return
        }

    } else if (auth_type.toUpperCase() == 'Bearer'.toUpperCase()) {

        let strategy = passport.authenticate('bearer', { session: false })
        strategy(req, res, next)

    } else {

        res.set('WWW-Authenticate', `Basic realm="${realm}"`)
        res.status(401).json({ status: 'error', message: 'Unauthorized' })
        return
    }

}

// exports
module.exports = {
    authenticator: authenticator,
    authenticateUserWithPass: authenticateUserWithPass,
    findUserWithPass: findUserWithPass
}
