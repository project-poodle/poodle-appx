const fs = require('fs')
const ldap = require('ldapjs')
const deasync = require('deasync')
const objPath = require("object-path")
const db = require('../db/db')
const cache = require('../cache/cache')
const { REGEX_VAR }  = require('../api/util')

const ldap_conn = {}

/*
ldap:
    conf: ldap_appx.json
    base_dn:
        - "{{{LDAP_CONF.base_dn}}}"
    search: "(&(objectClass=person)(cn=$1))"
    group_attr: "memberOf"
*/

let ldap_connect = (host, port, ssl, user, pass, callback) => {

    let ldap_client = ldap.createClient({url: `${ssl?'ldap':'ldaps'}://${host}:${port}/`})
    ldap_client.bind(user, pass, (err, result) => {
        callback(err, ldap_client)
    })
}

let ldap_connect_sync = deasync(ldap_connect)

let ldap_search = (ldap_conn, base_dn, options, callback) => {

    //console.log(ldap_conn, base_dn, options)
    ldap_conn.search(base_dn, options, (err, search) => {
        callback(err, search)
    })
}

let ldap_search_sync = deasync(ldap_search)

let ldap_search_objects = (ldap_search, callback) => {

    let objects = []
    let p = new Promise((resolve, reject) => {
        ldap_search.on('searchEntry', entry => {
            objects.push(entry.object)
        })
        ldap_search.on('page', page => {
            resolve(objects)
        })
        ldap_search.on('error', err => {
            reject(err)
        })
        ldap_search.on('end', err => {
            resolve(objects)
        })
    })

    p.then(value => {
        callback(null, value)
    }).catch(err => {
        callback(err, null)
    })
}

let ldap_search_objects_sync = deasync(ldap_search_objects)


function findLdapUserWithPass(realm, protocol, username, password) {

    if (! ('conf' in protocol)) {
        return {
            status: 'error',
            message: `ldap protocol conf not configured [${protocol.conf}]`
        }
    }

    if (! (protocol.conf in ldap_conn)) {
        let conf_file = __dirname + '/../../conf.d/' + protocol.conf
        if (! fs.existsSync(conf_file)) {
            return {
                status: 'error',
                message: `ldap protocol conf not found [${protocol.conf}]`
            }
        }
        let ldap_conf = JSON.parse(fs.readFileSync(conf_file, 'utf8'))
        let ldap_client = ldap_connect_sync(ldap_conf.host, ldap_conf.port, ldap_conf.ssl,
                                            ldap_conf.bind_user, ldap_conf.bind_pass)
        ldap_conn[protocol.conf] = ldap_client
    }

    let options = {
        filter: protocol.search.replace(/\$\{username\}/, username),
        scope: 'sub',
        attributes: ['dn', protocol.group_attr]
    }
    let search = ldap_search_sync(ldap_conn[protocol.conf], protocol.base_dn[0], options)
    let results = ldap_search_objects_sync(search)
    //console.log(results)

    if (!results || results.length == 0) {
        return {
            status: 'error',
            user: null,
            message: `Invalid Username or Password`
        }
    } else {
        return {
            status: 'ok',
            user: {
                realm: realm,
                username: username,
                user_spec: {
                    dn: 'dn' in results[0] ? results[0].dn : ''
                },
                group_spec: protocol.group_attr in results[0] ? results[0][protocol.group_attr] : []
            }
        }
    }
}

// exports
module.exports = {
    findLdapUserWithPass: findLdapUserWithPass
}
