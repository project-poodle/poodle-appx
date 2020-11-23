const objPath = require("object-path")
const { log_api_status, SUCCESS, FAILURE, REGEX_VAR } = require('../api/util')

/**
 * handle_html
 */
function handle_html(context, req, res) {
    res.status(200).json(context.ui_element)
}

// export
module.exports = {
    handle_html: handle_html
}
