const crypto = require('crypto')
const objPath = require("object-path")
const db = require('../db/db')
const cache = require('../cache/cache')
const { REGEX_VAR }  = require('../api/util')
const { findLocalUserWithPass } = require('./auth_local')
const { findLdapUserWithPass } = require('./auth_ldap')

// find token
async function findToken(realm, token) {

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
                AND expiration > NOW()
                AND deleted=0`

    let result = await db.query_async(sql, [realm, token])

    if (!result || result.length == 0) {
        return null
    } else {
        return {
            realm: result[0].realm,
            token: result[0].token,
            username: result[0].username,
            token_spec: result[0].token_spec
        }
    }
}

// find username with password
async function findUserWithPass(realm, username, password) {

    const realm_modules = cache.get_cache_for('realm').realm_module

    if (! (realm in realm_modules)) {
        return {
            status: 'error',
            message: `Auth Module NOT configured for realm [${realm}]`
        }
    }

    let sorted_module_name = Object.keys(realm_modules[realm]).sort()
    for (let i=0; i<sorted_module_name.length; i++) {

        let realm_module = realm_modules[realm][sorted_module_name[i]]
        // console.log(realm_module)
        let matches = username.match(realm_module.module_pattern)
        if (matches) {

            if (realm_module.module_spec.protocol == 'local_db') {

                if (! ('auth_name_match' in realm_module.module_spec)) {
                    return {
                        status: 'error',
                        module: sorted_module_name[i],
                        message: `local_db protocol missing [auth_name_match]`
                    }
                } else if (typeof realm_module.module_spec.auth_name_match != 'number') {
                    let auth_name_match = realm_module.module_spec.auth_name_match
                    return {
                        status: 'error',
                        module: sorted_module_name[i],
                        message: `local_db protocol [auth_name_match] is not a number [${typeof auth_name_match} : ${auth_name_match}]`
                    }
                }
                if (! ('local_db' in realm_module.module_spec)) {
                    return {
                        status: 'error',
                        module: sorted_module_name[i],
                        message: `local_db protocol missing [local_db]`
                    }
                }
                let local_db = realm_module.module_spec.local_db
                if (! ('table' in local_db)) {
                    return {
                        status: 'error',
                        module: sorted_module_name[i],
                        message: `local_db protocol missing [local_db.table]`
                    }
                }

                let local_username = matches[realm_module.module_spec.auth_name_match]

                let table = local_db.table
                let fields = {
                    realm: objPath.get(local_db, ['field', 'realm'], 'realm'),
                    username: objPath.get(local_db, ['field', 'username'], 'username'),
                    password: objPath.get(local_db, ['field', 'password'], 'password'),
                    user_spec: objPath.get(local_db, ['field', 'user_spec'], 'user_spec')
                }

                let result = await findLocalUserWithPass(realm, local_username, password, table, fields)

                return {
                    module: sorted_module_name[i],
                    ...result
                }

            } else if (realm_module.module_spec.protocol == 'ldap') {

                if (! ('auth_name_match' in realm_module.module_spec)) {
                    return {
                        status: 'error',
                        module: sorted_module_name[i],
                        message: `ldap protocol missing [auth_name_match]`
                    }
                } else if (typeof realm_module.module_spec.auth_name_match != 'number') {
                    let auth_name_match = realm_module.module_spec.auth_name_match
                    return {
                        status: 'error',
                        module: sorted_module_name[i],
                        message: `ldap protocol [auth_name_match] is not a number [${typeof auth_name_match} : ${auth_name_match}]`
                    }
                }
                if (! ('ldap' in realm_module.module_spec)) {
                    return {
                        status: 'error',
                        module: sorted_module_name[i],
                        message: `ldap protocol missing [ldap]`
                    }
                }

                let ldap_username = matches[realm_module.module_spec.auth_name_match]

                let protocol = realm_module.module_spec.ldap

                let result = await findLdapUserWithPass(realm, protocol, ldap_username, password)

                return {
                    module: sorted_module_name[i],
                    ...result
                }

            } else {

                continue
            }
        }
    }

    // we are here if no matching protocol found
    return {
        status: 'error',
        module: null,
        message: `Unable to find matching authentication protocol`
    }
}


// login username with password
async function loginUserWithPass(req, res) {

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

        let result = await findUserWithPass(realm, username, password)
        // console.log(result)

        if (result && result.user && result.status == 'ok') {

            console.log(`INFO: user [${username}] authenticated successfully ! [${result.module}]`)
            crypto.randomBytes(64, async function(err, buffer) {

                let token = buffer.toString('base64')
                let token_spec = { module: result.module, ...result.user }

                let sql = `INSERT INTO
                                _realm_token (realm, token, username, expiration, token_spec)
                                VALUES (?, ?, ?, NOW() + INTERVAL 8 HOUR, ?)`

                // console.log(sql, [realm, token, username, JSON.stringify(token_spec)])
                await db.query_async(sql, [realm, token, username, JSON.stringify(token_spec)])
                res.status(200).json({
                    status: 'ok',
                    realm: realm,
                    username: username,
                    token: token
                })
            })

        } else {

            console.log(`INFO: user [${username}] authentication failed ! [${result.module}]`)
            res.status(422).json(result)
            return

        }

    } catch (err) {

        console.log(err)
        res.status(422).json({status: 'error', message: `${err}`})
        return

    }
}

// logout user
async function logoutUser(req, res) {

    try {
        // console.log(req.body)
        if (! ('realm' in req.body)) {
            res.status(422).json({status: 'error', message: 'missing realm'})
            return
        } else if (! ('username' in req.body)) {
            res.status(422).json({status: 'error', message: 'missing username'})
            return
        } else if (! ('token' in req.body)) {
            res.status(422).json({status: 'error', message: 'missing token'})
            return
        }

        // this is a private method, the token security validatation has already happened
        let realm = req.body.realm
        let username = req.body.username
        let token = req.body.token

        let sql = `DELETE FROM _realm_token WHERE realm=? AND username=? AND token=?`

        await db.query_async(sql, [realm, username, token])
        res.status(200).json({
            status: 'ok',
            realm: realm,
            username: username,
            token: token
        })

    } catch (err) {

        console.log(err)
        res.status(422).json({status: 'error', message: `${err}`})
        return

    }
}

/**
 * lookup roles and permissions
 */
const lookupRolesPerms = function(namespace, app_name, user) {

    const username = user.username
    const groups = user.groups

    let roles = new Set()

    // console.log(JSON.stringify(cache.get_cache_for('auth'), null, 4))

    const auth_grant_by_user = cache.get_cache_for('auth').auth_grant_by_user
    if (namespace in auth_grant_by_user
        && app_name in auth_grant_by_user[namespace]
        && username in auth_grant_by_user[namespace][app_name]) {

        Object.keys(auth_grant_by_user[namespace][app_name][username]).map(role => roles.add(role))
    }

    const auth_grant_by_group = cache.get_cache_for('auth').auth_grant_by_group
    if (groups && Array.isArray(groups)) {
        for (group of groups) {

            if (namespace in auth_grant_by_group
                && app_name in auth_grant_by_group[namespace]
                && group in auth_grant_by_group[namespace][app_name]) {

                Object.keys(auth_grant_by_group[namespace][app_name][group]).map(role => roles.add(role))
            }
        }
    }

    // update roles
    user.roles = Array.from(roles.keys()).sort()
    if (! user.roles) {
        return user
    }

    // lookup functional perms
    let func_perms = new Set()

    const auth_func_perm_by_role = cache.get_cache_for('auth').auth_func_perm_by_role
    for (role_name of user.roles) {

        if (namespace in auth_func_perm_by_role
            && app_name in auth_func_perm_by_role[namespace]
            && role_name in auth_func_perm_by_role[namespace][app_name]) {

            Object.keys(auth_func_perm_by_role[namespace][app_name][role_name]).map(func_perm => func_perms.add(func_perm))
        }
    }

    user.func_perms = Array.from(func_perms.keys()).sort()

    // lookup object perms
    let obj_perms = {}

    const auth_obj_perm_by_role = cache.get_cache_for('auth').auth_obj_perm_by_role
    for (role_name of user.roles) {

        if (namespace in auth_obj_perm_by_role
            && app_name in auth_obj_perm_by_role[namespace]
            && role_name in auth_obj_perm_by_role[namespace][app_name]) {

            Object.keys(auth_obj_perm_by_role[namespace][app_name][role_name]).map(obj_type => {

                let perms = new Set()
                Object.keys(auth_obj_perm_by_role[namespace][app_name][role_name][obj_type]).map(obj_key => {

                    Object.keys(auth_obj_perm_by_role[namespace][app_name][role_name][obj_type][obj_key]).map(func_name => {

                        perms.add(func_name)
                    })
                })

                obj_perms[obj_type] = Array.from(perms.keys()).sort()
            })
        }
    }

    user.obj_perms = obj_perms

    // return enriched user
    // console.log(user)
    return user
}


module.exports = {
  findToken: findToken,
  findUserWithPass: findUserWithPass,
  loginUserWithPass: loginUserWithPass,
  logoutUser: logoutUser,
  lookupRolesPerms: lookupRolesPerms,
}
