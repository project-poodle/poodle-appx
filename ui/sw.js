importScripts('/lib/babel.js')

// babel config
const babelConf = {
  presets: [
    'es2017',
    'react'
  ]
}

// exclude dirs
const excludeDirs = [
  '/dist/',
  '/import-maps/',
  '/lib/'
]

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
        var output = Babel.transform(body, babelConf).code;
        //console.log(output)
        resolve(new Response(
          'import {default as lib} from "/dist/lib/main.js";\n'
          + output,
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

  const {request: {url}} = event;
  //console.log(`Service Worker: fetch event ${url}`)

  const isExcluded = excludeDirs.reduce((r, dir) => (r || url.includes(dir)), false)

  if (url.startsWith(self.registration.scope) && !isExcluded) {

    if (url.endsWith('.js') || url.endsWith('.jsx')) {

      console.log(`Service Worker: transform [${url}]`)

      let p = getBabelParser(event.request)

      return event.respondWith(p)

    } else {

      let p = new Promise((resolve, reject) => {

        fetch(event.request)
          .then(response => {

            if (response.status == 404) {

              if (response.url.endsWith('/')) {

                console.log(`Service Worker: redirect [${url}] transform [${response.url}index.js]`)
                newRequest = new Request(response.url + 'index.js')

                let newParser = getBabelParser(newRequest)
                newParser
                  .then(data => {
                    resolve(data)
                  })
                  .catch(error => {
                    reject(error)
                  })

              } else if (!response.url.endsWith('.js') && !response.url.endsWith('.jsx')) {

                console.log(`Service Worker: redirect [${url}] transform [${response.url}.js]`)
                newRequest = new Request(response.url + '.js')

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
            reject(error)
          })
      })

      return event.respondWith(p)
    }
  }
})
