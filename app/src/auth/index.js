/**
 * Module dependencies.
 */
// const { authenticator, loginUserWithPass, logoutUser, findUserWithPass } = require('./authenticator')
const { authenticator } = require('./authenticator')
const { auth_dispatcher } = require('./auth_router')
// const {  } = require('./auth_local')

/**
 * Export constructors.
 */
 module.exports = {
     authenticator: authenticator,
     auth_dispatcher: auth_dispatcher,
     // findUserWithPass: findUserWithPass,
     // loginUserWithPass: loginUserWithPass,
     // logoutUser: logoutUser,
 }
