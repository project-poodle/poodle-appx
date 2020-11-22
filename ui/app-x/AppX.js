//import 'react-perfect-scrollbar/dist/css/styles.css';
const React = lib['react']
const { useRoutes } = lib['hookrouter']
const PropTypes = lib['prop-types']
const MaterialUI = lib['@material-ui/core']
const { ThemeProvider, Box, Button, Grid, CssBaseline, makeStyles } = MaterialUI
const { Provider } = lib['react-redux']

import theme from '/app-x/theme';
import GlobalStyles from '/app-x/components/GlobalStyles'
import HeaderLayout from '/app-x/pages/layouts/headerLayout'
import NotFoundView from '/app-x/views/errors/NotFoundView'
import store from '/app-x/redux/store'

import routes from '/app-x/routes.js';

const AppX = (props) => {

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

AppX.propTypes = {
  routes: PropTypes.arrayOf({
    route: PropTypes.string.isRequired,
    element: PropTypes.shape({
      scope: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      props: PropTypes.object,
      child: PropTypes.shape({
        scope: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        props: PropTypes.object,
        child: PropTypes.shape({
          scope: PropTypes.string.isRequired,
          name: PropTypes.string.isRequired,
          props: PropTypes.object,
          child: PropTypes.shape({
            scope: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            props: PropTypes.object
          })
        })
      })
    })
  })
}

export default AppX;
