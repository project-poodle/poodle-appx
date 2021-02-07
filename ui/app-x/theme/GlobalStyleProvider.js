import React, { useState, useEffect, useContext } from 'react'
import PropTypes from 'prop-types'
import {
  ThemeProvider,
  CssBaseline,
  createStyles,
  makeStyles,
  createMuiTheme,
  colors,
} from '@material-ui/core'

import lightTheme from 'app-x/theme/light'
import darkTheme from 'app-x/theme/dark'

const GolbalStyleContext = React.createContext()

const GlobalStyleProvider = (props) => {

  // states
  const [ theme, setThemeInternal ] = useState(lightTheme)
  const setTheme = (theme) => {
    setThemeInternal(theme)
    const themeType = theme?.palette?.type === 'dark' ? 'dark' : 'light'
    globalThis.localStorage.setItem(
      '/app-x/ui/user/theme',
      JSON.stringify(
        {
          type: themeType,
          theme: theme,
        }
      )
    )
  }

  // theme
  // useEffect(() => {
  //   if (!!props.theme) {
  //     setTheme(createMuiTheme(props.theme))
  //   }
  // }, [props.theme])

  // load layout when loading first time
  useEffect(() => {
    try {
      const userTheme = JSON.parse(globalThis.localStorage.getItem(`/app-x/ui/user/theme`))
      if (!!userTheme?.theme) {
        try {
          setTheme(createMuiTheme(userTheme.theme))
        } catch (err) {
          console.error(`Theme set error`, err, JSON.stringify(userTheme.theme))
          if (userTheme.type === 'dark') {
            setTheme(darkTheme)
          } else if (userTheme.type === 'light') {
            setTheme(lightTheme)
          }
        }
      } else if (userTheme?.type === 'dark') {
        setTheme(darkTheme)
      } else if (userTheme?.type === 'light') {
        setTheme(lightTheme)
      }
    } catch (err) {
      console.error(`Theme load error`, err)
    }
  }, [])

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
        backgroundColor: theme?.palette?.background?.paper,
        // height: '100%',
        // width: '100%'
      },
      body: {
        backgroundColor: theme?.palette?.background?.paper,
        color: theme?.palette?.text?.primary,
        // height: '100%',
        // width: '100%',
      },
      a: {
        textDecoration: 'none',
        color: 'inherit'
      },
      '#root': {
        backgroundColor: theme?.palette?.background?.paper,
        // height: '100%',
        // width: '100%'
      },
      // antd overrides
      'h1': {
        color: theme?.palette?.text?.primary,
      },
      'h2': {
        color: theme?.palette?.text?.primary,
      },
      'h3': {
        color: theme?.palette?.text?.primary,
      },
      'h4': {
        color: theme?.palette?.text?.primary,
      },
      'h5': {
        color: theme?.palette?.text?.primary,
      },
      'h6': {
        color: theme?.palette?.text?.primary,
      },
      '.MuiInput-marginDense': {
        fontSize: '0.875rem',
      },
      '.ant-tabs-content': {
        height: '100%', // fix ant tabs
      },
      '.ant-notification': {
        zIndex: 2010,
      },
      '::selection': {
        color: theme?.palette.secondary.contrastText,
        backgroundColor: theme?.palette.secondary.main,
      },
      // '.anticon': {
      //   color: theme?.palette.text.primary,
      // },
      '.ant-btn': {
        color: theme?.palette.text.primary,
        backgroundColor: 'inherit',
        borderColor: theme?.palette.action.selected,
        '&:hover': {
          color: theme?.palette.text.primary,
          backgroundColor: theme?.palette.action.selected,
          borderColor: theme?.palette.text.secondary,
        },
        '&:focus': {
          color: theme?.palette.text.primary,
          backgroundColor: theme?.palette.action.selected,
          borderColor: theme?.palette.text.secondary,
        },
        '&[disabled]': {
          color: theme?.palette.text.disabled,
          backgroundColor: theme?.palette.action.disabledBackground,
          borderColor: theme?.palette.action.selected,
          '&:hover': {
            color: theme?.palette.text.disabled,
            backgroundColor: theme?.palette.action.disabledBackground,
            borderColor: theme?.palette.action.selected,
          },
        },
      },
      '.ant-btn-primary': {
        color: theme?.palette.primary.contrastText,
        backgroundColor: theme?.palette.primary.light,
        borderColor: theme?.palette.primary.light,
        '&:hover': {
          color: theme?.palette.primary.contrastText,
          backgroundColor: theme?.palette.primary.main,
          borderColor: theme?.palette.primary.main,
        },
        '&:focus': {
          color: theme?.palette.primary.contrastText,
          backgroundColor: theme?.palette.primary.main,
          borderColor: theme?.palette.primary.main,
        },
      },
      '.ant-btn-dangerous': {
        color: theme?.palette.error.light,
        borderColor: theme?.palette.error.light,
        '&:hover': {
          color: theme?.palette.error.light,
          borderColor: theme?.palette.error.light,
        },
        '&:focus': {
          color: theme?.palette.error.light,
          borderColor: theme?.palette.error.light,
        },
      },
      '.ant-tabs': {
        color: theme?.palette.text.primary,
      },
      '.ant-tabs-tab': {
        color: theme?.palette.text.primary,
        '&:hover': {
          color: theme?.palette.secondary.light,
          // backgroundColor: theme?.palette.hover,
        },
        '&.ant-tabs-tab-active': {
          padding: theme?.spacing(0, 1),
          // color: theme?.palette.primary.contrastText,
          // color: theme?.palette.text.primary,
          color: theme?.palette.secondary.main,
          // backgroundColor: theme?.palette.primary.light,
          // borderColor: theme?.palette.primary.light,
          // outlineColor: theme?.palette.primary.light,
          '& .ant-tabs-tab-btn': {
            // color: theme?.palette.primary.contrastText,
            // color: theme?.palette.text.primary,
            color: theme?.palette.secondary.main,
            // backgroundColor: theme?.palette.primary.light,
            // borderColor: theme?.palette.primary.light,
            // outlineColor: theme?.palette.primary.light,
          }
        },
        '& .anticon': {
          margin: 0,
        },
      },
      '&.ant-tabs-nav': {
        '&::before': {
          borderBottomColor: theme?.palette.divider,
        }
      },
      '.ant-tabs-tab-btn': {
        '&:focus': {
          color: theme?.palette.secondary.light,
        },
        '&:active': {
          color: theme?.palette.secondary.light,
        }
      },
      '.ant-tabs-ink-bar': {
        backgroundColor: theme?.palette.secondary.main,
      },
      '.ant-select-dropdown': {
        zIndex: 2050,
        color: theme?.palette.text.primary,
        backgroundColor: theme?.palette.background.paper,
      },
      '.ant-select-item': {
        color: theme?.palette.text.primary,
        backgroundColor: theme?.palette.background.paper,
        '&.ant-select-item-option-active': {
          color: theme?.palette.text.primary,
          backgroundColor: theme?.palette.action.selected,
        },
        '&.ant-select-item-option-selected': {
          color: theme?.palette.primary.contrastText,
          backgroundColor: theme?.palette.primary.light,
        },
      },
      '.ant-tree': {
        color: theme?.palette.text.primary,
        backgroundColor: theme?.palette.background.paper,
        /*
        '& .ant-tree-treenode::before': {
          backgroundColor: theme?.palette?.background?.paper,
          // color: theme?.palette?.text?.primary,
        },
        '& .ant-tree-treenode:hover::before': {
          backgroundColor: theme?.palette?.action?.selected,
          // color: theme?.palette?.text?.primary,
        },
        '& .ant-tree-treenode-selected::before': {
          color: theme?.palette?.action?.selected,
          backgroundColor: theme?.palette?.secondary?.main,
          // color: theme?.palette?.text?.primary,
        },
        '& .ant-tree-treenode-selected:hover::before': {
          color: theme?.palette?.action?.selected,
          backgroundColor: theme?.palette?.secondary?.dark,
          // color: theme?.palette?.text?.primary,
        },
        */
        '& .ant-tree-node-content-wrapper': {
          backgroundColor: theme?.palette.background.paper,
        },
        '& .ant-tree-node-content-wrapper:hover': {
          backgroundColor: theme?.palette.action.selected,
        },
        '& .ant-tree-node-content-wrapper.ant-tree-node-selected': {
          color: theme?.palette.primary.contrastText,
          backgroundColor: theme?.palette.primary.light,
        },
        '& .ant-tree-node-content-wrapper.ant-tree-node-selected:hover': {
          color: theme?.palette.primary.contrastText,
          backgroundColor: theme?.palette.primary.dark,
          // backgroundColor: theme?.palette.action.selected,
        },
      },
      '.ant-tree.ant-tree-directory': {
        color: theme?.palette.text.primary,
        backgroundColor: theme?.palette.background.paper,
        '& .ant-tree-treenode::before': {
          backgroundColor: theme?.palette.background.paper,
        },
        '& .ant-tree-treenode:hover::before': {
          backgroundColor: theme?.palette.action.selected,
        },
        '& .ant-tree-treenode-selected::before': {
          color: theme?.palette.primary.contrastText,
          backgroundColor: theme?.palette.primary.light,
        },
        '& .ant-tree-treenode-selected:hover::before': {
          color: theme?.palette.primary.contrastText,
          backgroundColor: theme?.palette.primary.dark,
          // backgroundColor: theme?.palette.action.selected,
        },
      },
      '.MuiSelect-select.MuiSelect-select': {
        display: 'flex',
        alignItems: 'center',
      }
    }
  }))

  globalStyles()

  // return
  return (
    <GolbalStyleContext.Provider
      value={{
        theme: theme,
        setTheme: setTheme,
        themeType: theme?.palette.type === 'dark' ? 'dark' : 'light',
        toggleThemeType: () => {
          if (theme?.palette.type === 'dark') {
            setTheme(lightTheme)
          } else {
            setTheme(darkTheme)
          }
        }
      }}
    >
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {props.children}
      </ThemeProvider>
    </GolbalStyleContext.Provider>
  )
}

// propTypes
// GlobalStyleProvider.propTypes = {
//   theme: PropTypes.object,
// }

// update Context variable
GlobalStyleProvider.Context = GolbalStyleContext

export { GolbalStyleContext as Context }

export default GlobalStyleProvider
