import 'react-perfect-scrollbar/dist/css/styles.css';
import React from 'react';
//import { useRoutes } from 'react-router-dom';
import { useRoutes } from 'hookrouter';
import { ThemeProvider } from '@material-ui/core';
import GlobalStyles from './components/GlobalStyles';
import NotFoundView from 'src/views/errors/NotFoundView';
import './mixins/chartjs';
import theme from './theme';
import routes from './routes';


const App = () => {

  const routeResult = useRoutes(routes);
  //const routing = useRoutes(routes);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
        {routeResult || <NotFoundView />}
    </ThemeProvider>
  );
};

export default App;
