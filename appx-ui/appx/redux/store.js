const { createStore } = module.redux
import rootReducer from '/appx/redux/reducer'

const store = createStore(rootReducer)

//setInterval(() => {
//  console.log(store.getState())
//}, 15 * 1000)

export default store
