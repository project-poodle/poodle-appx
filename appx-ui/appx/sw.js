importScripts('https://unpkg.com/@babel/standalone@7.12.6/babel.js')

// babel config
const babelConf = { presets: ['es2017','react'] }

// install
self.addEventListener('install', function(event) {
  self.skipWaiting()
  console.log(`Service Worker: install event ${event}`)
})

// activate
self.addEventListener('activate', event => {
  clients.claim()
  console.log('Service Worker: activated - clients claimed');
});

// parse js/jsx with Babel
function getBabelParser(request) {

  let p = new Promise((resolve, reject) => {

    fetch(request)
      .then(response => response.text())
      .then(body => {
        //console.log(`body then [${event.request.url}]`)
        var output = Babel.transform(body, babelConf).code;
        //console.log(output)
        resolve(new Response(
          output,
          {
            headers: {'Content-Type': 'application/javascript'}
          }
        ))
      }).catch(error => {
        console.log(`Service Worker: fetch error [${request.url}] [${error}]`)
        //console.log(response)
        reject(error)
      })
  })

  return p
}

// intercept fetch event
self.addEventListener('fetch', function(event) {
  //console.log(self.registration)
  const {request: {url}} = event;
  //console.log(`Service Worker: fetch event ${url}`)

  if (url.startsWith(self.registration.scope) && !url.includes('/dist/')) {

    if (url.endsWith('.js') || url.endsWith('.jsx')) {

      console.log(`Service Worker: babel transform [${url}]`)

      let p = getBabelParser(event.request)

      return event.respondWith(p)

    } else {

      let p = new Promise((resolve, reject) => {

        fetch(event.request)
          .then(response => {

            if (response.status == 404) {

              if (response.url.endsWith('/')) {

                console.log(`Service Worker: [${url}] redirect [${response.url}index.js]`)
                newRequest = new Request(response.url + 'index.js')
                //console.log(newRequest)
                let newParser = getBabelParser(newRequest)
                newParser
                  .then(data => {
                    resolve(data)
                  })
                  .catch(error => {
                    reject(error)
                  })

              } else if (!response.url.endsWith('.js') && !response.url.endsWith('.js')) {

                console.log(`Service Worker: [${url}] redirect [${response.url}.js]`)
                newRequest = new Request(response.url + '.js')
                //console.log(newRequest)
                let newParser = getBabelParser(newRequest)
                newParser
                  .then(data => {
                    resolve(data)
                  })
                  .catch(error => {
                    reject(error)
                  })

              } else {
                // redirect condition not met, just return
                resolve(response)
              }

            } else {
              // no 404, just return
              resolve(response)
            }

          }).catch(error => {
            console.log(`Service Worker: fetch error [${url}] [${error}]`)
            //console.log(response)
            reject(error)
          })
      })

      return event.respondWith(p)
    }
  }
})
