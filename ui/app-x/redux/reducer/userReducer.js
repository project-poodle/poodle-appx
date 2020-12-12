// const _ = lib.lodash // Import the entire lodash library
import _ from 'lodash'

const REGEX_VAR = '[_a-zA-Z][_a-zA-Z0-9]*'

const userInitialState = {}

function load_from_local_storage() {
  for (let key of Object.keys(window.localStorage)) {
    if (!key.startsWith('/app-x/realm/')) {
      continue
    }
    let matches_token = key.match(new RegExp(`^/app-x/realm/(${REGEX_VAR})$`))
    if (matches_token) {
      let realm = matches_token[1]
      if (! (realm in userInitialState)) {
        userInitialState[realm] = {}
      }
      let userToken = window.localStorage.getItem(key)
      userInitialState[realm] = userToken ? JSON.parse(userToken) : {}
    }
  }
}

// load from local storage once
load_from_local_storage()

// core reducer function
function userReducer(state=userInitialState, action) {
  // console.log({action: action, date: new Date()})
  switch (action.type) {
    // action: {
    //    type: 'user/login',
    //    realm: 'core',
    //    username: 'user-abc',
    //    token: 'token-xyz',
    // }
    case 'user/login': {
      if ((! action.realm)
          || (! action.username)
          || (! action.token)) {
        console.log(`[${action.type}] action missing realm/username/token ${JSON.stringify(action)}`)
        return state
      }
      let newState = _.cloneDeep(state)
      newState[action.realm] = {
          realm: action.realm,
          username: action.username,
          token: action.token
      }
      return newState
    }
    // action: {
    //    type: 'user/logout',
    //    realm: 'core',
    // }
    case 'user/logout': {
      if (! action.realm) {
        console.log(`[${action.type}] action missing realm ${JSON.stringify(action)}`)
        return state
      }
      let newState = _.cloneDeep(state)
      newState[action.realm] = {}
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
