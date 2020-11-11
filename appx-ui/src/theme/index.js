import { createMuiTheme, colors } from '@material-ui/core';
import typography from './typography';

const theme = createMuiTheme({
  palette: {
    background: {
      dark: '#F4F6F8',
      default: colors.common.white,
      paper: colors.common.white
    },
    primary: {
      main: colors.blue[800]
    },
    secondary: {
      main: colors.lightBlue[800]
    },
    text: {
      primary: colors.blueGrey[900],
      secondary: colors.blueGrey[600]
    }
  },
  shape: {
      borderRadius: 0,
  },
  //shadows,
  typography
});

export default theme;
