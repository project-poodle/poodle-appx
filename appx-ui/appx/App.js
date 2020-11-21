//import 'react-perfect-scrollbar/dist/css/styles.css';
const React = module['react']
const { useRoutes } = module['hookrouter']
const MaterialUI = module['@material-ui/core']
const { ThemeProvider, Box, Button, Grid, CssBaseline, makeStyles } = MaterialUI
const { Provider } = module['react-redux']

import theme from '/appx/theme';
import routes from '/appx/routes.js';
import GlobalStyles from '/appx/components/GlobalStyles'
import HeaderLayout from '/appx/pages/layouts/headerLayout'
import NotFoundView from '/appx/views/errors/NotFoundView'
import store from '/appx/redux/store'

//const { useRoutes } = _router

const App = () => {

  const routeResult = useRoutes(routes)
  //console.log(routeResult)
  //console.log(store)

  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <GlobalStyles />
         {routeResult || <HeaderLayout><NotFoundView/></HeaderLayout>}
      </ThemeProvider>
    </Provider>
  )
}

export default App;
