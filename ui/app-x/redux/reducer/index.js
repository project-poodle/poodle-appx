// const { combineReducers } = lib.redux
import { combineReducers } from 'redux'
import userReducer from 'app-x/redux/reducer/userReducer'
import roleReducer from 'app-x/redux/reducer/roleReducer'
import msgReducer from 'app-x/redux/reducer/msgReducer'

export default combineReducers({
  userReducer,
  roleReducer,
  msgReducer,
})
