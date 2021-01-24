const express = require('express')
const router = express.Router()
const db = require('../db/db')
const cache = require('../cache/cache')
const { REGEX_VAR, SUCCESS, FAILURE }  = require('./util')
const { load_api_router }  = require('./api_router')


const ROUTES = {}

async function refresh_api_routers() {

    let dp_results = await db.query_async(`SELECT
                    app_deployment.namespace,
                    app_deployment.app_name,
                    app_deployment.app_deployment,
                    app_deployment.app_runtime,
                    app_deployment.app_ver,
                    app_deployment.app_rev,
                    app_deployment.app_deployment_spec
                FROM app_deployment
                WHERE
                    app_deployment.deleted=0`)

    for (const dp_result of dp_results) {
        await refresh_api_router(dp_result.namespace, dp_result.app_name, dp_result.app_deployment)
    }
}

async function refresh_api_router(namespace, app_name, app_deployment) {

    let route = `/${namespace}/${app_name}/${app_deployment}`

    // console.log(dp_result)
    let router = await load_api_router(namespace, app_name, app_deployment)

    ROUTES[route] = router

    console.log(`INFO: loaded API routes for app_deployment [${route}]`)
}

// load_api_routers()

const api_dispatcher = async function (req, res, next) {

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
            let app_deployment = match[4]
            req.context.namespace = namespace
            req.context.app_name = app_name
            req.context.app_deployment = app_deployment
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
    api_dispatcher: api_dispatcher,
    refresh_api_routers: refresh_api_routers,
    refresh_api_router: refresh_api_router,
}
