const objPath = require("object-path")
const express = require('express')
//const db = require('../db/db')
const { SUCCESS, FAILURE, REGEX_VAR }  = require('../api/util')
const cache = require('../cache/cache')
const { findToken, findUserWithPass, loginUserWithPass, logoutUser, lookupRolesPerms } = require('./util')

// handle login
async function _handle_login(req, res) {
    try {
        if (!req.body) {
            res.status(422).json({
                status: FAILURE,
                message: `ERROR: missing request body [${JSON.stringify(req.body)}]`
            })
            return
        }

        if (! ('realm' in req.body)) {
            res.status(422).json({
                status: FAILURE,
                message: `ERROR: missing realm in request body [${JSON.stringify(req.body)}]`
            })
            return
        }

        if (! ('username' in req.body)) {
            res.status(422).json({
                status: FAILURE,
                message: `ERROR: missing username in request body [${JSON.stringify(req.body)}]`
            })
            return
        }

        if (! ('password' in req.body)) {
            res.status(422).json({
                status: FAILURE,
                message: `ERROR: missing password in request body [${JSON.stringify(req.body)}]`
            })
            return
        }

        await loginUserWithPass(req, res)
        return

    } catch (err) {
        console.log(err)
        res.status(401).json({ status: FAILURE, message: `${err}` })
        return
    }
}

// handle logout
async function _handle_logout(req, res) {
    try {
        if (! ('realm' in req.body)) {
            res.status(422).json({
                status: FAILURE,
                message: `ERROR: missing realm in request body [${JSON.stringify(req.body)}]`
            })
            return
        }

        if (! ('username' in req.body)) {
            res.status(422).json({
                status: FAILURE,
                message: `ERROR: missing username in request body [${JSON.stringify(req.body)}]`
            })
            return
        }

        /*
        if (! ('token' in req.body)) {
            res.status(422).json({
                status: FAILURE,
                message: `ERROR: missing token in request body [${JSON.stringify(req.body)}]`
            })
            return
        }
        */

        // realm
        const realm = req.body.realm

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

            let token = findToken(realm, auth_token)
            if (token == null) {

                // do not request basic authentication if user specified AppX bearer
                res.status(401).json({ status: 'error', message: `Invalid Token` })
                return
            }

            req.body.token = auth_token
            req.body.realm = token.realm
            req.body.username = token.username

        } else if (auth_type.toUpperCase() == 'Basic'.toUpperCase()) {

            let credentials = Buffer.from(parts[2], 'base64').toString().split(':')
            if (credentials.length < 2) {
                res.set('WWW-Authenticate', `Basic realm="${realm}"`)
                res.status(401).send(`Basic auth token unrecognized [${req.headers.authorization}]`)
                return
            }

            let result = findUserWithPass(realm, credentials[0], credentials[1])
            if (result == null) {

                res.set('WWW-Authenticate', `Basic realm="${realm}"`)
                res.status(401).json(result)
                return
            }

            // no logout support for basic auth
            res.status(422).json({ status: 'error', message: `ERROR: logout not supported with Basic Auth`})
            return
        }

        // we are here if login token check successfully
        await logoutUser(req, res)
        return

    } catch (err) {
        console.log(err)
        res.status(401).json({ status: FAILURE, message: `${err}` })
        return
    }
}

// handle realm
function _handle_realm(req, res) {
    try {

        // const realm_by_app = cache.get_cache_for('realm').realm_by_app
        const app_by_realm = cache.get_cache_for('realm').app_by_realm

        const result = []
        Object.keys(app_by_realm).map(realm => {
            Object.keys(app_by_realm[realm]).map(namespace => {
                Object.keys(app_by_realm[realm][namespace]).map(app_name => {
                    result.push({
                        realm: realm,
                        namespace: namespace,
                        app_name: app_name,
                        realm_app_spec: app_by_realm[realm][namespace][app_name]['realm_app_spec'],
                    })
                })
            })
        })

        res.status(200).json(result)
        return

    } catch (err) {
        console.log(err)
        res.status(401).json({ status: FAILURE, message: `${err}` })
        return
    }
}

// load auth router
function load_auth_router() {

    let router = express.Router()

    router.post('/login', async (req, res) => {
        await _handle_login(req, res)
    })

    router.post('/logout', async (req, res) => {
        await _handle_logout(req, res)
    })

    router.get('/realm', async (req, res) => {
        await _handle_realm(req, res)
    })

    router.use('/', (req, res) => {
        res.status(404).json({
            status: FAILURE,
            message: `ERROR: auth API [${req.url}] not found !`
        })
    })

    return router
}

// auth router
const AUTH_ROUTER = load_auth_router()

// auth dispatcher
const auth_dispatcher = function(req, res, next) {

    AUTH_ROUTER.handle(req, res, next)
}

//export this router to use in our index.js
module.exports = {
    auth_dispatcher: auth_dispatcher
}
