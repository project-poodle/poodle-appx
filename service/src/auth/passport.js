const db = require('../db/db')
const passport = require('passport')
const BasicStrategy = require('passport-http').BasicStrategy;
const LocalStrategy = require('passport-local').Strategy


function findLocalUserWithPass(username, password) {

    let sql = `SELECT
                    id,
                    namespace,
                    scope_name,
                    username,
                    user_info,
                    deleted
                FROM _user
                WHERE namespace='sys'
                AND scope_name='local'
                AND username=?
                AND password=PASSWORD(?)
                AND deleted=0`

    let result = db.query_sync(sql, [username, password])

    if (!result || result.length == 0) {
        //console.log(`findLocalUserWithPass failed !`)
        //console.log(`${sql}, [${username}, ${password}]`)
        return null
    } else {
        //console.log(`findLocalUserWithPass success !`)
        return {
            namespace: result[0].namespace,
            scope_name: result[0].scope_name,
            username: result[0].username,
            user_info: result[0].user_info
        }
    }
}

function findLocalUser(username) {

    let sql = `SELECT
                    id,
                    namespace,
                    scope_name,
                    username,
                    user_info,
                    deleted
                FROM _user
                WHERE namespace='sys'
                AND scope_name='local'
                AND username=?
                AND deleted=0`

    let result = db.query_sync(sql, [username])

    if (!result || result.length == 0) {
        //console.log(`findLocalUser failed !`)
        //console.log(`${sql}, [${username}]`)
        return null
    } else {
        //console.log(`findLocalUser success !`)
        return {
            namespace: result[0].namespace,
            scope_name: result[0].scope_name,
            username: result[0].username,
            user_info: result[0].user_info
        }
    }
}

passport.use(new BasicStrategy(
    function(username, password, done) {
        try {
            let user = findLocalUserWithPass(username, password)
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

// local strategy
passport.use(new LocalStrategy(
    {
        usernameField: 'username',
        passwordField: 'password'
    },
    function(username, password, done) {
        try {
            let user = findLocalUserWithPass(username, password)
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
passport.serializeUser(function(user, down) {
    down(null, user);
})

// deserialize
passport.deserializeUser(function(user, done) {
    try {
        let user = findLocalUser(username)
        if (user == null) {
            done(null, false)
        } else {
            done(null, user)
        }
    } catch (err) {
        done(err)
    }
})

module.exports = {
    passport: passport
}
