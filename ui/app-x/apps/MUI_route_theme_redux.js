//import 'react-perfect-scrollbar/dist/css/styles.css';
//const React = lib['react']
import React from 'react'
import { useRoutes } from 'hookrouter'
import PropTypes from 'prop-types'
//const MaterialUI = lib['@material-ui/core']
import { ThemeProvider, Box, Button, Grid, CssBaseline, makeStyles } from '@material-ui/core'
import { Provider } from 'react-redux'

// import theme from 'app-x/theme'
import GlobalStyles from 'app-x/components/GlobalStyles'
import HeaderLayout from 'app-x/pages/layouts/headerLayout'
import NotFoundView from 'app-x/views/errors/NotFoundView'
// import store from 'app-x/redux/store'

// import routes from 'app-x/routes.js'


const App = (props, children) => {

  // process redux store
  // import redux_store from props.redux_provider

  // process theme
  // import theme_provider from props.theme_provider

  // process routes
  const routes = {}
  props.routes.map(row => {
    routes[row.route] = row.element
  })
  const routeResult = useRoutes(routes)

  // process not_found
  const not_found = props.not_found || (<HeaderLayout><NotFoundView/></HeaderLayout>)

  return (
    <Provider store={props.redux_store_provider}>
      <ThemeProvider theme={props.theme_provider}>
        <GlobalStyles />
         {routeResult || not_found}
      </ThemeProvider>
    </Provider>
  )
}

App.propTypes = {
  redux_store_provider: PropTypes.object.isRequired,
  theme_provider: PropTypes.object.isRequired,
  routes: PropTypes.arrayOf(
    PropTypes.shape({
      route: PropTypes.string.isRequired,
      element: PropTypes.element.isRequired
    })
  ).isRequired,
  not_found: PropTypes.element
}

export default App;

/*
<Provider store={store}>
  <ThemeProvider theme={theme}>
    <GlobalStyles />
     {routeResult || <HeaderLayout><NotFoundView/></HeaderLayout>}
  </ThemeProvider>
</Provider>
*/
