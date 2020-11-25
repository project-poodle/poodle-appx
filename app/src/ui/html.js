const fs = require('fs')
const path = require('path');
const objPath = require("object-path")
const Mustache = require('mustache')
const { log_api_status, SUCCESS, FAILURE, REGEX_VAR } = require('../api/util')

const rootDir = path.join(__dirname, '../../../ui/')
// const INDEX_HTML = 'index.html'

/**
 * handle_html
 */
function handle_html(req, res) {

    const { ui_deployment, ui_element, ui_route } = req.context

    console.log(JSON.stringify(req.context, null, 4))

    if (! ('ui_element_spec' in ui_element) || ! ('path' in ui_element.ui_element_spec) ) {
        res.status(422).json({
            status: FAILURE,
            message: `ERROR: ui_element_spec.path not defined [${ui_element}]`
        })
        return
    }

    fs.readFile(path.join(rootDir, ui_element.ui_element_spec.path), "utf8", (err, content) => {

        if (err) {
            res.status(422).json({
                status: FAILURE,
                message: `ERROR: ui_element_spec.path not defined [${ui_element}]`
            })
            return
        }

        let rendered = content
        if ('data' in ui_element.ui_element_spec) {
            rendered = Mustache.render(content, ui_element.ui_element_spec.data)
        }

        // send back rendered content as html
        res.status(200).type('html').send(rendered)
    })
}

// export
module.exports = {
    handle_html: handle_html
}
