//import 'react-perfect-scrollbar/dist/css/styles.css';
//const React = lib['react']
import React from 'react'
import { useRoutes } from 'hookrouter'
//import PropTypes from 'prop-types'
//const MaterialUI = lib['@material-ui/core']
import { ThemeProvider, Box, Button, Grid, CssBaseline, makeStyles } from '@material-ui/core'
import { Provider } from 'react-redux'

import theme from 'app-x/theme'
import GlobalStyles from 'app-x/components/GlobalStyles'
import HeaderLayout from 'app-x/pages/layouts/headerLayout'
import NotFoundView from 'app-x/views/errors/NotFoundView'
import store from 'app-x/redux/store'

import routes from 'app-x/routes.js'

const AppX = (props) => {

  //console.log(React)
  //console.log(React.default)

  const routeResult = useRoutes(routes)

  return (
    <div>
      <ThemeProvider theme={theme}>
        <GlobalStyles />
        {routeResult || <HeaderLayout><NotFoundView/></HeaderLayout>}
      </ThemeProvider>
    </div>
  )
}

export default AppX;

/*
<Provider store={store}>
  <ThemeProvider theme={theme}>
    <GlobalStyles />
     {routeResult || <HeaderLayout><NotFoundView/></HeaderLayout>}
  </ThemeProvider>
</Provider>
*/
