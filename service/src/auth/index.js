/**
 * Module dependencies.
 */
// const { authenticator, loginUserWithPass, logoutUser, findUserWithPass } = require('./authenticator')
const { authenticator } = require('./authenticator')
// const {  } = require('./auth_local')

/**
 * Export constructors.
 */
 module.exports = {
     authenticator: authenticator,
     // findUserWithPass: findUserWithPass,
     // loginUserWithPass: loginUserWithPass,
     // logoutUser: logoutUser,
 }
