const db = require('../db/db')
const passport = require('passport')
const BasicStrategy = require('passport-http').BasicStrategy
const LocalStrategy = require('passport-local').Strategy
const BearerStrategy = require('passport-http-bearer').Strategy


function findUserWithPass(username, password) {

    let sql = `SELECT
                    id,
                    domain,
                    username,
                    user_info,
                    deleted
                FROM _user
                WHERE domain='appx'
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

/*
function findUser(username) {

    let sql = `SELECT
                    id,
                    domain,
                    username,
                    user_info,
                    deleted
                FROM _user
                WHERE domain='appx'
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
            domain: result[0].domain,
            username: result[0].username,
            user_info: result[0].user_info
        }
    }
}
*/

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

    console.log(req.url)

    if (!req.headers.authorization) {
        res.set('WWW-Authenticate', 'Basic realm="appx"') // change this
        res.status(401).send('Authentication required.') // custom message
    }

    // console.log(req.headers.authorization)
    if (req.headers.authorization.match(/^Basic/i)) {

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
