import { combineReducers } from 'redux'
import userReducer from 'app-x/redux/reducer/userReducer'
import roleReducer from 'app-x/redux/reducer/roleReducer'

export default combineReducers({
  userReducer,
  roleReducer,
})
