const express = require('express');
const router = express.Router();
const db = require('../db/db')

// track a list of endpoints
let endpoints = []

let db_pool = db.getPool()
db_pool.query(`SELECT
                    api.namespace,
                    api.app_name, api.app_ver,
                    deployment.env_name,
                    obj_name,
                    api_method, api_endpoint, api_spec
                FROM api
                JOIN deployment
                    ON api.namespace = deployment.namespace
                    AND api.app_name = deployment.app_name
                    AND api.app_ver = deployment.app_ver
                WHERE api.deleted=0 AND deployment.deleted=0`,
                (err, results) => {

    if (err) throw err;

    results.forEach((result) => {

        let endpoint = '/' + result.namespace + '/' + result.env_name + '/' + result.app_name + '/' + result.api_endpoint
        endpoint = endpoint.replace(/\/+/g, '/')
        endpoints.push({
            method: result.api_method,
            endpoint: endpoint,
            spec: JSON.parse(result.api_spec)
        })

        switch (result.api_method) {
            case "get":
                router.get(endpoint, (req, res) => {
                    res.send(JSON.stringify(JSON.parse(result.api_spec), null, 4))
                })
                break
            case "post":
                router.post(endpoint, (req, res) => {
                    res.send(JSON.stringify(JSON.parse(result.api_spec), null, 4))
                })
                break
            case "put":
                router.put(endpoint, (req, res) => {
                    res.send(JSON.stringify(JSON.parse(result.api_spec), null, 4))
                })
                break
            case "delete":
                router.delete(endpoint, (req, res) => {
                    res.send(JSON.stringify(JSON.parse(result.api_spec), null, 4))
                })
                break
            default:
                throw Error(`unknow api method: ${result.api_method} [${JSON.stringify(result)}]`)
        }
    });
})

//export this router to use in our index.js
module.exports = {
    router: router,
    endpoints: endpoints
}
