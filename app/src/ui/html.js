const fs = require('fs')
const path = require('path');
const objPath = require("object-path")
const Mustache = require('mustache')
const { log_api_status, SUCCESS, FAILURE, REGEX_VAR } = require('../api/util')

const rootDir = path.join(__dirname, '../../../ui/')
// const INDEX_HTML = 'index.html'

const RENDER_JSON = function() {

    let process = function(data, depth) {

        if (typeof data == null || typeof data == "undefined") {
            return 'null';
        } else if (typeof data == "number") {
            return data.toString()
        } else if (typeof data == "boolean") {
            return data.toString()
        } else if (typeof data == "string") {
            if (data.startsWith('`') && data.endsWith('`')) {
                return data.substring(1, data.length-1)
            } else {
                return '"' + data.replace(/"/g, '\\"') + '"'
            }
        } else if (data instanceof Array) {
            let results = []
            data.forEach((value) => {
                results.push(process(value, depth+1))
            });
            return '[ ' + results.join(', ') + ' ]'
        } else {
            let results = []
            Object.keys(data).forEach((key) => {
                results.push('"' + key + '": ' + process(data[key], depth+1))
            });
            return '{ ' + results.join(', ') + ' }'
        }
    }

    return function(text, render) {
        return process(this, 0)
    }
}

const KEY_VALUE = function() {

    return function(text, render) {

        let data = { ...this }
        if (typeof data == null || typeof data == "undefined") {
            throw new Error(`ERROR: unrecognized type ${typeof data}`)
        } else if (typeof data == "number") {
            throw new Error(`ERROR: unrecognized type ${typeof data}`)
        } else if (typeof data == "boolean") {
            throw new Error(`ERROR: unrecognized type ${typeof data}`)
        } else if (typeof data == "string") {
            throw new Error(`ERROR: unrecognized type ${typeof data}`)
        } else if (data instanceof Array) {
            throw new Error(`ERROR: unrecognized type ${typeof data}`)
        } else {
            let results = ''
            Object.keys(data).map(key => {
                let newData = { ...data, key: key, value: data[key] }
                // console.log(newData)
                let result = Mustache.render(text, newData)
                // console.log(result)
                results += result
            })
            return results
        }
    }
}

/**
 * handle_html
 */
function handle_html(req, res) {

    const { ui_deployment, ui_element } = req.context

    // check for importMaps
    if (! ('ui_spec' in ui_deployment) || ! ('importMaps' in ui_deployment.ui_spec) ) {
        res.status(422).json({
            status: FAILURE,
            message: `ERROR: ui_spec.importMaps not defined [${ui_deployment}]`
        })
        return
    }

    // check for apiMaps
    if (! ('ui_deployment_spec' in ui_deployment) || ! ('apiMaps' in ui_deployment.ui_deployment_spec) ) {
        res.status(422).json({
            status: FAILURE,
            message: `ERROR: ui_deployment_spec.importMaps not defined [${ui_deployment}]`
        })
        return
    }

    // check for ui_element_spec
    if (! ('ui_element_spec' in ui_element) ) {
      res.status(422).json({
          status: FAILURE,
          message: `ERROR: ui_element_spec not defined [${ui_element}]`
      })
      return
    }

    // check for ui_element_spec.path
    if (! ('path' in ui_element.ui_element_spec) ) {
        res.status(422).json({
            status: FAILURE,
            message: `ERROR: ui_element_spec.path not defined [${ui_element}]`
        })
        return
    }

    // check for ui_element_spec.entry
    if (! ('entry' in ui_element.ui_element_spec) ) {
        res.status(422).json({
            status: FAILURE,
            message: `ERROR: ui_element_spec.entry not defined [${ui_element}]`
        })
        return
    }

    fs.readFile(path.join(rootDir, 'init.js'), "utf8", (err, initjs_content) => {

        fs.readFile(path.join(rootDir, ui_element.ui_element_spec.path), "utf8", (err, html_content) => {

            if (err) {
                res.status(422).json({
                    status: FAILURE,
                    message: `ERROR: ui_element_spec.path not defined [${ui_element}]`
                })
                return
            }

            // context
            let context = {
                APPX_ENV: {
                    RENDER_JSON: RENDER_JSON,
                    KEY_VALUE: KEY_VALUE,
                    RELATIVE_URL: req.url,
                    IMPORT_MAPS: ui_deployment.ui_spec.importMaps,
                    API_MAPS: ui_deployment.ui_deployment_spec.apiMaps,
                },
                entry: ui_element.ui_element_spec.entry,
                data: ui_element.ui_element_spec.data,
            }

            context.init_js = Mustache.render(initjs_content, context)
            // console.log(context.init_js)

            // render the html_content
            let rendered = Mustache.render(html_content, context)

            // send back rendered html_content as html
            res.status(200).type('html').send(rendered)
        })
    })
}

// export
module.exports = {
    handle_html: handle_html
}
