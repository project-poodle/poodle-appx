importScripts('https://unpkg.com/@babel/standalone@7.12.6/babel.js')
//console.log(Babel)

const babelConf = { presets: ['es2017','react'] }

self.addEventListener('install', function(event) {
  self.skipWaiting()
  console.log(`Service Worker: install event ${event}`)
})

self.addEventListener('activate', event => {
  clients.claim()
  console.log('Service Worker: ready to handle fetches');
});

self.addEventListener('fetch', function(event) {
  // console.log(`Service Worker: fetch event ${event.request.url}`)
  //console.log(self.registration)
  if (event.request.url.startsWith(self.registration.scope) && event.request.url.endsWith('.js')) {

    console.log(`transform [${event.request.url}]`)

    let p = new Promise((resolve, reject) => {

      let body = ""

      fetch(event.request).then(function(response) {
        //console.log(`fetch then [${event.request.url}]`)
        body = response.text()
        //console.log(body)
        body.then(text => {
          //console.log(`body then [${event.request.url}]`)
          var output = Babel.transform(text, babelConf).code;
          //console.log(output)
          resolve(new Response(
            output,
            {
              headers: {'Content-Type': 'application/javascript'}
            }
          ))
        }).catch(error => {
          console.log(`body error [${event.request.url}] [${error}]`)
          //console.log(response)
          reject(response)
        })
      }).catch(function(error) {
        console.log(`fetch error [${event.request.url}] [${error}]`)
        //console.log(response)
        reject(response)
      })
    })

    return event.respondWith(p)
  }
})
