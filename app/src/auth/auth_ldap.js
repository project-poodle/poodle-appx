const fs = require('fs')
const { Client } = require('ldapts')
const deasync = require('deasync')
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

    // console.log(host, port, ssl, user, pass)
    let ldap_client = new Client({
        url: `${ssl?'ldap':'ldaps'}://${host}:${port}/`,
        timeout: 0,
        connectTimeout: 0,
        strictDN: true
    });
    let p = new Promise(async (resolve, reject) => {
        try{
            await ldap_client.bind(user, pass)
            resolve(ldap_client)
        } catch (err) {
            reject(err)
        }
    })
    p.then(value => {
        callback(null, value)
    }).catch(err => {
        console.log(err)
        callback(err, null)
    })
}

let ldap_connect_sync = deasync(ldap_connect)

let ldap_ublind = (ldap_client, callback) => {

    let p = new Promise(async (resolve, reject) => {
        try{
            await ldap_client.unbind()
            resolve(ldap_client)
        } catch (err) {
            reject(err)
        }
    })
    p.then(value => {
        callback(null, value)
    }).catch(err => {
        console.log(err)
        callback(err, null)
    })
}

let ldap_ublind_sync = deasync(ldap_ublind)

let ldap_search = (ldap_conn, base_dn, options, callback) => {

    //console.log(ldap_conn, base_dn, options)
    let p = new Promise(async (resolve, reject) => {
        try{
            const {
                searchEntries
            } = await ldap_conn.search(base_dn, options)
            resolve(searchEntries)
        } catch (err) {
            reject(err)
        }
    })
    p.then(value => {
        callback(null, value)
    }).catch(err => {
        console.log(err)
        callback(err, null)
    })
}

let ldap_search_sync = deasync(ldap_search)

/*
ldap:
    conf: ldap_appx.json
    base_dn: "{{{LDAP_CONF.base_dn}}}"
    search: "(&(objectClass=person)(cn=${username}))"
    group_attr: "memberOf"
    group_pattern: "^cn=([^,]+)(,(.+))?$"
    group_name_match: 1
*/

function findLdapUserWithPass(realm, protocol, username, password) {

    protocol = { ...protocol }

    // check mandatory config
    for (const protocol_attr of ['conf', 'base_dn', 'search', 'group_attr']) {

        if (! (protocol_attr in protocol)) {
            return {
                status: 'error',
                message: `ldap protocol: [${protocol_attr}] not configured [${protocol}]`
            }
        }
    }

    // optional attribute
    if (! ('group_pattern' in protocol)) {
        protocol['group_pattern'] = '^(.+)$'
    }

    // optional attribute
    if (! ('group_name_match' in protocol) || typeof protocol.group_name_match != 'number') {
        protocol['group_name_match'] = 1
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
        ldap_conn[protocol.conf] = {
            ldap_conf: ldap_conf,
            ldap_client: ldap_client
        }
    }

    let { ldap_conf, ldap_client } = ldap_conn[protocol.conf]
    let options = {
        filter: protocol.search.replace(/\$\{username\}/, username),
        scope: 'sub',
        attributes: ['dn', protocol.group_attr]
    }
    let results = ldap_search_sync(ldap_client, protocol.base_dn, options)

    if (!results || results.length === 0 || (! ('dn' in results[0]))) {
        return {
            status: 'error',
            message: `Invalid Username or Password`
        }
    }

    try {
        ldap_ublind_sync(ldap_client)
    } catch (err) {
        console.error(err)
    }

    // we have found the user, next, authenticate the user with password
    try {
        ldap_connect_sync(ldap_conf.host, ldap_conf.port, ldap_conf.ssl, results[0].dn, password)
    } catch (err) {
        console.log(err)
        return {
            status: 'error',
            message: `Invalid Username or Password`
        }
    }

    // user authentication (bind) to ldap is succcessful, next, extract the groups
    let groups = []
    let group_specs = protocol.group_attr in results[0] ? results[0][protocol.group_attr] : []
    if (Array.isArray(group_specs)) {
        let rep = `\$${protocol.group_name_match}`
        groups = group_specs.map(row => row.replace(new RegExp(protocol.group_pattern), rep))
    }

    return {
        status: 'ok',
        user: {
            realm: realm,
            username: username,
            user_spec: {
                dn: results[0].dn
            },
            groups: groups,
            group_spec: group_specs
        }
    }
}

// exports
module.exports = {
    findLdapUserWithPass: findLdapUserWithPass
}
