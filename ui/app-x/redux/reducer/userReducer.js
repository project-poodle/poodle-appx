// const _ = lib.lodash // Import the entire lodash library
import _ from 'lodash'

const REGEX_VAR = '[_a-zA-Z][_a-zA-Z0-9]*'

const userInitialState = {}

function load_from_local_storage() {
  for (let key of Object.keys(window.localStorage)) {
    if (!key.startsWith('/app-x/')) {
      continue
    }
    let matches_token = key.match(new RegExp(`^/app-x/(${REGEX_VAR})/(${REGEX_VAR})/userToken$`))
    if (matches_token) {
      let namespace = matches_token[1]
      let app_name = matches_token[2]
      if (! (namespace in userInitialState)) {
        userInitialState[namespace] = {}
      }
      if (! (app_name in userInitialState[namespace])) {
        userInitialState[namespace][app_name] = {}
      }
      let userToken = window.localStorage.getItem(key)
      userInitialState[namespace][app_name].userToken = userToken ? JSON.parse(userToken) : {}
    }
    let matches_info = key.match(new RegExp(`^/app-x/(${REGEX_VAR})/(${REGEX_VAR})/userInfo$`))
    if (matches_info) {
      let namespace = matches_info[1]
      let app_name = matches_info[2]
      if (! (namespace in userInitialState)) {
        userInitialState[namespace] = {}
      }
      if (! (app_name in userInitialState[namespace])) {
        userInitialState[namespace][app_name] = {}
      }
      let userInfo = window.localStorage.getItem(key)
      userInitialState[namespace][app_name].userInfo = userInfo ? JSON.parse(userInfo) : {}
    }
  }
}

// load from local storage once
load_from_local_storage()

// core reducer function
function userReducer(state=userInitialState, action) {
  console.log({action: action, date: new Date()})
  switch (action.type) {
    // action: {
    //    type: 'user/login',
    //    namespace: 'sys',
    //    app_name: 'appx',
    //    username: 'user-abc',
    //    token: 'token-xyz',
    //    userInfo: { ...userInfo },
    // }
    case 'user/login': {
      if ((! action.namespace)
          || (! action.app_name)
          || (! action.userToken)
          || (! action.userToken.username)
          || (! action.userToken.token)) {
        console.log(`[${action.type}] action missing namespace/app_name/username/token ${JSON.stringify(action)}`)
        return state
      }
      let newState = _.cloneDeep(state)
      if (! (action.namespace in newState)) {
        newState[action.namespace] = {}
      }
      if (! (action.app_name in newState[action.namespace])) {
        newState[action.namespace][action.app_name] = {}
      }
      newState[action.namespace][action.app_name].userToken = _.cloneDeep(action.userToken)
      return newState
    }
    // action: {
    //    type: 'user/login',
    //    namespace: 'sys',
    //    app_name: 'appx',
    //    username: 'user-abc',
    //    token: 'token-xyz',
    //    userInfo: { ...userInfo },
    // }
    case 'user/info': {
      if ((! action.namespace)
          || (! action.app_name)
          || (! action.username)
          || (! action.userInfo)) {
        console.log(`[${action.type}] action missing namespace/app_name/username/userInfo ${JSON.stringify(action)}`)
        return state
      }
      let newState = _.cloneDeep(state)
      if (! (action.namespace in newState)) {
        newState[action.namespace] = {}
      }
      if (! (action.app_name in newState[action.namespace])) {
        newState[action.namespace][action.app_name] = {}
      }
      newState[action.namespace][action.app_name].userInfo = _.cloneDeep(action.userInfo)
      return newState
    }
    // action: {
    //    type: 'user/logout',
    //    realm: 'appx',
    // }
    case 'user/logout': {
      if ((! action.namespace) || (! action.app_name)) {
        console.log(`[${action.type}] action missing namespace/app_name ${JSON.stringify(action)}`)
        return state
      }
      let newState = _.cloneDeep(state)
      if (! (action.namespace in newState)) {
        newState[action.namespace] = {}
      }
      if (! (action.app_name in newState[action.namespace])) {
        newState[action.namespace][action.app_name] = {}
      }
      newState[action.namespace][action.app_name].userToken = {}
      newState[action.namespace][action.app_name].userInfo = {}
      return newState
    }
    default:
      if (action.type.startsWith('user/')) {
        console.log(`Unknown redux action ${action.type}`)
      }
      return state
  }
}

export default userReducer
