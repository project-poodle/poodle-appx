{{#APPX_ENV}}

const AUTH_ROOT = "{{{AUTH_ROOT}}}"
const API_ROOT = "{{{API_ROOT}}}"
const UI_ROOT = "{{{UI_ROOT}}}"

const IMPORT_MAPS = {{#IMPORT_MAPS}}{{#RENDER_JSON}}{{/RENDER_JSON}}{{/IMPORT_MAPS}}
const API_MAPS = {{#API_MAPS}}{{#RENDER_JSON}}{{/RENDER_JSON}}{{/API_MAPS}}
const APPX_PATHS = {{#APPX_PATHS}}{{#RENDER_JSON}}{{/RENDER_JSON}}{{/APPX_PATHS}}
const SELF = {{#SELF}}{{#RENDER_JSON}}{{/RENDER_JSON}}{{/SELF}}
const SPEC = {{#SPEC}}{{#RENDER_JSON}}{{/RENDER_JSON}}{{/SPEC}}
const RELATIVE_URL = "{{{RELATIVE_URL}}}"

let lib_index = 0
{{#IMPORT_MAPS}}
  {{#libs}}
    import { default as {{{name}}} } from "{{{path}}}";
    IMPORT_MAPS["libs"][lib_index++]["modules"] = Object.keys({{{name}}})
  {{/libs}}
{{/IMPORT_MAPS}}

{{/APPX_ENV}}

let BASE_PATH = window.location.pathname;
if (window.location.pathname.endsWith(RELATIVE_URL)) {
  BASE_PATH = window.location.pathname.substring(0, window.location.pathname.length - RELATIVE_URL.length)
  BASE_PATH = (BASE_PATH + '/').replace(/\/+/g, '/')
}

const BASE_ELEM_PATH = BASE_PATH + '_elem/'
IMPORT_MAPS.imports.push({ prefix: 'self/', path: BASE_ELEM_PATH })
IMPORT_MAPS.origin = window.location.origin

const ENTRY_ELEM_PATH = (BASE_PATH + "/_elem/" + "{{{entry}}}").replace(/\/+/g, '/')

// console.log(`INFO: BASE_PATH is [${BASE_PATH}]`)
// console.log(`INFO: BASE_ELEM_PATH is [${BASE_ELEM_PATH}]`)
// console.log(`INFO: ENTRY_ELEM_PATH is [${ENTRY_ELEM_PATH}]`)

globalThis.appx = {
  IMPORT_MAPS: IMPORT_MAPS,
  API_MAPS: API_MAPS,
  RELATIVE_URL: RELATIVE_URL,
  AUTH_ROOT: AUTH_ROOT,
  API_ROOT: API_ROOT,
  UI_ROOT: UI_ROOT,
  APPX_PATHS: APPX_PATHS,
  SELF: SELF,
  SPEC: SPEC,
  BASE_PATH: BASE_PATH,
  BASE_ELEM_PATH: BASE_ELEM_PATH,
  ENTRY_ELEM_PATH: ENTRY_ELEM_PATH,
  SKIP_REG_STEP: false
};

(function() {
  "use strict"

  if (!navigator.serviceWorker || !navigator.serviceWorker.register) {
    document.body.value = `
        This browser is not supported!
        Use a latest version of Chrome, Edge, Safari, or Firefox to view this site.
    `
    return
  }

  function registerImportMaps(controller, basePath, importMaps) {
    // console.log(`INFO: sending 'importMaps' [${basePath}] to service worker`)
    controller.postMessage({
      type: 'importMaps',
      basePath: basePath,
      importMaps: importMaps
    })
  }

  if (!navigator.serviceWorker.controller) {

    globalThis.appx.SKIP_REG_STEP = false
    // register service worker
    navigator.serviceWorker.register('/sw.js', {scope: '/'})
    .then((reg) => {
      // registration successful
      console.log('Service Worker: registration succeeded. Scope is ' + reg.scope)
      //console.log(reg)
      navigator.serviceWorker.ready.then(regActive => {
        console.log('Service Worker: ready')
        //console.log(navigator.serviceWorker)
        //console.log(reg)
        console.log(regActive.active)
        setTimeout(
          () => registerImportMaps(regActive.active, BASE_PATH, IMPORT_MAPS),
          // () => registerImportMaps(navigator.serviceWorker.controller, BASE_PATH, IMPORT_MAPS),
          500
        )
        // Listen to messages from service workers.
        regActive.active.addEventListener('message', function(event) {
            console.log("Got message from service worker: " + event.data)
        })
      })
    }).catch((error) => {
      // registration failed
      console.log('Service Worker: registration failed - ' + error)
    })

  } else {

    registerImportMaps(navigator.serviceWorker.controller, BASE_PATH, IMPORT_MAPS)
    globalThis.appx.SKIP_REG_STEP = true
  }

})()
