const fs = require('fs')
const url = require('url')
const path = require('path');
const objPath = require("object-path")
const prettier = require("prettier")
const Mustache = require('mustache')

const db = require('../db/db')
const { SUCCESS, FAILURE, REGEX_VAR } = require('../api/util')
const { get_ui_deployment } = require ('./util_lookup')
const { RENDER_JSON, KEY_VALUE } = require('./html')
const { handle_html } = require('./html')
const { handle_react_component } = require('./react_component')
const { handle_react_provider } = require('./react_provider')
const { handle_render } = require('./render')

const rootDir = path.join(__dirname, '../../../ui/')
// const INDEX_HTML = 'index.html'

/**
 * handle_preview
 */
async function handle_preview(req, res) {

    try {
        // console.log(req)
        // console.log(req.body)

        const {
            type: req_type,
            output: req_output,
            data: req_data
        } = !!req.body.urlencoded ? req.body.urlencoded : req.body

        // console.log(req_type, req_output, req_data)

        let {
            namespace,
            ui_name,
            ui_ver,
            ui_spec,
            ui_deployment,
            ui_deployment_spec,
            ui_component_name,
            ui_component_type,
            ui_component_spec,
            ui_route_name,
            ui_route_spec,
        } = req_data

        // set request context
        req.context = { ...req.context, ...req_data, req_type: req_type }

        // load from cache if not exist
        if (!ui_spec || !ui_deployment_spec) {

            const lookup = await get_ui_deployment(req, res)
            if (req.fatal) {
                return
            }

            // extract result
            req.context = {
                ...req.context,
                ui_spec: lookup.ui_spec,
                ui_deployment_spec: lookup.ui_deployment_spec,
            }

            // update local variables
            ui_spec             = lookup.ui_spec
            ui_deployment_spec  = lookup.ui_deployment_spec
        }

        // check req_type
        if (req_type === 'ui_component') {
          // handle ui_component
          if (req_output === 'code') {

            if (ui_component_type == 'react/component') {
              // render source code
              const result = await handle_react_component(req, res)
              res.status(result.status)
                  .type(result.type)
                  .send(typeof result.data === 'object' ? JSON.stringify(result.data) : String(result.data))
              return

            } else if (ui_component_type == 'react/provider') {
              // render source code
              const result = await handle_react_provider(req, res)
              res.status(result.status)
                  .type(result.type)
                  .send(typeof result.data === 'object' ? JSON.stringify(result.data) : String(result.data))
              return

            } else {
              // unrecognized ui_component_type
              res.status(422).json({
                  status: FAILURE,
                  message: `ERROR: unrecognized ui_component_type [${ui_component_type}]`
              })
              return
            }

          } else if (req_output === 'html') {

            // render html
            const result = await handle_render(req, res, false)
            res.status(result.status)
                .type(result.type)
                .send(typeof result.data === 'object' ? JSON.stringify(result.data) : String(result.data))
            return

          } else {
            // unrecognized output
            res.status(422).json({
                status: FAILURE,
                message: `ERROR: unrecognized preview output [${req_output}]`
            })
            return
          }

        } else {
            // unrecognized type
            res.status(422).json({
                status: FAILURE,
                message: `ERROR: unrecognized preview type [${req_type}]`
            })
            return
        }

    } catch (err) {

        console.log(err)
        return {
            status: 500,
            type: 'application/json',
            data: String(err),
        }
    }
}

// export
module.exports = {
    handle_preview: handle_preview
}
