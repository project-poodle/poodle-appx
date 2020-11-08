/**
 * Module dependencies.
 */
const { authenticator, authenticateUserWithPass, findUserWithPass } = require('./authenticator')
// const {  } = require('./auth_local')

/**
 * Export constructors.
 */
 module.exports = {
     authenticator: authenticator,
     findUserWithPass: findUserWithPass,
     authenticateUserWithPass: authenticateUserWithPass
 }
