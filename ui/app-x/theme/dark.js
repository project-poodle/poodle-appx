import { createMuiTheme, colors } from '@material-ui/core'

const dark = createMuiTheme({
  palette: {
    type: 'dark',
    primary: {
      main: colors.indigo[800]
    },
    secondary: {
      main: colors.indigo[300]
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
