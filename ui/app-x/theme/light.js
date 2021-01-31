import { createMuiTheme, colors } from '@material-ui/core'

const light = createMuiTheme({
  palette: {
    type: 'light',
    primary: {
      main: colors.blue[800]
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

export default light
