import { createMuiTheme, colors } from '@material-ui/core'
// import typography from 'app-x/theme/topography'

const theme = createMuiTheme({
  palette: {
    background: {
      // dark: '#F4F6F8',
      default: colors.common.white,
      paper: colors.common.white
    },
    primary: {
      main: colors.blue[800]
    },
    secondary: {
      main: colors.lightBlue[500]
    },
    text: {
      primary: colors.blueGrey[900],
      secondary: colors.blueGrey[500],
      error: colors.red[900],
    }
  },
  shape: {
      borderRadius: 0,
  },
  // typography
})

export default theme
