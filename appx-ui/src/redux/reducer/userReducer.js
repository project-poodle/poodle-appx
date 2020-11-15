
const userInitial = {
  realm: "appx",
  username: null,
  token: null,
  user_info: {},
  func_perms: {},
  obj_perms: {},
}

function userReducer(state=userInitial, action) {
  switch (action.type) {
    // action: {
    //    type: 'user/login',
    //    username: 'user-abc',
    //    token: 'token-xyz',
    //    user_info: { ...user_info },
    //    func_perms: { ...func_perms },
    //    obj_perms: { ...obj_perms },
    // }
    case 'user/login': {
      return Object.assign({}, state, {
        realm: action.realm,
        username: action.username,
        token: action.token,
        user_info: action.user_info,
        func_perms: action.func_perms,
        obj_perms: action.obj_perms,
      })
    }
    // action: {
    //    type: 'user/logout',
    //    username: 'user-abc',
    // }
    case 'user/logout': {
      return Object.assign({}, state, {
        realm: action.realm,
        username: null,
        token: null,
        user_info: {},
        func_perms: {},
        obj_perms: {},
      })
    }
    default:
      if (action.type.startsWith('user/')) {
        console.log(`Uknown redux action ${action.type}`)
      }
      return state
  }
}

export default userReducer
