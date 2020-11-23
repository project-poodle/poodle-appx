//////////////////////////////////////////////////
// proxy
const pkg = require('./package.json')
const { createProxyMiddleware } = require('http-proxy-middleware')

//const apiProxy = createProxyMiddleware('/api', {
//  target: 'http://localhost:3000/',
//  changeOrigin: true, // for vhosted sites
//})

const apiProxy = createProxyMiddleware(pkg.proxy_api_base, {
  target: pkg.proxy_server,
  changeOrigin: true, // for vhosted sites
})

const uiProxy = createProxyMiddleware(pkg.proxy_ui_base, {
  target: pkg.proxy_server,
  changeOrigin: true, // for vhosted sites
})

//////////////////////////////////////////////////
// configs
module.exports = {
  open: "local",
  server: {
    "baseDir": ".",
    // Start from key `10` in order to NOT overwrite the default 2 middleware provided
    // by `lite-server` or any future ones that might be added.
    // Reference: https://github.com/johnpapa/lite-server/blob/master/lib/config-defaults.js#L16
    middleware: {
      10: apiProxy,
      20: uiProxy,
    }
  }
}

//////////////////////////////////////////////////
