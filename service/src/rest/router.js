const express = require('express');
const router = express.Router();
const db = require('../db/db')

db.query('SELECT * FROM api', (err, results) => {

    if (err) throw err;

})

//export this router to use in our index.js
module.exports = router;
