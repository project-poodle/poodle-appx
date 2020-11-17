importScripts('https://unpkg.com/@babel/standalone@7.12.6/babel.js')
console.log(Babel)

const babelConf = { presets: ['es2017','react'] }

self.addEventListener('install', function(event) {
  //console.log(`install event`)
  /*
  event.waitUntil(
    caches.open('v1').then(function(cache) {
      return cache.addAll([
        '/sw-test/',
        '/sw-test/index.html',
        '/sw-test/style.css',
        '/sw-test/app.js',
        '/sw-test/image-list.js',
        '/sw-test/star-wars-logo.jpg',
        '/sw-test/gallery/bountyHunters.jpg',
        '/sw-test/gallery/myLittleVader.jpg',
        '/sw-test/gallery/snowTroopers.jpg'
      ]);
    })
  );
  */
});

self.addEventListener('fetch', function(event) {
  //console.log(`fetch event ${event.request.url}`)
  //console.log('self.registration')
  //console.log(self.registration)
  if (event.request.url.startsWith(self.registration.scope) && event.request.url.endsWith('.js')) {

    console.log(`transform [${event.request.url}]`)

    let p = new Promise((resolve, reject) => {

      let body = ""

      fetch(event.request).then(function(response) {
        //console.log(`fetch then [${event.request.url}]`)
        //console.log(response.body)
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

  /*
  event.respondWith(caches.match(event.request).then(function(response) {
    // caches.match() always resolves
    // but in case of success response will have value
    if (response !== undefined) {
      return response;
    } else {
      return fetch(event.request).then(function (response) {
        // response may be used only once
        // we need to save clone to put one copy in cache
        // and serve second one
        let responseClone = response.clone();

        caches.open('v1').then(function (cache) {
          cache.put(event.request, responseClone);
        });
        return response;
      }).catch(function () {
        return caches.match('/sw-test/gallery/myLittleVader.jpg');
      });
    }
  }))
  */
})
