importScripts('/dist/lib/transpile.js')

const importMappings = {}

const UI_PREFIX = '/appx/ui/'

// exclude dirs
const excludeDirs = [
  '/lib/',
  '/dist/',
  '/api/',
  '/appx/api/',
  // '/appx/ui/',
  // '/import-maps/'
]

// install
self.addEventListener('install', function(event) {
  self.skipWaiting()
  console.log(`Service Worker: install event ${event}`)
})

// activate
self.addEventListener('activate', event => {
  clients.claim()
  console.log('Service Worker: activated - clients claimed')
})

// message
self.addEventListener('message', event => {
  switch (event.data.type) {
    case "importMaps":
      if ('basePath' in event.data && 'importMaps' in event.data) {
        importMappings[event.data.basePath] = {...event.data.importMaps }
        console.log(`Service Worker: updated [${event.data.basePath}] importMaps to ${JSON.stringify(importMappings[event.data.basePath])}`)
      } else {
        console.log(`Service Worker: unrecognized importMaps message - ${event.data}`)
      }
      break
    default:
      console.log(`Service Worker: unrecognized message - ${event.data}`)
  }
})

// parse js/jsx with Babel
function getTranspiler(request) {

  let p = new Promise((resolve, reject) => {

    fetch(request)
      .then(response => {
        var result=response.text();
        // console.log(response.headers);
        return result
      }).then(body => {
        //console.log(body)
        //console.log(Transpile)
        let url = new URL(request.url)
        let importMaps = null
        //console.log(`Service Worker: url.pathname [${url.pathname}]`)
        //console.log(`Service Worker: importMappings key [${Object.keys(importMappings)}]`)
        let foundPrefix = Object.keys(importMappings).find(prefix => url.pathname.startsWith(prefix))
        if (foundPrefix) {
          importMaps = importMappings[foundPrefix]
        }
        let transpiledCode = Transpile(body, importMaps)
        // console.log(transpiledCode)
        resolve(new Response(
          //'import {default as lib} from "/dist/lib/main.js";\n' +
          //'import {default as material} from "/dist/lib/material.js";\n' +
          transpiledCode,
          {
            headers: {'Content-Type': 'application/javascript; charset=utf-8'}
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

  const { request: {url} } = event;
  //console.log(`Service Worker: fetch event ${url}`)

  const isExcluded = excludeDirs.reduce((r, dir) => (r || url.includes(dir)), false)

  if (url.startsWith(self.registration.scope) && !isExcluded) {

    if (url.includes(UI_PREFIX)) {

      console.log(`Service Worker: UI transform [${url}]`)

    } else if (url.endsWith('.js') || url.endsWith('.jsx')) {

      console.log(`Service Worker: transpile [${url}]`)

      let p = getTranspiler(event.request)

      return event.respondWith(p)

    } else {

      let p = new Promise((resolve, reject) => {

        fetch(event.request)
          .then(response => {

            if (response.status == 404) {

              if (response.url.endsWith('/')) {

                console.log(`Service Worker: redirect [${url}] transpile [${response.url}index.js]`)
                newRequest = new Request(response.url + 'index.js')

                let newParser = getTranspiler(newRequest)
                newParser
                  .then(data => {
                    resolve(data)
                  })
                  .catch(error => {
                    reject(error)
                  })

              } else if (!response.url.endsWith('.js') && !response.url.endsWith('.jsx')) {

                console.log(`Service Worker: redirect [${url}] transpile [${response.url}.js]`)
                newRequest = new Request(response.url + '.js')

                let newParser = getTranspiler(newRequest)
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
