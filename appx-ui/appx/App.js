//import 'react-perfect-scrollbar/dist/css/styles.css';
//import React from 'react';
const React = module.react
//import { useRoutes } from 'react-router-dom';
//import { useRoutes } from 'hookrouter';
const { useRoutes } = module.hookrouter
//import MaterialUI from '@material-ui/core';
const MaterialUI = module['@material-ui/core']
import GlobalStyles from './components/GlobalStyles'

//import HeaderLayout from 'appx/page/layouts/headerLayout.js'
//import NotFoundView from 'appx/views/errors/NotFoundView.js';
//import { Provider } from 'react-redux'
import theme from './theme';
import routes from './routes.js';
//import store from 'src/redux/store'
//const store = require('src/redux/store').default

//const { useRoutes } = _router
const { ThemeProvider } = MaterialUI

const App = () => {

  const routeResult = useRoutes(routes)
  //{routeResult}
  //const routing = useRoutes(routes)
  // console.log(store)

  return (
      <ThemeProvider theme={theme}>
        <GlobalStyles />
        {routeResult}
      </ThemeProvider>
  );
};

export default App;
