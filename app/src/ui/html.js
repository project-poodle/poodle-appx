const fs = require('fs')
const url = require('url')
const path = require('path');
const objPath = require("object-path")
const prettier = require("prettier")
const Mustache = require('mustache')
const { SUCCESS, FAILURE, REGEX_VAR } = require('../api/util')

const rootDir = path.join(__dirname, '../../../ui/')
// const INDEX_HTML = 'index.html'

const RENDER_JSON = function() {

    let process = function(data, depth) {

        if (data === null || typeof data == "undefined") {
            return 'null'
        } else if (typeof data == "number") {
            return data.toString()
        } else if (typeof data == "boolean") {
            return data.toString()
        } else if (typeof data == "string") {
            //if (data.startsWith('`') && data.endsWith('`')) {
            //    return data.substring(1, data.length-1)
            //} else {
                return '"' + data.replace(/"/g, '\\"') + '"'
            //}
        } else if (Array.isArray(data)) {
            let results = []
            data.forEach((value) => {
                results.push(process(value, depth+1))
            })
            return '[ ' + results.join(', ') + ' ]'
        } else {
            let results = []
            Object.keys(data).forEach((key) => {
                results.push('"' + key + '": ' + process(data[key], depth+1))
            })
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

    // const { ui_deployment, ui_component } = req.context

    // check for importMaps
    if (! ('ui_spec' in req.context) || ! ('importMaps' in req.context.ui_spec) ) {
        return {
            status: 422,
            type: 'application/json',
            data: {
                status: FAILURE,
                message: `ERROR: ui_spec.importMaps not defined [${ui_deployment}]`
            }
        }
    }

    // check for apiMaps
    if (! ('ui_deployment_spec' in req.context) || ! ('apiMaps' in req.context.ui_deployment_spec) ) {
        return {
            status: 422,
            type: 'application/json',
            data: {
                status: FAILURE,
                message: `ERROR: ui_deployment_spec.apiMaps not defined [${ui_deployment}]`
            }
        }
    }

    // check for ui_component_spec
    if (! ('ui_component_spec' in req.context) ) {
        return {
            status: 422,
            type: 'application/json',
            data: {
                status: FAILURE,
                message: `ERROR: ui_component_spec not defined [${ui_component}]`
            }
        }
    }

    // check for ui_component_spec.entry
    if (! ('entry' in req.context.ui_component_spec) ) {
        return {
            status: 422,
            type: 'application/json',
            data: {
                status: FAILURE,
                message: `ERROR: ui_component_spec.entry not defined [${ui_component}]`
            }
        }
    }

    const initjs_content = fs.readFileSync(path.join(rootDir, 'init.js'), "utf8")
    const html_content = fs.readFileSync(path.join(rootDir, 'index.html'), "utf8")

    // console.log(req.appx_paths)

    // context
    let context = {
        APPX_ENV: {
            RENDER_JSON: RENDER_JSON,
            KEY_VALUE: KEY_VALUE,
            AUTH_ROOT: req.mount_options.auth_root,
            API_ROOT: req.mount_options.api_root,
            UI_ROOT: req.mount_options.ui_root,
            RELATIVE_URL: url.parse(req.url).pathname,
            APPX_PATHS: { 'paths': req.appx_paths },
            IMPORT_MAPS: req.context.ui_spec.importMaps,
            API_MAPS: req.context.ui_deployment_spec.apiMaps,
            SPEC: req.appx_spec,
        },
        entry: req.context.ui_component_spec.entry,
        data: req.context.ui_component_spec,
    }

    context.init_js = Mustache.render(initjs_content, context)
    // console.log(context.init_js)

    // render the html_content
    let rendered = Mustache.render(html_content, context)

    // prettify
    const prettified = prettier.format(rendered, { semi: false, parser: "html" })

    // send back rendered html_content as html
    // res.status(200).type('html').send(prettified)
    return {
        status: 200,
        type: 'html',
        data: prettified,
    }
}

// export
module.exports = {
    handle_html: handle_html,
    RENDER_JSON: RENDER_JSON,
    KEY_VALUE: KEY_VALUE,
}
