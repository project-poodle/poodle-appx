const express = require('express')
const router = express.Router()
const db = require('../db/db')
const cache = require('../cache/cache')
const { REGEX_VAR }  = require('./util')
const { get_router }  = require('./router')


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

        let router = get_router(dp_result.namespace, dp_result.app_name, dp_result.runtime_name)

        let route = `/${dp_result.namespace}/${dp_result.app_name}/${dp_result.runtime_name}`

        ROUTES[route] = router

        console.log(`INFO: loaded routes for deployment [${route}]`)
    });
}

load_routers()

const dispatcher = function (req, res, next) {

    // compute current url
    let url = req.url
    if (! url) {
        url = req.originalUrl.substring(req.baseUrl.length)
    }

    let match = url.match(new RegExp(`(\/(${REGEX_VAR})\/(${REGEX_VAR})\/(${REGEX_VAR}))\/`))
    if (match) {
        let router = ROUTES[match[1]]
        if (!router) {
            res.status(404).send(`ERROR: handler for [${match[1]}] not found !`)
        } else {
            // process context
            let namespace = match[2]
            let app_name = match[3]
            let runtime = match[4]
            req.context.namespace = namespace
            req.context.app_name = app_name
            req.context.runtime = runtime
            //console.log(req.context)
            // process url
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
