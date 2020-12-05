//const axios = lib.axios
import axios from 'axios'
import store from 'app-x/redux/store'

// compute base path from app_name
function _get_base_path(app_name) {
  if (!globalThis.appx.API_MAPS) {
    throw new Error(`ERROR: AppX.API_MAPS not set`)
  }

  if (typeof app_name != 'string') {
    throw new Error(`ERROR: app_name is not string [${typeof app_name}]`)
  }

  if (! (app_name in globalThis.appx.API_MAPS)) {
    throw new Error(`ERROR: AppX.API_MAPS missing [${app_name}]`)
  }

  if (! ('rootPath' in globalThis.appx.API_MAPS[app_name])) {
    throw new Error(`ERROR: rootPath missing in AppX.API_MAPS[${app_name}]`)
  }

  let basePath = globalThis.appx.API_MAPS[app_name]['rootPath']

  // deployment is optional
  if ('deployment' in globalThis.appx.API_MAPS[app_name]) {
    const deployment = globalThis.appx.API_MAPS[app_name]['deployment']
    if (!deployment.namespace || !deployment.app_name || !deployment.app_deployment) {
      throw new Error(`ERROR: deployment syntax incorrect ${JSON.stringify(deployment)}`)
    }

    basePath += '/' + deployment.namespace + '/' + deployment.app_name + '/' + deployment.app_deployment
  }

  basePath = ('/' + basePath + '/').replace(/\/+/g, '/')

  return basePath
}

// compute auth base path from app_name
function _get_auth_base_path(app_name) {
  // validity check
  if (!globalThis.appx.API_MAPS) {
    throw new Error(`ERROR: AppX.API_MAPS not set`)
  }

  if (typeof app_name != 'string') {
    throw new Error(`ERROR: app_name is not string [${typeof app_name}]`)
  }

  if (! (app_name in globalThis.appx.API_MAPS)) {
    throw new Error(`ERROR: AppX.API_MAPS missing [${app_name}]`)
  }

  if (! ('rootPath' in globalThis.appx.API_MAPS[app_name])) {
    throw new Error(`ERROR: rootPath missing in AppX.API_MAPS[${app_name}]`)
  }

  let basePath = globalThis.appx.API_MAPS[app_name]['rootPath']

  // deployment is optional
  if ('deployment' in globalThis.appx.API_MAPS[app_name]) {
    const deployment = globalThis.appx.API_MAPS[app_name]['deployment']
    if (!deployment.namespace || !deployment.app_name || !deployment.app_deployment) {
      throw new Error(`ERROR: deployment syntax incorrect ${JSON.stringify(deployment)}`)
    }

    basePath += '/' + deployment.namespace + '/' + deployment.app_name
  }

  basePath = ('/' + basePath + '/').replace(/\/+/g, '/')

  return basePath
}

// get user token from redux store
function _get_user_token(app_name) {
  let user_state = store.getState().userReducer
  let token = null
  let username = null
  if (app_name in user_state && 'userToken' in user_state[app_name]) {
    username = user_state[app_name].userToken.username
    token = user_state[app_name].userToken.token
  }
  //console.log(username, token)
  return {
    username: username,
    token: token,
  }
}

// clear token information at local storage, and broadcast redux message
function _handle_logout(app_name) {

  // get base path
  const basePath = _get_auth_base_path(app_name)

  // save username and token as null
  globalThis.localStorage.removeItem(`/app-x/${app_name}/userToken`)
  globalThis.localStorage.removeItem(`/app-x/${app_name}/userInfo`)
  // broadcast logout message
  store.dispatch({
    type: 'user/logout',
    app_name: app_name,
  })
}

// login for app_name context
function login(app_name, username, password, callback, handler) {
  // get base path
  const basePath = _get_auth_base_path(app_name)
  //console.log(`INFO: api/login - ${realm} ${username} ${password}`)
  axios
    .post(
      basePath + 'login',
      {
        username: username,
        password: password
      })
    .then((res) => {
      if ('data' in res && 'status' in res.data && 'token' in res.data) {
        // login successful, let's record the realm and token
        let ret_token = res.data.token
        // save username and token
        globalThis.localStorage.setItem(`/app-x/${app_name}/userToken`,
          JSON.stringify({username: username, token: ret_token}))
        // broadcast login message
        store.dispatch({
          type: 'user/login',
          app_name: app_name,
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
        _handle_logout(app_name)
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

// logout for app_name context
function logout(app_name, callback, handler) {
  // get base path
  const basePath = _get_auth_base_path(app_name)
  //console.log(`INFO: api/logout - ${realm} ${username}`)
  let { username, token } = _get_user_token(app_name)
  return axios
    .post(
      basePath + 'logout',
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
        _handle_logout(app_name)
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
        _handle_logout(app_name)
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

// get self information
function me(app_name, callback, handler) {
  // get base path
  const basePath = _get_auth_base_path(app_name)
  //console.log(`INFO: api/logout - ${realm} ${username}`)
  if (!app_name) {
    app_name = app_name_context
  }
  const { username, token } = _get_user_token(app_name)
  return axios
    .post(
      basePath + 'user',
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
        globalThis.localStorage.setItem(`/app-x/${app_name}/userInfo`, JSON.stringify(res.data.user))
        // broadcast login message
        store.dispatch({
          type: 'user/info',
          app_name: app_name,
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
        _handle_logout(app_name)
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

// request for app_name context
function request(app_name, conf, callback, handler) {
  // get base path
  const basePath = _get_base_path(app_name)
  const { username, token } = _get_user_token(app_name)
  //console.log(`INFO: api/request - ${app_name} ${conf}`)
  let req = { ...conf }
  if ('url' in conf) {
    req.url = `${basePath}/${conf.url}`.replace(/\/+/g, '/')
  }
  if ('headers' in conf) {
    req.headers = {
      ...conf.headers,
      'Authorization': `AppX ${token}`
    }
  } else {
    req.headers = {
      'Authorization': `AppX ${token}`
    }
  }
  return axios
    .request(req)
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
        _handle_logout(app_name)
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

function get(app_name, url, callback, handler) {
  return request(
    app_name,
    {
      method: 'get',
      url: url,
    },
    callback,
    handler
  )
}

function head(app_name, url, callback, handler) {
  return request(
    app_name,
    {
      method: 'head',
      url: url,
    },
    callback,
    handler
  )
}

function post(app_name, url, data, callback, handler) {
  return request(
    app_name,
    {
      method: 'post',
      url: url,
      data: data,
    },
    callback,
    handler
  )
}

function put(app_name, url, data, callback, handler) {
  return request(
    app_name,
    {
      method: 'put',
      url: url,
      data: data,
    },
    callback,
    handler
  )
}

function patch(app_name, url, data, callback, handler) {
  return request(
    app_name,
    {
      method: 'patch',
      url: url,
      data: data,
    },
    callback,
    handler
  )
}

function del(app_name, url, callback, handler) {
  return request(
    app_name,
    {
      method: 'delete',
      url: url,
    },
    callback,
    handler
  )
}

export {
  login,
  logout,
  me,
  get,
  head,
  post,
  put,
  patch,
  del,
  request,
}
