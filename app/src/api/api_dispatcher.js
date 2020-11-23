const express = require('express')
const router = express.Router()
const db = require('../db/db')
const cache = require('../cache/cache')
const { REGEX_VAR, SUCCESS, FAILURE }  = require('./util')
const { load_api_router }  = require('./api_router')


const ROUTES = {}

function load_api_routers() {

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

        let router = load_api_router(dp_result.namespace, dp_result.app_name, dp_result.runtime_name)

        let route = `/${dp_result.namespace}/${dp_result.app_name}/${dp_result.runtime_name}`

        ROUTES[route] = router

        console.log(`INFO: loaded API routes for API deployment [${route}]`)
    });
}

load_api_routers()

const api_dispatcher = function (req, res, next) {

    // compute current url
    let url = req.url
    if (! url) {
        url = req.originalUrl.substring(req.baseUrl.length)
    }

    let match = url.match(new RegExp(`(\/(${REGEX_VAR})\/(${REGEX_VAR})\/(${REGEX_VAR}))\/`))
    if (match) {
        let router = ROUTES[match[1]]
        if (!router) {
            res.status(404).send(`ERROR: API dispatcher for [${match[1]}] not found !`)
        } else {
            // process context
            let namespace = match[2]
            let app_name = match[3]
            let runtime_name = match[4]
            req.context.namespace = namespace
            req.context.app_name = app_name
            req.context.runtime_name = runtime_name
            //console.log(req.context)
            // process url
            req.baseUrl = req.baseUrl + match[1]
            req.url = req.originalUrl.substring(req.baseUrl.length)
            router.handle(req, res, next)
        }
    } else {
        res.status(422).json({status:FAILURE, message: `ERROR: unknown API dispatcher url [${req.url}]`})
    }
}


module.exports = {
    api_dispatcher: api_dispatcher
}
