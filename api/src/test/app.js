//////////////////////////////////////////////////
// initialize express
const express = require('express')
const router = express.Router()
const app = express()

//////////////////////////////////////////////////
// initialize router --- Note: perform this step only after db_pool is initialized

const routers = []
for (let i=0; i<10; i++) {
    routers.push(express.Router())
    routers[i].get('/i', (req, res) => {
        console.log(req.baseUrl)
        console.log(req.originalUrl)
        console.log(req.url)
        res.send(i.toString())
    })
}

router.use('/r0', routers[0])
router.use('/r1', routers[1])
router.use('/r2', routers[2])

router.use('/', (req, res) => {
    res.send('router')
})

app.use('/api1', routers[1])
app.use('/api1', routers[2])
app.use('/api1', router)
app.use('/api2', router)
app.use('/api3', router)

app.get('/doc', (req, res) => {
    // console.log(req.route)
    res.send('hello')
})

console.log(app._router)

console.log(router)
//////////////////////////////////////////////////
// start listening
var server = app.listen(3000, () => {
    console.log(`INFO: appx rest api server listening at http://${server.address().address}:${server.address().port}`)
})
