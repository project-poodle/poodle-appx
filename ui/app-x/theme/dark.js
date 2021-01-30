import { createMuiTheme, colors } from '@material-ui/core'

const dark = createMuiTheme({
  palette: {
    type: 'dark',
    primary: {
      main: colors.indigo[400]
    },
    secondary: {
      main: colors.indigo[200]
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
