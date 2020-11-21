importScripts('https://unpkg.com/@babel/standalone@7.12.6/babel.js')
//console.log(Babel)

const babelConf = { presets: ['es2017','react'] }

const globalMap = {
  'react': 'React',
  'react-dom': 'ReactDOM',
  '@material-ui/core': 'MaterialUI'
}

const matchUrl = (url, key) => url.includes(`/${key}/`) || url.includes(`/${key}@`);

const getGlobalByUrl = (url) => Object.keys(globalMap).reduce((res, key) => {
    if (res) return res;
    if (matchUrl(url, key)) return globalMap[key];
    return res;
}, null)

self.addEventListener('install', function(event) {
  self.skipWaiting()
  console.log(`Service Worker: install event ${event}`)
})

self.addEventListener('activate', event => {
  clients.claim()
  console.log('Service Worker: ready to handle fetches');
});

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

self.addEventListener('fetch', function(event) {
  //console.log(self.registration)
  const {request: {url}} = event;
  //console.log(`Service Worker: fetch event ${url}`)

  if (globalMap && Object.keys(globalMap).some(key => matchUrl(url, key))) {

    console.log(`Service Worker: convert UMD to ESM [${url}]`)

    event.respondWith(
      fetch(url)
        .then(response => response.text())
        .then(body => new Response(`
          const head = document.getElementsByTagName('head')[0];
          const script = document.createElement('script');
          script.setAttribute('type', 'text/javascript');
          script.appendChild(document.createTextNode(
            ${JSON.stringify(body)}
          ));
          head.appendChild(script);
          export default window.${getGlobalByUrl(url)};
        `, {
          headers: new Headers({
            'Content-Type': 'application/javascript'
          })
        })
      )
    )

  } else if (url.startsWith(self.registration.scope)) {

    if (url.endsWith('.js')) {

      console.log(`Service Worker: babel transform [${url}]`)

      let p = getBabelParser(event.request)

      return event.respondWith(p)

    } else {

      let p = new Promise((resolve, reject) => {

        fetch(event.request)
          .then(response => {
            if (response.url.endsWith('/') && response.status == 404) {
              console.log(`Service Worker: [${url}] 404 redirect [${response.url}index.js]`)
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
            } else {
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
