//import 'react-perfect-scrollbar/dist/css/styles.css';
import React from 'react';
//import { useRoutes } from 'react-router-dom';
import { useRoutes } from 'hookrouter';
import MaterialUI from '@material-ui/core';
import GlobalStyles from 'appx/components/GlobalStyles.js';
//import HeaderLayout from 'appx/page/layouts/headerLayout.js'
//import NotFoundView from 'appx/views/errors/NotFoundView.js';
//import { Provider } from 'react-redux'
import theme from 'appx/theme';
import routes from './routes.js';
//import store from 'src/redux/store'
//const store = require('src/redux/store').default

//const { useRoutes } = _router
const { ThemeProvider } = MaterialUI

const App = () => {

  //const routeResult = useRoutes(routes)
  //{routeResult}
  //const routing = useRoutes(routes)
  // console.log(store)

  return (
      <ThemeProvider theme={theme}>
      hello, world!
        <GlobalStyles />
      </ThemeProvider>
  );
};

export default App;
