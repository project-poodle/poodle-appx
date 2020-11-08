/**
 * Module dependencies.
 */
const { authenticator, loginUserWithPass, findUserWithPass } = require('./authenticator')
// const {  } = require('./auth_local')

/**
 * Export constructors.
 */
 module.exports = {
     authenticator: authenticator,
     findUserWithPass: findUserWithPass,
     loginUserWithPass: loginUserWithPass
 }
