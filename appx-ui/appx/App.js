//import 'react-perfect-scrollbar/dist/css/styles.css';
const React = module['react']
const { useRoutes } = module['hookrouter']
const MaterialUI = module['@material-ui/core']
import GlobalStyles from '/components/GlobalStyles'

const { Box, Button, Grid, CssBaseline, makeStyles } = MaterialUI
//import { Provider } from 'react-redux'
import theme from '/theme';
import routes from '/routes.js';
import HeaderLayout from '/pages/layouts/headerLayout'
import NotFoundView from '/views/errors/NotFoundView'
//import store from 'src/redux/store'
//const store = require('src/redux/store').default

//const { useRoutes } = _router
const { ThemeProvider } = MaterialUI

const App = () => {

  //console.log(React)
  //console.log(useRoutes)
  //console.log(routes)
  const routeResult = useRoutes(routes)
  //console.log(routeResult)
  //const routing = useRoutes(routes)
  // console.log(store)

  return (
      <ThemeProvider theme={theme}>
        <GlobalStyles />
         {routeResult || <HeaderLayout><NotFoundView/></HeaderLayout>}
      </ThemeProvider>
  );
};

export default App;

//         {routeResult || <HeaderLayout><NotFoundView/></HeaderLayout>}
