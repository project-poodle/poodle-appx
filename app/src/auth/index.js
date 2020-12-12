/**
 * Module dependencies.
 */
const { authenticator } = require('./authenticator')
const { auth_dispatcher } = require('./auth_router')

/**
 * Export
 */
 module.exports = {
     authenticator: authenticator,
     auth_dispatcher: auth_dispatcher,
 }
