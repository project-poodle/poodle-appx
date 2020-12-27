const fs = require('fs')
const url = require('url')
const path = require('path');
const objPath = require("object-path")
const prettier = require("prettier")
const Mustache = require('mustache')

const db = require('../db/db')
const { log_api_status, SUCCESS, FAILURE, REGEX_VAR } = require('../api/util')
const { RENDER_JSON, KEY_VALUE } = require('./html')
const { handle_html } = require('./html')
const { handle_react_element } = require('./react_element')
const { handle_render } = require('./render')

const rootDir = path.join(__dirname, '../../../ui/')
// const INDEX_HTML = 'index.html'

/**
 * handle_preview
 */
function handle_preview(req, res) {

    // console.log(req)
    // console.log(req.body)

    const {
        type: req_type,
        output: req_output,
        data: req_data
    } = !!req.body.urlencoded ? JSON.parse(req.body.urlencoded) : req.body

    // console.log(req_type, req_output, req_data)

    // process ui_element
    if (req_type === 'ui_element') {
      // process ui_element
      const {
          namespace,
          ui_name,
          ui_ver,
          ui_spec,
          ui_deployment,
          ui_deployment_spec,
          ui_element_name,
          ui_element_type,
          ui_element_spec,
          //ui_route_name,
          //ui_route_spec,
      } = req_data

      // set request context
      req.context = { ...req.context, ...req_data }

      if (req_output === 'code') {

        // render source code
        const result = handle_react_element(req, res)
        res.status(result.status)
            .type(result.type)
            .send(typeof result.data === 'object' ? JSON.stringify(result.data) : String(result.data))
        return

      } else if (req_output === 'html') {

        // render html
        const result = handle_render(req, res, false)
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

    } else if (req_type === 'ui_route') {
      // process ui_route
      const {
          namespace,
          ui_name,
          ui_ver,
          ui_spec,
          ui_deployment,
          ui_deployment_spec,
          //ui_element_name,
          //ui_element_type,
          //ui_element_spec,
          ui_route_name,
          ui_route_spec,
      } = req_data

      res.status(422).json({
          status: FAILURE,
          message: `ERROR: preview type not yet supported [${req_type}]`
      })
      return

    } else {
        // unrecognized type
        res.status(422).json({
            status: FAILURE,
            message: `ERROR: unrecognized preview type [${req_type}]`
        })
        return
    }
}

// export
module.exports = {
    handle_preview: handle_preview
}
