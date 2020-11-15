
const msgInitial = {
  msgs: []
}

function msgReducer(state=msgInitial, action) {
  // action: {
  //    type: 'msg/add',
  //    uuid: 'abc-def-xyz',
  //    content: 'message content'
  // }
  switch (action.type) {
    case 'msg/add': {
      return {
        msgs: [...state.msgs].push({
          uuid: action.uuid,
          content: action.content,
        })
      }
    }
    // action: {
    //    type: 'msg/delete',
    //    uuid: 'abc-def-xyz',
    // }
    case 'msg/delete': {
        let found_idx = -1
        for (let i=0; i<state.msgs.length; i++) {
          const msg = state.msgs[i]
          if (msg.uuid === action.uuid) {
            found_idx = i
            break
          }
        }
        if (found_idx >= 0) {
          return {
            msgs: [
              ...state.msgs.slice(0, found_idx),
              ...state.msgs.slice(found_idx + 1)
            ]
          }
        } else {
          return state
        }
      }
    default:
      if (action.type.startsWith('msg/')) {
        console.log(`Uknown redux action ${action.type}`)
      }
      return state
  }
}

export default msgReducer
