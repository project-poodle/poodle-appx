import { combineReducers } from 'redux'
import userReducer from './userReducer'
import msgReducer from './msgReducer'

export default combineReducers({
  userReducer,
  msgReducer,
})
