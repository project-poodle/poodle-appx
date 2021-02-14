//const axios = lib.axios
import axios from 'axios'
import store from 'app-x/redux/store'
import { notification } from 'antd'

// valid api status
const VALID_API_STATUS = ['ok', 'error', 'info', 'warning', 'success']

// compute base path from namespace and app_name
function _get_base_path(namespace, app_name) {
  if (!globalThis.appx?.API_MAPS.api) {
    throw new Error(`ERROR: appx.API_MAPS.api not set`)
  }

  if (typeof namespace != 'string') {
    throw new Error(`ERROR: namespace is not string [${typeof namespace}]`)
  }

  if (typeof app_name != 'string') {
    throw new Error(`ERROR: app_name is not string [${typeof app_name}]`)
  }

  const apiMap = globalThis.appx.API_MAPS.api.find(row => {
    return (row.namespace === namespace) && (row.app_name === app_name)
  })

  if (! apiMap) {
    throw new Error(`ERROR: appx.API_MAPS missing [${namespace}/${app_name}]`)
  }

  if (! ('rootPath' in apiMap)) {
    throw new Error(`ERROR: rootPath missing in appx.API_MAPS[${namespace}][${app_name}]`)
  }

  let basePath = apiMap['rootPath']

  // app_deployment is optional
  if ('app_deployment' in apiMap) {
    basePath += '/' + apiMap.namespace + '/' + apiMap.app_name + '/' + apiMap.app_deployment
  }

  basePath = ('/' + basePath + '/').replace(/\/+/g, '/')

  return basePath
}

// compute app auth base path from namespace and app_name
function _get_app_auth_base_path(namespace, app_name) {
  // validity check
  if (!globalThis.appx?.API_MAPS.api) {
    throw new Error(`ERROR: appx.API_MAPS.api not set`)
  }

  if (typeof namespace != 'string') {
    throw new Error(`ERROR: namespace is not string [${typeof namespace}]`)
  }

  if (typeof app_name != 'string') {
    throw new Error(`ERROR: app_name is not string [${typeof app_name}]`)
  }

  const apiMap = globalThis.appx.API_MAPS.api.find(row => {
    return (row.namespace === namespace) && (row.app_name === app_name)
  })

  if (! apiMap) {
    throw new Error(`ERROR: appx.API_MAPS missing [${namespace}/${app_name}]`)
  }

  if (! ('rootPath' in apiMap)) {
    throw new Error(`ERROR: rootPath missing in appx.API_MAPS[${namespace}][${app_name}]`)
  }

  let basePath = apiMap['rootPath'] + '/' + apiMap.namespace + '/' + apiMap.app_name + '/'

  basePath = ('/' + basePath + '/').replace(/\/+/g, '/')

  return basePath
}

// compute global auth base path
function _get_global_auth_base_path(realm) {
  // validity check
  if (!globalThis.appx?.API_MAPS.api) {
    throw new Error(`ERROR: appx.API_MAPS not set`)
  }

  if (typeof realm != 'string') {
    throw new Error(`ERROR: realm is not string [${typeof realm}]`)
  }

  const apiMap = globalThis.appx.API_MAPS.api.find(row => {
    return (row.namespace === 'sys') && (row.app_name === 'auth')
  })

  if (! apiMap) {
    throw new Error(`ERROR: appx.API_MAPS missing [sys][auth]`)
  }

  if (! ('rootPath' in apiMap)) {
    throw new Error(`ERROR: rootPath missing in appx.API_MAPS[sys][auth]`)
  }

  let basePath = apiMap['rootPath']

  basePath = ('/' + basePath + '/').replace(/\/+/g, '/')

  return basePath
}

// get user token from redux store by realm
function _get_token_by_realm(realm) {
  let user_state = store.getState().userReducer
  let token = null
  let username = null
  if (realm in user_state && 'username' in user_state[realm] && 'token' in user_state[realm]) {
    username = user_state[realm].username
    token = user_state[realm].token
  }
  //console.log(username, token)
  return {
    realm: realm,
    username: username,
    token: token,
  }
}

// get user token from redux store by namespace and app_name
function _get_token_by_app(namespace, app_name, callback, handler) {
  // roleReducer
  let role_state = store.getState().roleReducer
  let realm = null
  let username = null
  let token = null
  if (namespace in role_state
      && app_name in role_state[namespace]
      && 'realm' in role_state[namespace][app_name]
      && 'username' in role_state[namespace][app_name]) {
    realm = role_state[namespace][app_name].realm
    username = role_state[namespace][app_name].username
  }
  if (realm != null) {
    // userReducer
    let user_state = store.getState().userReducer
    if (realm in user_state
        && 'token' in user_state[realm]
        && 'username' in user_state[realm]) {
      token = user_state[realm].token
      username = user_state[realm].username
      if (callback) {
        callback({
          realm: realm,
          username: username,
          token: token
        })
      }
    } else {
      if (handler) {
        handler(`ERROR: unable to find token for realm [${realm}]`)
      }
    }
  } else {
    lookup_realm(
      namespace,
      app_name,
      data => {
        realm = data.realm
        let user_state = store.getState().userReducer
        if (realm in user_state
            && 'token' in user_state[realm]
            && 'username' in user_state[realm]) {
          token = user_state[realm].token
          username = user_state[realm].username
          if (callback) {
            callback({
              realm: realm,
              username: username,
              token: token
            })
          }
        } else {
          if (handler) {
            handler(`ERROR: unable to find token for realm [${realm}]`)
          }
        }
      },
      err => {
        console.error(err)
        if (handler) {
          handler(err)
        }
      }
    )
  }
  //console.log(username, token)
  return {
    realm: realm,
    username: username,
    token: token,
  }
}

// clear token information at local storage, and broadcast redux message
function _handle_logout(realm) {

  // get base path
  const basePath = _get_global_auth_base_path(realm)

  // save username and token as null
  globalThis.localStorage.removeItem(`/app-x/realm/${realm}`)
  // broadcast logout message
  store.dispatch({
    type: 'user/logout',
    realm: realm,
  })
}

// login for app_name context
const login = (realm, username, password, callback, handler) => {
  // get base path
  const basePath = _get_global_auth_base_path(realm)
  //console.log(`INFO: api/login - ${realm} ${username} ${password}`)
  axios
    .post(
      basePath + 'login',
      {
        realm: realm,
        username: username,
        password: password
      })
    .then((res) => {
      if ('data' in res && 'status' in res.data && 'token' in res.data) {
        // login successful, let's record the realm and token
        let ret_token = res.data.token
        // save username and token
        globalThis.localStorage.setItem(`/app-x/realm/${realm}`,
            JSON.stringify({
                realm: realm,
                username: username,
                token: ret_token
            })
        )
        // broadcast login message
        store.dispatch({
          type: 'user/login',
          realm: realm,
          username: username,
          token: ret_token,
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
      console.error(err)
      if (err.response && 'status' in err.response && err.response.status === 401) {
        _handle_logout(realm)
      }
      let res = {
        status: 'error',
        message: err.message || err.toString(),
        data: err.response,
      }
      if (!!err.response?.data) {
        res = { ...res, ...err.response.data }
      }
      if (handler) {
        handler(res)
      }
    })
}

// logout for app_name context
const logout = (realm, callback, handler) => {
  // get base path
  const basePath = _get_global_auth_base_path(realm)
  //console.log(`INFO: api/logout - ${realm} ${username}`)
  let { username, token } = _get_token_by_realm(realm)
  return axios
    .post(
      basePath + 'logout',
      {
        realm: realm,
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
        _handle_logout(realm)
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
      console.error(err)
      if ('status' in err.response && err.response.status === 401) {
        _handle_logout(realm)
      }
      let res = {
        status: 'error',
        message: err.message || err.toString(),
        data: err.response,
      }
      if (!!err.response?.data) {
        res = { ...res, ...err.response.data }
      }
      if (handler) {
        handler(res)
      }
    })
}

// lookup realm
const lookup_realm = (namespace, app_name, callback, handler) => {
  // get base path
  const basePath = _get_app_auth_base_path(namespace, app_name)
  // console.log(`_get_app_auth_base_path`, namespace, app_name, basePath)
  return axios
    .get(
      basePath + 'realm'
    )
    .then((res) => {
      if ('data' in res && 'status' in res.data && 'realm' in res.data) {
        if (callback) {
          callback(res.data)
        }
      } else {
        let ret = {
          status: 'error',
          message: `ERROR: missing status or realm in response`,
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
      console.error(err)
      let res = {
        status: 'error',
        message: err.message || err.toString(),
        data: err.response,
      }
      if (!!err.response?.data) {
        res = { ...res, ...err.response.data }
      }
      if (handler) {
        handler(res)
      }
    })
}

// get self information
const me = (namespace, app_name, callback, handler) => {
  lookup_realm(
    namespace,
    app_name,
    data => {
      //console.log(data)
      const realm = data.realm
      // get base path
      const basePath = _get_app_auth_base_path(namespace, app_name)
      //console.log(`INFO: api/logout - ${realm} ${username}`)
      const { username, token } = _get_token_by_realm(realm)
      return axios
        .post(
          basePath + 'me',
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
            globalThis.localStorage.setItem(`/app-x/role/${namespace}/${app_name}`,
                JSON.stringify({
                    namespace: namespace,
                    app_name: app_name,
                    realm: realm,
                    username: username,
                    data: res.data.user,
                })
            )
            // broadcast login message
            store.dispatch({
              type: 'role/info',
              namespace: namespace,
              app_name: app_name,
              realm: realm,
              username: username,
              data: res.data.user,
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
          console.error(err)
          if (err.response && 'status' in err.response && err.response.status === 401) {
            _handle_logout(realm)
          }
          let res = {
            status: 'error',
            message: err.message || err.toString(),
            data: err.response,
          }
          if (!!err.response?.data) {
            res = { ...res, ...err.response.data }
          }
          if (handler) {
            handler(res)
          }
        })
    },
    err => {
      console.error(err)
      let res = {
        status: 'error',
        message: err.message || err.toString(),
        data: err.response,
      }
      if (!!err.response?.data) {
        res = { ...res, ...err.response.data }
      }
      if (handler) {
        handler(res)
      }
    }
  )
}

// request for app_name context
const request = (namespace, app_name, conf, callback, handler) => {
  // get base path
  const basePath = _get_base_path(namespace, app_name)
  _get_token_by_app(
    namespace,
    app_name,
    data => {
      //console.log(data)
      const realm = data.realm
      const username = data.username
      const token = data.token
      // handle request
      let req = { ...conf }
      let url = conf.endpoint || conf.url || ''
      if ('endpoint' in conf) {
        const regex = /(:([_a-zA-Z0-9]+))/g
        const endpointParams = conf.endpointParams || {}
        let match
        while (match = regex.exec(conf.endpoint)) {
          if (! (match[2] in endpointParams)) {
            throw new Error(`ERROR: unsubstantiated endpoint parameter [${match[1]}] for [${conf.endpoint}]`)
          }
          url = url.replace(match[1], endpointParams[match[2]])
        }
        // console.log(`api conf`, conf.endpoint, conf.endpointParams, url)
      }
      if (!!url) {
        req.url = `${basePath}/${url}`.replace(/\/+/g, '/')
      } else {
        throw new Error(`ERROR: missing url [${conf.url}] or endpoint [${conf.endpoint}]`)
      }
      // console.log(`req.url`, req.url)
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
                if (VALID_API_STATUS.includes(res.data.status)) {
                  notification[res.data.status]({
                    message: `API ${res.data.status.toUpperCase()}`,
                    description: String(res.data.message),
                    placement: 'bottomLeft',
                  })
                } else {
                  notification['info']({
                    message: 'API Message',
                    description: String(res.data.message),
                    placement: 'bottomLeft',
                  })
                }
                if (!!handler) {
                  handler(res.data)
                }
              }
            } else {
              if (!!callback) {
                callback(res.data)
              }
            }
          } else {
            notification['error']({
              message: 'API ERROR',
              description: `ERROR: empty response data`,
              placement: 'bottomLeft',
            })
            if (!!handler) {
              handler({
                status: `error`,
                message: `ERROR: empty response data`,
                data: res
              })
            }
          }
        })
        .catch((err) => {
          if (err?.response?.status === 401) {
            _handle_logout(realm)
          } else if (err?.response?.status >= 400) {
            notification['error']({
              message: 'API ERROR',
              description: String(err),
              placement: 'bottomLeft',
            })
          }
          let res = {
            status: 'error',
            message: err.toString(),
            data: err.response,
          }
          if (!!err.response?.data) {
            res = { ...res, ...err.response.data }
          }
          if (!!handler) {
            handler(res)
          }
        })
    },
    err => {
      console.error(err)
      notification.error({
        message: 'API ERROR',
        description: err.message || String(err),
        placement: 'bottomLeft',
      })
    }
  )
}

const get = (namespace, app_name, url, callback, handler) => {
  return request(
    namespace,
    app_name,
    {
      method: 'get',
      url: url,
    },
    callback,
    handler
  )
}

const head = (namespace, app_name, url, callback, handler) => {
  return request(
    namespace,
    app_name,
    {
      method: 'head',
      url: url,
    },
    callback,
    handler
  )
}

const post = (namespace, app_name, url, data, callback, handler) => {
  return request(
    namespace,
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

const put = (namespace, app_name, url, data, callback, handler) => {
  return request(
    namespace,
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

const patch = (namespace, app_name, url, data, callback, handler) => {
  return request(
    namespace,
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

const del = (namespace, app_name, url, callback, handler) => {
  return request(
    namespace,
    app_name,
    {
      method: 'delete',
      url: url,
    },
    callback,
    handler
  )
}

////////////////////////////////////////////////////////////////////////////////
// async methods

const login_async = function(realm, username, password) {
  return new Promise((resolve, reject) => {
    login(realm, username, password,
      result => {
        resolve(result)
      },
      error => {
        reject(error)
      }
    )
  })
}

const logout_async = function(realm) {
  return new Promise((resolve, reject) => {
    logout(realm,
      result => {
        resolve(result)
      },
      error => {
        reject(error)
      }
    )
  })
}

const lookup_realm_async = function(namespace, app_name) {
  return new Promise((resolve, reject) => {
    lookup_realm(namespace, app_name,
      result => {
        resolve(result)
      },
      error => {
        reject(error)
      }
    )
  })
}

const me_async = function(namespace, app_name) {
  return new Promise((resolve, reject) => {
    me(namespace, app_name,
      result => {
        resolve(result)
      },
      error => {
        reject(error)
      }
    )
  })
}

const get_async = function(namespace, app_name, url) {
  return new Promise((resolve, reject) => {
    get(namespace, app_name, url,
      result => {
        resolve(result)
      },
      error => {
        reject(error)
      }
    )
  })
}

const head_async = function(namespace, app_name, url) {
  return new Promise((resolve, reject) => {
    head(namespace, app_name, url,
      result => {
        resolve(result)
      },
      error => {
        reject(error)
      }
    )
  })
}

const post_async = function(namespace, app_name, data, url) {
  return new Promise((resolve, reject) => {
    post(namespace, app_name, url, data,
      result => {
        resolve(result)
      },
      error => {
        reject(error)
      }
    )
  })
}

const put_async = function(namespace, app_name, data, url) {
  return new Promise((resolve, reject) => {
    put(namespace, app_name, url, data,
      result => {
        resolve(result)
      },
      error => {
        reject(error)
      }
    )
  })
}

const patch_async = function(namespace, app_name, data, url) {
  return new Promise((resolve, reject) => {
    patch(namespace, app_name, url, data,
      result => {
        resolve(result)
      },
      error => {
        reject(error)
      }
    )
  })
}

const del_async = function(namespace, app_name, url) {
  return new Promise((resolve, reject) => {
    del(namespace, app_name, url,
      result => {
        resolve(result)
      },
      error => {
        reject(error)
      }
    )
  })
}

const request_async = function(namespace, app_name, conf) {
  return new Promise((resolve, reject) => {
    request(namespace, app_name, conf,
      result => {
        resolve(result)
      },
      error => {
        reject(error)
      }
    )
  })
}

export {
  login,
  login_async,
  logout,
  logout_async,
  lookup_realm,
  lookup_realm_async,
  me,
  me_async,
  get,
  get_async,
  head,
  head_async,
  post,
  post_async,
  put,
  put_async,
  patch,
  patch_async,
  del,
  del_async,
  request,
  request_async,
}

export default {
  login,
  login_async,
  logout,
  logout_async,
  lookup_realm,
  lookup_realm_async,
  me,
  me_async,
  get,
  get_async,
  head,
  head_async,
  post,
  post_async,
  put,
  put_async,
  patch,
  patch_async,
  del,
  del_async,
  request,
  request_async,
}
