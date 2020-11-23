const express = require('express')
const router = express.Router()
const db = require('../db/db')
const cache = require('../cache/cache')
const { REGEX_VAR, SUCCESS, FAILURE }  = require('../api/util')
const { load_ui_router }  = require('./ui_router')


const UI_ROUTES = {}

function load_ui_routers() {

    let dp_results = db.query_sync(`SELECT
                    ui_deployment.namespace,
                    ui_deployment.runtime_name,
                    ui_deployment.app_name,
                    ui_deployment.ui_app_ver,
                    ui_deployment.ui_deployment_spec
                FROM ui_deployment
                WHERE
                    ui_deployment.deleted=0`)

    dp_results.forEach((dp_result, i) => {

        let router = load_ui_router(dp_result.namespace, dp_result.app_name, dp_result.runtime_name, dp_result.ui_app_ver)

        let route = `/${dp_result.namespace}/${dp_result.app_name}/${dp_result.runtime_name}/${dp_result.ui_app_ver}`

        UI_ROUTES[route] = router

        console.log(`INFO: loaded UI routes for UI deployment [${route}]`)
    })
}

load_ui_routers()

const ui_dispatcher = function (req, res, next) {

    // compute current url
    let url = req.url
    if (! url) {
        url = req.originalUrl.substring(req.baseUrl.length)
    }

    let match = url.match(new RegExp(`(\/(${REGEX_VAR})\/(${REGEX_VAR})\/(${REGEX_VAR})\/(${REGEX_VAR}))\/`))
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
            let app_name = match[3]
            let runtime_name = match[4]
            let ui_app_ver = match[5]
            req.context.namespace = namespace
            req.context.app_name = app_name
            req.context.runtime_name = runtime_name
            req.context.ui_app_ver = ui_app_ver
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
    ui_dispatcher: ui_dispatcher
}
