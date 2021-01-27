import { createMuiTheme, colors } from '@material-ui/core'

const dark = createMuiTheme({
  palette: {
    type: 'dark',
    primary: {
      main: colors.blue[900]
    },
    secondary: {
      main: colors.blue[700]
    },
  },
  // shadows: [
  //   'none'
  // ],
  shape: {
      borderRadius: 0,
  },
  // typography
})

export default dark
