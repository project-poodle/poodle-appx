const { combineReducers } = module.redux
import userReducer from '/appx/redux/reducer/userReducer'
import msgReducer from '/appx/redux/reducer/msgReducer'

export default combineReducers({
  userReducer,
  msgReducer,
})
