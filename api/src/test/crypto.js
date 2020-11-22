//////////////////////////////////////////////////
// initialize express
const crypto = require('crypto')

crypto.randomBytes(64, function(err, buffer) {
    var token = buffer.toString('hex')
    console.log(token)
});

