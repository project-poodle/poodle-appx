//const axios = lib.axios
import axios from 'axios'

import store from 'app-x/redux/store'

var api_base_url = '/appx/api'

var app_context = {
  namespace: 'sys',
  app_name: 'appx',
  runtime_name: 'base',
}

var appx_token = null

function get_api_base_url() {
  return api_base_url
}

function set_api_base_url(url) {
  api_base_url = url
}

function get_app_context() {
  return app_context
}

function set_app_context(context) {
  app_context = context
}

// clear token information at local storage, and broadcast redux message
function _handle_logout(app) {
  // update in memory appx_token to null
  appx_token = null
  // save username and token as null
  window.localStorage.setItem(`/app-x/${app.namespace}/${app.app_name}/userToken`, JSON.stringify({username: null, token: null}))
  window.localStorage.setItem(`/app-x/${app.namespace}/${app.app_name}/userInfo`, JSON.stringify({username: null, user_info: null}))
  // broadcast logout message
  store.dispatch({
    type: 'user/logout',
    namespace: app.namespace,
    app_name: app.app_name,
  })
}

// login for app context
function login(app, username, password, callback, handler) {
  //console.log(`INFO: api/login - ${realm} ${username} ${password}`)
  if (!app) {
    app = app_context
  }
  axios
    .post(
      `/${api_base_url}/${app.namespace}/${app.app_name}/login`.replace(/\/+/g, '/'),
      {
        username: username,
        password: password
      })
    .then((res) => {
      if ('data' in res && 'status' in res.data && 'token' in res.data) {
        // login successful, let's record the realm and token
        let ret_token = res.data.token
        // save username and token
        window.localStorage.setItem(`/app-x/${app.namespace}/${app.app_name}/userToken`,
          JSON.stringify({username: username, token: ret_token}))
        // broadcast login message
        store.dispatch({
          type: 'user/login',
          namespace: app.namespace,
          app_name: app.app_name,
          userToken: {
            username: username,
            token: ret_token,
          }
        })
        if (callback) {
          callback(res.data)
        }
      } else {
        let ret = {
          status: 'error',
          message: `ERROR: missing status or token in response`,
          data: res
        }
        if (handler) {
          handler(ret)
        } else {
          console.log(ret)
        }
      }
    })
    .catch((err) => {
      console.log(err.stack)
      if (err.response && 'status' in err.response && err.response.status === 401) {
        _handle_logout(app)
      }
      let res = {
        status: 'error',
        message: err.toString(),
        data: err.response,
      }
      if ('response' in err && 'data' in err.response) {
        res = { ...res, ...err.response.data }
      }
      if (handler) {
        handler(res)
      }
    })
}

function _get_user_token(app) {
  let app_state = store.getState().userReducer
  let token = null
  let username = null
  if (app.namespace in app_state && app.app_name in app_state[app.namespace] && 'userToken' in app_state[app.namespace][app.app_name]) {
    username = app_state[app.namespace][app.app_name].userToken.username
    token = app_state[app.namespace][app.app_name].userToken.token
  }
  //console.log(username, token)
  return {
    username: username,
    token: token,
  }
}

// logout for app context
function logout(app, callback, handler) {
  //console.log(`INFO: api/logout - ${realm} ${username}`)
  if (!app) {
    app = app_context
  }
  let { username, token } = _get_user_token(app)
  return axios
    .post(
      `/${api_base_url}/${app.namespace}/${app.app_name}/logout`.replace(/\/+/g, '/'),
      {
        username: username,
      },
      {
        headers: {
          'Authorization': `AppX ${token}`
        }
      }
    )
    .then((res) => {
      if ('data' in res && 'status' in res.data) {
        _handle_logout(app)
        if (callback) {
          callback(res.data)
        }
      } else {
        let ret = {
          status: 'error',
          message: `ERROR: missing status in response`,
          data: res
        }
        if (handler) {
          handler(ret)
        } else {
          console.log(ret)
        }
      }
    })
    .catch((err) => {
      console.log(err.stack)
      if ('status' in err.response && err.response.status === 401) {
        _handle_logout(app)
      }
      let res = {
        status: 'error',
        message: err.toString(),
        data: err.response,
      }
      if ('response' in err && 'data' in err.response) {
        res = { ...res, ...err.response.data }
      }
      if (handler) {
        handler(res)
      }
    })
}

// logout for app context
function get_user_info(app, callback, handler) {
  //console.log(`INFO: api/logout - ${realm} ${username}`)
  if (!app) {
    app = app_context
  }
  let { username, token } = _get_user_token(app)
  return axios
    .post(
      `/${api_base_url}/${app.namespace}/${app.app_name}/user`.replace(/\/+/g, '/'),
      {
        username: username,
      },
      {
        headers: {
          'Authorization': `AppX ${token}`
        }
      }
    )
    .then((res) => {
      if ('data' in res && 'status' in res.data && 'user' in res.data) {
        // save username and token
        window.localStorage.setItem(`/app-x/${app.namespace}/${app.app_name}/userInfo`, JSON.stringify(res.data.user))
        // broadcast login message
        store.dispatch({
          type: 'user/info',
          namespace: app.namespace,
          app_name: app.app_name,
          username: username,
          userInfo: res.data.user
        })
        if (callback) {
          callback(res.data)
        }
      } else {
        let ret = {
          status: 'error',
          message: `ERROR: missing status or user info in response`,
          data: res
        }
        if (handler) {
          handler(ret)
        } else {
          console.log(ret)
        }
      }
    })
    .catch((err) => {
      console.log(err.stack)
      if (err.response && 'status' in err.response && err.response.status === 401) {
        _handle_logout(app)
      }
      let res = {
        status: 'error',
        message: err.toString(),
        data: err.response,
      }
      if ('response' in err && 'data' in err.response) {
        res = { ...res, ...err.response.data }
      }
      if (handler) {
        handler(res)
      }
    })
}

// request for app context
function request(app, conf, callback, handler) {
  //console.log(`INFO: api/request - ${app} ${conf}`)
  let req = { ...conf }
  if ('url' in conf) {
    req.url = `/${api_base_url}/${app.namespace}/${app.app_name}/${app.runtime_name}/${conf.url}`.replace(/\/+/g, '/')
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
      if (err.response && 'status' in err.response && err.response.status === 401) {
        _handle_logout(app)
      }
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

export {
  get_api_base_url,
  set_api_base_url,
  get_app_context,
  set_app_context,
  login,
  logout,
  get_user_info,
  get,
  head,
  post,
  put,
  patch,
  del,
  request,
}
