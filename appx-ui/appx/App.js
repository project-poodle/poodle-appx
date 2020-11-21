//import 'react-perfect-scrollbar/dist/css/styles.css';
const React = module.react
const { useRoutes } = module.hookrouter
const MaterialUI = module['@material-ui/core']
import GlobalStyles from 'appx/components/GlobalStyles'

const { Box, Button, Grid, CssBaseline, makeStyles } = MaterialUI
//import { Provider } from 'react-redux'
import theme from 'appx/theme';
import routes from 'appx/routes.js';
//import HeaderLayout from 'appx/pages/layouts/headerLayout'
//import NotFoundView from 'appx/views/errors/NotFoundView'
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
        <CssBaseline />
        Hello, World!
        {routeResult}
      </ThemeProvider>
  );
};

export default App;
