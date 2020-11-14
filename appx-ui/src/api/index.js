const axios = require('axios').default;

var appx_token = null
var base_url = '/api'

function get_base_url() {
  return base_url
}

function set_base_url(url) {
  base_url = url
}


function login(realm, username, password, callback, handler) {
  //console.log(`INFO: api/login - ${realm} ${username} ${password}`)
  axios
    .post(
      '/login/local',
      {
        realm: realm,
        username: username,
        password: password
      })
    .then((res) => {
      if ('data' in res && 'status' in res.data && 'token' in res.data) {
        appx_token = res.token
        callback(res.data)
      } else {
        handler({
          status: 'error',
          message: `ERROR: missing status or token in response`,
          data: res
        })
      }
    })
    .catch((err) => {
      let res = {
        status: 'error',
        message: err.toString(),
        data: err.response,
      }
      if ('response' in err && 'data' in err.response) {
        res = { ...res, ...err.response.data }
      }
      handler(res)
    })
}

function logout(realm, username, callback, handler) {
  //console.log(`INFO: api/logout - ${realm} ${username}`)
  return axios
    .post(
      '/logout',
      {
        realm: realm,
        username: username,
      },
      {
        headers: {
          'Authorization': `AppX ${appx_token}`
        }
      }
    )
    .then((res) => {
      if ('data' in res && 'status' in res.data) {
        appx_token = ''
        callback(res.data)
      } else {
        handler({
          status: 'error',
          message: `ERROR: missing status in response`,
          data: res
        })
      }
    })
    .catch((err) => {
      handler({
        status: 'error',
        message: err.toString(),
        data: err.response,
      })
    })
}

function request(app, conf, callback, handler) {
  //console.log(`INFO: api/request - ${app} ${conf}`)
  let req = { ...conf }
  if ('url' in conf) {
    req.url = `/${base_url}/${app.namespace}/${app.runtime_name}/${app.app_name}/${conf.url}`.replace(/\/+/g, '/')
  }
  if ('headers' in conf) {
    req.headers = {
      ...conf.headers,
      'Authorization': `AppX ${appx_token}`
    }
  } else {
    req.headers = {
      'Authorization': `AppX ${appx_token}`
    }
  }
  return axios(req)
    .then((res) => {
      if ('data' in res) {
        if ('status' in res.data) {
          if (res.data.status === 'ok') {
            callback(res.data)
          } else {
            handler(res.data)
          }
        } else {
          callback(res.data)
        }
      } else {
        handler({
          status: `error`,
          message: `ERROR: empty response data`,
          data: res
        })
      }
    })
    .catch((err) => {
      handler({
        status: 'error',
        message: err.toString(),
        data: err.response
      })
    })
}

function get(app, url, callback, handler) {
  return request(
    app,
    {
      method: 'get',
      url: url,
    },
    callback,
    handler
  )
}

function head(app, url, callback, handler) {
  return request(
    app,
    {
      method: 'head',
      url: url,
    },
    callback,
    handler
  )
}

function post(app, url, data, callback, handler) {
  return request(
    app,
    {
      method: 'post',
      url: url,
      data: data,
    },
    callback,
    handler
  )
}

function put(app, url, data, callback, handler) {
  return request(
    app,
    {
      method: 'put',
      url: url,
      data: data,
    },
    callback,
    handler
  )
}

function patch(app, url, data, callback, handler) {
  return request(
    app,
    {
      method: 'patch',
      url: url,
      data: data,
    },
    callback,
    handler
  )
}

function del(app, url, callback, handler) {
  return request(
    app,
    {
      method: 'delete',
      url: url,
    },
    callback,
    handler
  )
}

module.exports = {
  login: login,
  logout: logout,
  get_base_url: get_base_url,
  set_base_url: set_base_url,
  get: get,
  head: head,
  post: post,
  put: put,
  patch: patch,
  del: del,
  request: request,
}
