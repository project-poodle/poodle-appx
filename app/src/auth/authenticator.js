const crypto = require('crypto')
const objPath = require("object-path")
//const passport = require('passport')
//const LocalStrategy = require('passport-local').Strategy
//const BasicStrategy = require('passport-http').BasicStrategy
//const BearerStrategy = require('passport-http-bearer').Strategy
const db = require('../db/db')
const cache = require('../cache/cache')
const { SUCCESS, FAILURE, REGEX_VAR }  = require('../api/util')
//const { findLocalUserWithPass } = require('./auth_local')
//const { findLdapUserWithPass } = require('./auth_ldap')
const { findToken, findUserWithPass, loginUserWithPass, logoutUser, lookupRolesPerms } = require('./util')


// authenticator will choose between different strategies
const authenticator = async function (req, res, next) {

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
    let namespace = null
    let app_name = null
    let action_name = null
    let match = url.match(new RegExp(`(\/(${REGEX_VAR})\/(${REGEX_VAR})\/(${REGEX_VAR}))`))
    if (match) {
        namespace = match[2]
        app_name = match[3]
        action_name = match[4]
        if (namespace in realm_by_app && app_name in realm_by_app[namespace] && 'realm' in realm_by_app[namespace][app_name]) {
            realm = realm_by_app[namespace][app_name]['realm']
        }
        if (!realm) {
            res.status(401).send(`ERROR: Authentication Realm NOT configured for [${namespace}/${app_name}]`)
            return
        }
    } else {
        res.status(401).send(`ERROR: Cannot determine Authentication Realm -- Missing namespace, app_name, or action/runtime in url [${url}]`)
        return
    }

    // if action is 'login' or 'realm'
    if (action_name == 'login') {

      // update realm
      req.body.realm = realm
      await loginUserWithPass(req, res)
      return

    } else if (action_name == 'realm') {

      res.status(200).json({
          status: SUCCESS,
          namespace: namespace,
          app_name: app_name,
          realm: realm,
      })
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

            let token = await findToken(realm, auth_token)
            if (token == null) {

                // do not request basic authentication if user specified AppX bearer
                // res.set('WWW-Authenticate', `Basic realm="${realm}"`)
                res.status(401).json({ status: 'error', message: `Invalid Token` })
                return

            } else {

                req.user = lookupRolesPerms(namespace, app_name,
                    {
                        realm: token.realm,
                        username: token.username,
                        groups: token.token_spec.groups,
                    }
                )
                req.context = {
                    namespace: namespace,
                    app_name: app_name,
                    user: req.user
                }
                // console.log(req.context)
                if (action_name == 'user' || action_name == 'me') {

                  res.status(200).json({
                      status: 'ok',
                      namespace: namespace,
                      app_name: app_name,
                      realm: realm,
                      user: req.user
                  })
                  return

                } else if (action_name == 'logout') {

                  req.body.token = auth_token
                  req.body.realm = token.realm
                  req.body.username = token.username
                  await logoutUser(req, res)
                  return

                } else {
                  // if this is not one of the known action, continue
                  next()
                }
            }
        } catch (err) {
            console.log(err)
            // do not request basic authentication if user specified AppX bearer
            // res.set('WWW-Authenticate', `Basic realm="${realm}"`)
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

            let result = await findUserWithPass(realm, credentials[0], credentials[1])
            if (result && result.user && result.status == 'ok') {

                req.user = lookupRolesPerms(namespace, app_name,
                    {
                        realm: result.user.realm,
                        username: credentials[0],
                        groups: result.user.groups
                    }
                )
                req.context = {
                    namespace: namespace,
                    app_name: app_name,
                    user: req.user
                }
                //console.log(req.context)
                // console.log(req.context)
                if (action_name == 'user' || action_name == 'me') {

                  res.status(200).json({
                      status: 'ok',
                      namespace: namespace,
                      app_name: app_name,
                      realm: realm,
                      user: req.user
                  })
                  return

                } else if (action_name == 'logout') {

                  // no logout support for basic auth
                  res.status(422).json({ status: 'error', message: `ERROR: logout not supported with Basic Auth`})
                  return

                } else {
                  // if this is not one of the known action, continue
                  next()
                }

            } else {

                res.set('WWW-Authenticate', `Basic realm="${realm}"`)
                res.status(401).json(result)
                return
            }
        } catch (err) {
            console.log(err)
            res.set('WWW-Authenticate', `Basic realm="${realm}"`)
            res.status(401).json({ status: 'error', message: `${err}` })
            return
        }

    } else if (auth_type.toUpperCase() == 'Bearer'.toUpperCase()) {

        //let strategy = passport.authenticate('bearer', { session: false })
        //strategy(req, res, next)
        res.set('WWW-Authenticate', `Basic realm="${realm}"`)
        res.status(401).json({ status: 'error', message: 'Unauthorized' })
        return

    } else {

        res.set('WWW-Authenticate', `Basic realm="${realm}"`)
        res.status(401).json({ status: 'error', message: 'Unauthorized' })
        return
    }

}

// exports
module.exports = {
    authenticator: authenticator,
}
