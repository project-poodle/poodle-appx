// const _ = lib.lodash // Import the entire lodash library
import _ from 'lodash'

const REGEX_VAR = '[_a-zA-Z][_a-zA-Z0-9]*'

const roleInitialState = {}

function load_from_local_storage() {
  for (let key of Object.keys(window.localStorage)) {
    if (!key.startsWith('/app-x/role/')) {
      continue
    }
    let matches_info = key.match(new RegExp(`^/app-x/role/(${REGEX_VAR})/(${REGEX_VAR})$`))
    if (matches_info) {
      let namespace = matches_info[1]
      let app_name = matches_info[2]
      if (! (namespace in roleInitialState)) {
        roleInitialState[namespace] = {}
      }
      let userInfo = window.localStorage.getItem(key)
      roleInitialState[namespace][app_name] = userInfo ? JSON.parse(userInfo) : {}
    }
  }
}

// load from local storage once
load_from_local_storage()

// core reducer function
function roleReducer(state=roleInitialState, action) {
  // console.log({action: action, date: new Date()})
  switch (action.type) {
    // action: {
    //    type: 'role/info',
    //    namespace: 'sys',
    //    app_name: 'appx',
    //    realm: 'core',
    //    username: 'user-abc',
    //    userInfo: { ...userInfo },
    // }
    case 'role/info': {
      if ((! action.namespace)
          || (! action.app_name)
          || (! action.realm)
          || (! action.username)
          || (! action.data)) {
        console.log(`[${action.type}] action missing namespace/app_name/realm/username/data ${JSON.stringify(action)}`)
        return state
      }
      let newState = _.cloneDeep(state)
      if (! (action.namespace in newState)) {
        newState[action.namespace] = {}
      }
      newState[action.namespace][action.app_name] = {
        namespace: action.namespace,
        app_name: action.app_name,
        realm: action.realm,
        username: action.username,
        data: _.cloneDeep(action.data)
      }
      return newState
    }
    default:
      if (action.type.startsWith('role/')) {
        console.log(`Unknown redux action ${action.type}`)
      }
      return state
  }
}

export default roleReducer
