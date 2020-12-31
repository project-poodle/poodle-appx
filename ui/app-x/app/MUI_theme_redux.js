//import 'react-perfect-scrollbar/dist/css/styles.css';
import React from 'react'
import { useRoutes } from 'app-x/router'
import PropTypes from 'prop-types'
import { Provider } from 'react-redux'

import GlobalStyleProvider from 'app-x/theme/GlobalStyleProvider'
import HeaderLayout from 'app-x/page/header/Header_plain'
import NotFoundView from 'app-x/view/error/NotFoundView'

const MUI_App = (props) => {

  // process not_found
  const not_found = props.not_found_view || (<Header_plain><NotFoundView/></Header_plain>)

  // process routes
  const routeResult = useRoutes(props.routes)

  return (
    <GlobalStyleProvider theme={props.theme_provider}>
      <Provider store={props.redux_store_provider}>
        {routeResult || not_found}
      </Provider>
    </GlobalStyleProvider>
  )
}

MUI_App.propTypes = {
  routes: PropTypes.object.isRequired,
  redux_store_provider: PropTypes.object.isRequired,
  theme_provider: PropTypes.object.isRequired,
  not_found_view: PropTypes.element
}

export default MUI_App;
