const express = require('express')
const router = express.Router()
const db = require('../db/db')
const cache = require('../cache/cache')
const { SUCCESS, FAILURE, REGEX_VAR } = require('../api/util')
const { load_ui_router }  = require('./ui_router')


const UI_ROUTES = {}

async function refresh_ui_routers() {

    let dp_results = await db.query_async(`SELECT
                    ui_deployment.namespace,
                    ui_deployment.ui_name,
                    ui_deployment.ui_deployment,
                    ui_deployment.ui_ver,
                    ui_deployment.ui_deployment_spec
                FROM ui_deployment
                WHERE
                    ui_deployment.deleted=0`)

    for (const dp_result of dp_results) {
        await refresh_ui_router(dp_result.namespace, dp_result.ui_name, dp_result.ui_deployment)
    }
}

// load router
async function refresh_ui_router(namespace, ui_name, ui_deployment) {

  let router = await load_ui_router(namespace, ui_name, ui_deployment)

  let route = `/${namespace}/${ui_name}/${ui_deployment}`

  UI_ROUTES[route] = router

  console.log(`INFO: loaded UI routes for ui_deployment [${route}]`)
}

// load_ui_routers()

const ui_dispatcher = async function (req, res, next) {

    // compute current url
    let url = req.url
    if (! url) {
        url = req.originalUrl.substring(req.baseUrl.length)
    }

    let match = url.match(new RegExp(`(\/(${REGEX_VAR})\/(${REGEX_VAR})\/(${REGEX_VAR}))\/`))
    if (match) {
        let router = UI_ROUTES[match[1]]
        if (!router) {
            res.status(404).send(`ERROR: dispatcher for [${match[1]}] not found !`)
        } else {
            if (! req.context) {
                req.context = {}
            }
            // process context
            let namespace = match[2]
            let ui_name = match[3]
            let ui_deployment = match[4]
            req.context.namespace = namespace
            req.context.ui_name = ui_name
            req.context.ui_deployment = ui_deployment
            //console.log(req.context)
            // process url
            req.baseUrl = req.baseUrl + match[1]
            req.url = req.originalUrl.substring(req.baseUrl.length)
            router.handle(req, res, next)
        }
    } else {
        res.status(422).json({status:FAILURE, message: `ERROR: unrecognized UI dispatcher url [${req.url}]`})
    }
}


module.exports = {
    ui_dispatcher: ui_dispatcher,
    refresh_ui_routers: refresh_ui_routers,
    refresh_ui_router: refresh_ui_router
}
