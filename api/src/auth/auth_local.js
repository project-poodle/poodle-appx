const crypto = require('crypto')
const db = require('../db/db')
const cache = require('../cache/cache')
const { REGEX_VAR }  = require('../api/util')


function findLocalUserWithPass(realm, username, password, table, fields) {

    let sql = `SELECT
                    id,
                    realm,
                    username,
                    user_spec,
                    deleted
                FROM ${table}
                WHERE
                    ${fields.realm}=?
                    AND ${fields.username}=?
                    AND ${fields.password}=PASSWORD(?)
                    AND deleted=0`

    // console.log(sql, [realm, username, password])
    let result = db.query_sync(sql, [realm, username, password])

    if (!result || result.length == 0) {
        return {
            status: 'error',
            message: `Invalid Username or Password`
        }
    } else {
        return {
            status: 'ok',
            user: {
                realm: result[0][fields.realm],
                username: result[0][fields.username],
                user_spec: result[0][fields.user_spec]
            }
        }
    }
}

// exports
module.exports = {
    findLocalUserWithPass: findLocalUserWithPass
}
