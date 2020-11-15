import 'react-perfect-scrollbar/dist/css/styles.css';
import React from 'react';
//import { useRoutes } from 'react-router-dom';
import { useRoutes } from 'hookrouter';
import { ThemeProvider } from '@material-ui/core';
import GlobalStyles from './components/GlobalStyles';
import HeaderLayout from 'src/pageLayouts/headerLayout'
import NotFoundView from 'src/views/errors/NotFoundView';
import { Provider } from 'react-redux'
import theme from 'src/theme';
import routes from './routes';
//import store from 'src/redux/store'
const store = require('src/redux/store').default


const App = () => {

  const routeResult = useRoutes(routes)
  //const routing = useRoutes(routes)
  console.log(store)

  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <GlobalStyles />
          {routeResult || <HeaderLayout><NotFoundView/></HeaderLayout>}
      </ThemeProvider>
    </Provider>
  );
};

export default App;
