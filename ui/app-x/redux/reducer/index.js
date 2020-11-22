const { combineReducers } = lib.redux
import userReducer from '/app-x/redux/reducer/userReducer'
import msgReducer from '/app-x/redux/reducer/msgReducer'

export default combineReducers({
  userReducer,
  msgReducer,
})
