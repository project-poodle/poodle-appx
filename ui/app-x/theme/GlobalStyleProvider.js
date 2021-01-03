import React, { useState } from 'react'
import PropTypes from 'prop-types'
import {
  ThemeProvider,
  CssBaseline,
  createStyles,
  makeStyles,
} from '@material-ui/core'

const GolbalStyleContext = React.createContext()

const GlobalStyleProvider = (() => {

  const f = (props) => {

    const globalStyles = makeStyles(() => createStyles({
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
        '.ant-tabs-tab .anticon': {
          margin: 0,
        },
        '.MuiSelect-select.MuiSelect-select': {
          display: 'flex',
          alignItems: 'center',
        }
      }
    }))

    globalStyles()

    return (
      <ThemeProvider theme={props.theme}>
        <GolbalStyleContext.Provider
          value={{
            globalStyles,
          }}
        >
          {props.children}
        </GolbalStyleContext.Provider>
      </ThemeProvider>
    )
  }

  // update Context variable
  f.Context = GolbalStyleContext

  f.propType = {
    theme: PropTypes.object.isRequired,
  }

  return f
}) ()

export { GolbalStyleContext as Context }

export default GlobalStyleProvider
