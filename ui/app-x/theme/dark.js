import { createMuiTheme, colors } from '@material-ui/core'

const dark = createMuiTheme({
  palette: {
    type: 'dark',
    primary: {
      main: colors.blue[800]
    },
    secondary: {
      main: colors.blue[200]
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
