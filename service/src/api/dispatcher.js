const express = require('express')
const router = express.Router()
const db = require('../db/db')
const cache = require('../cache/cache')
const { get_router }  = require('./router')


const REGEX_VAR = '[_a-zA-Z][_a-zA-Z0-9]*'

const ROUTES = {}

function load_routers() {

    let dp_results = db.query_sync(`SELECT
                    deployment.namespace,
                    deployment.runtime_name,
                    deployment.app_name,
                    deployment.app_ver,
                    deployment.deployment_spec
                FROM deployment
                WHERE
                    deployment.deleted=0`)

    dp_results.forEach((dp_result, i) => {

        let router = get_router(dp_result.namespace, dp_result.runtime_name, dp_result.app_name)

        let route = `/${dp_result.namespace}/${dp_result.runtime_name}/${dp_result.app_name}`

        ROUTES[route] = router

        console.log(`INFO: loaded routes for ${route} !`)
    });
}

load_routers()

const dispatcher = function (req, res, next) {

    // compute current url
    let url = req.url
    if (! url) {
        url = req.originalUrl.substring(req.baseUrl.length)
    }

    let match = url.match(new RegExp(`(\/${REGEX_VAR}\/${REGEX_VAR}\/${REGEX_VAR})\/`))
    if (match) {
        let router = ROUTES[match[1]]
        if (!router) {
            res.status(404).send(`ERROR: handler for [${match[1]}] not found !`)
        } else {
            req.baseUrl = req.baseUrl + match[1]
            req.url = req.originalUrl.substring(req.baseUrl.length)
            router.handle(req, res, next)
        }
    } else {
        next()
    }
}


module.exports = {
    dispatcher: dispatcher
}
