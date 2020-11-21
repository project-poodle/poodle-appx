const head = document.getElementsByTagName('head')[0];

const importMap = document.createElement('script');
importMap.setAttribute('type', 'importmap-shim');

fetch('/import-maps/import-maps.json')
  .then(res => res.json())
  .then(body => {

    // load importmap
    importMap.appendChild(document.createTextNode(
      JSON.stringify(body, null, 4)
    ));
    head.appendChild(importMap);

    // import Shim script
    const importShim = document.createElement('script');
    importShim.setAttribute('type', 'text/javascript');
    importShim.src = '/import-maps/es-module-shims.js';
    head.appendChild(importShim);
  })
  .catch(err => {
    throw err
  });
