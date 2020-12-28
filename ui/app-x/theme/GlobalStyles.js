import { createStyles, makeStyles } from '@material-ui/core'

const GlobalStyles = () => {

  const useStyles = makeStyles(() => createStyles({
    '@global': {
      '*': {
        boxSizing: 'border-box',
        margin: 0,
        padding: 0,
      },
      html: {
        '-webkit-font-smoothing': 'antialiased',
        '-moz-osx-font-smoothing': 'grayscale',
        height: '100%',
        width: '100%'
      },
      body: {
        backgroundColor: '#F4F6F8',
        height: '100%',
        width: '100%'
      },
      a: {
        textDecoration: 'none',
        color: 'inherit'
      },
      '#root': {
        height: '100%',
        width: '100%'
      },
      '.ant-tabs-content': {
        height: '100%', // fix ant tabs
      },
      '.ant-select-dropdown': {
        zIndex: 2050,
      },
      '.ant-notification': {
        zIndex: 2010,
      },
      '.MuiSelect-select.MuiSelect-select': {
        display: 'flex',
        alignItems: 'center',
      }
    }
  }))

  useStyles()

  return null
}

export default GlobalStyles
