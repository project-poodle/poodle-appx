importScripts('/dist/lib/transpile.js')

const importMappings = {}

const UI_PREFIX = '/appx/ui/'

// exclude dirs
const excludeDirs = [
  '/lib/',
  '/dist/',
  '/api/',
  '/appx/api/',
  // '/ui/',
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
  // process message
  switch (event.data.type) {
    case "importMaps":
      event.waitUntil(async function() {
        // get client
        const client = await clients.get(event.source.id);
        if (!client) {
          console.error(`unable to find client [${event.source.id}]`)
          return
        }
        // check import maps message
        if (!!event.data.basePath && !!event.data.importMaps) {
          if (!Transpile._.isEqual(importMappings[event.data.basePath], event.data.importMaps)) {
            importMappings[event.data.basePath] = {...event.data.importMaps }
            console.log(`Service Worker: updated [${event.data.basePath}] importMaps`, importMappings[event.data.basePath])
          }
          client.postMessage({
            type: "importMaps",
            status: "ok",
            basePath: event.data.basePath,
          })
          // console.log(`Service Worker: updated [${event.data.basePath}] importMaps`)
        } else {
          console.log(`Service Worker: unrecognized importMaps message - ${JSON.stringify(event.data)}`)
          client.postMessage({
            type: "importMaps",
            status: "error",
            basePath: event.data.basePath,
            message: `Unrecognized importMaps message [${JSON.stringify(event.data)}]`,
          })
        }
      }())
      break
    case "transpile":
      if ('code' in event.data && 'url' in event.data) {
        event.waitUntil(async function() {
          // Exit early if we don't have access to the client.
          // Eg, if it's cross-origin.
          if (!event.source.id) return;
          const client = await clients.get(event.source.id);
          if (!client) {
            console.error(`unable to find client [${event.source.id}]`)
            return
          }
          // transpile
          try {
            let transpiled_code = sw_transpile(event.data.code, event.data.url)
            let message = {
              ...event.data,
              type: "transpile",
              status: "ok",
              code: transpiled_code,
            }
            client.postMessage(message)
            // console.log('posted', message)
          } catch (err) {
            // console.error(String(err))
            client.postMessage({
              ...event.data,
              type: "transpile",
              status: "error",
              message: err.toString(),
            })
          }
        }())
      } else {
        console.log(`Service Worker: unrecognized transpile message - ${event.data}`)
      }
      break
    default:
      console.log(`Service Worker: unrecognized message - ${event.data}`)
  }
})

// transpile body
function sw_transpile(body, dataUrl) {
  //console.log(body)
  //console.log(Transpile)
  let url = new URL(dataUrl)
  //console.log(url)
  let importMaps = null
  //console.log(`Service Worker: url.pathname [${url.pathname}]`)
  //console.log(`Service Worker: importMappings key [${Object.keys(importMappings)}]`)
  let foundPrefix = Object.keys(importMappings).find(prefix => url.pathname.startsWith(prefix))
  if (foundPrefix) {
    importMaps = importMappings[foundPrefix]
  }
  //console.log(body)
  let transpiledCode = Transpile(body, importMaps)
  // console.log(transpiledCode)
  return transpiledCode
}

// parse js/jsx with Babel
function getTranspiler(request) {

  let p = new Promise((resolve, reject) => {

    fetch(request)
      .then(response => {
        var result=response.text();
        // console.log(response.headers);
        return result
      }).then(body => {
        const transpiledCode = sw_transpile(body, request.url)
        resolve(new Response (
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

      // console.log(`Service Worker: transpile [${url}]`)

      let p = getTranspiler(event.request)

      return event.respondWith(p)

    } else {

      let p = new Promise((resolve, reject) => {

        fetch(event.request)
          .then(response => {
            // console.log(response.url)
            if (response.status == 404) {

              if (response.url.endsWith('/')) {

                // console.log(`Service Worker: redirect [${url}] transpile [index.js]`)
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

                // console.log(`Service Worker: redirect [${url}] transpile [.js]`)
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

            } else if (response.url.endsWith('.js') || response.url.endsWith('.jsx')) {

              response.text().then(body => {
                const transpiledCode = sw_transpile(body, response.url)
                resolve(new Response (
                  transpiledCode,
                  {
                    headers: {'Content-Type': 'application/javascript; charset=utf-8'}
                  }
                ))
              }).catch(error => {
                // reject
                reject(error)
              })

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
