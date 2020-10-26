const db = require('../db/db')

const SUCCESS = "ok"
const FAILURE = "failure"

const log_api_status = (api_result, status, message) => {

    db.query_sync(`INSERT INTO api_status
                    (
                        namespace,
                        runtime_name,
                        app_name,
                        obj_name,
                        api_method,
                        api_endpoint,
                        api_state
                    )
                    VALUES
                    (
                        ?, ?, ?, ?, ?, ?,
                        JSON_OBJECT('status', '${status}', 'message', '${message}')
                    )
                    ON DUPLICATE KEY UPDATE
                        api_state=VALUES(api_state)`,
                    [
                        api_result.namespace,
                        api_result.runtime_name,
                        api_result.app_name,
                        api_result.obj_name,
                        api_result.api_method,
                        api_result.api_endpoint
                    ])
}

module.exports = {
    log_api_status: log_api_status,
    SUCCESS: SUCCESS,
    FAILURE: FAILURE
}
