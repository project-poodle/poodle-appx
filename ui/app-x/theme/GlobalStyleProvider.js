import React, { useState } from 'react'
import PropTypes from 'prop-types'
import {
  ThemeProvider,
  CssBaseline,
  createStyles,
  makeStyles,
  colors,
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
          backgroundColor: props.theme?.palette?.background?.paper,
          color: props.theme?.palette?.text?.primary,
          height: '100%',
          width: '100%',
        },
        a: {
          textDecoration: 'none',
          color: 'inherit'
        },
        '#root': {
          height: '100%',
          width: '100%'
        },
        // antd overrides
        'h1': {
          color: props.theme?.palette?.text?.primary,
        },
        'h2': {
          color: props.theme?.palette?.text?.primary,
        },
        'h3': {
          color: props.theme?.palette?.text?.primary,
        },
        'h4': {
          color: props.theme?.palette?.text?.primary,
        },
        'h5': {
          color: props.theme?.palette?.text?.primary,
        },
        'h6': {
          color: props.theme?.palette?.text?.primary,
        },
        '.ant-tabs-content': {
          height: '100%', // fix ant tabs
        },
        '.ant-notification': {
          zIndex: 2010,
        },
        '.ant-tabs-tab .anticon': {
          margin: 0,
        },
        // '.anticon': {
        //   color: props.theme?.palette.text.primary,
        // },
        '.ant-btn': {
          color: props.theme?.palette.text.secondary,
          backgroundColor: 'inherit',
          borderColor: props.theme?.palette.action.selected,
          '&:hover': {
            color: props.theme?.palette.text.secondary,
            backgroundColor: props.theme?.palette.action.selected,
            borderColor: props.theme?.palette.text.secondary,
          },
          '&:focus': {
            color: props.theme?.palette.text.secondary,
            backgroundColor: props.theme?.palette.action.selected,
            borderColor: props.theme?.palette.text.secondary,
          },
          '&[disabled]': {
            color: props.theme?.palette.text.disabled,
            backgroundColor: props.theme?.palette.action.disabledBackground,
            borderColor: props.theme?.palette.action.selected,
            '&:hover': {
              color: props.theme?.palette.text.disabled,
              backgroundColor: props.theme?.palette.action.disabledBackground,
              borderColor: props.theme?.palette.action.selected,
            },
          },
        },
        '.ant-btn-primary': {
          color: props.theme?.palette.primary.contrastText,
          backgroundColor: props.theme?.palette.primary.light,
          borderColor: props.theme?.palette.primary.light,
          '&:hover': {
            color: props.theme?.palette.primary.contrastText,
            backgroundColor: props.theme?.palette.primary.main,
            borderColor: props.theme?.palette.primary.main,
          },
          '&:focus': {
            color: props.theme?.palette.primary.contrastText,
            backgroundColor: props.theme?.palette.primary.main,
            borderColor: props.theme?.palette.primary.main,
          },
        },
        '.ant-btn-dangerous': {
          color: props.theme?.palette.error.light,
          borderColor: props.theme?.palette.error.light,
          '&:hover': {
            color: props.theme?.palette.error.light,
            borderColor: props.theme?.palette.error.light,
          },
          '&:focus': {
            color: props.theme?.palette.error.light,
            borderColor: props.theme?.palette.error.light,
          },
        },
        '.ant-tabs': {
          color: props.theme?.palette.text.primary,
        },
        '.ant-tabs-tab': {
          color: props.theme?.palette.text.primary,
          '&:hover': {
            color: props.theme?.palette.primary.light,
          },
          '& ant-tabs-tab-active': {
            color: props.theme?.palette.primary.light,
          }
        },
        '.ant-select-dropdown': {
          zIndex: 2050,
          color: props.theme?.palette.text.primary,
          backgroundColor: props.theme?.palette.background.paper,
        },
        '.ant-select-item': {
          color: props.theme?.palette.text.primary,
          backgroundColor: props.theme?.palette.background.paper,
          '&.ant-select-item-option-active': {
            color: props.theme?.palette.text.primary,
            backgroundColor: props.theme?.palette.action.selected,
          },
          '&.ant-select-item-option-selected': {
            color: props.theme?.palette.primary.contrastText,
            backgroundColor: props.theme?.palette.primary.light,
          },
        },
        '.ant-tree': {
          color: props.theme?.palette.text.primary,
          backgroundColor: props.theme?.palette.background.paper,
          /*
          '& .ant-tree-treenode::before': {
            backgroundColor: props.theme?.palette?.background?.paper,
            // color: props.theme?.palette?.text?.primary,
          },
          '& .ant-tree-treenode:hover::before': {
            backgroundColor: props.theme?.palette?.action?.selected,
            // color: props.theme?.palette?.text?.primary,
          },
          '& .ant-tree-treenode-selected::before': {
            color: props.theme?.palette?.action?.selected,
            backgroundColor: props.theme?.palette?.secondary?.main,
            // color: props.theme?.palette?.text?.primary,
          },
          '& .ant-tree-treenode-selected:hover::before': {
            color: props.theme?.palette?.action?.selected,
            backgroundColor: props.theme?.palette?.secondary?.dark,
            // color: props.theme?.palette?.text?.primary,
          },
          */
          '& .ant-tree-node-content-wrapper': {
            backgroundColor: props.theme?.palette.background.paper,
          },
          '& .ant-tree-node-content-wrapper:hover': {
            backgroundColor: props.theme?.palette.action.selected,
          },
          '& .ant-tree-node-content-wrapper.ant-tree-node-selected': {
            color: props.theme?.palette.primary.contrastText,
            backgroundColor: props.theme?.palette.primary.light,
          },
          '& .ant-tree-node-content-wrapper.ant-tree-node-selected:hover': {
            color: props.theme?.palette.primary.contrastText,
            backgroundColor: props.theme?.palette.primary.main,
          },
        },
        '.ant-tree.ant-tree-directory': {
          color: props.theme?.palette.text.primary,
          backgroundColor: props.theme?.palette.background.paper,
          '& .ant-tree-treenode::before': {
            backgroundColor: props.theme?.palette.background.paper,
          },
          '& .ant-tree-treenode:hover::before': {
            backgroundColor: props.theme?.palette.action.selected,
          },
          '& .ant-tree-treenode-selected::before': {
            color: props.theme?.palette.primary.contrastText,
            backgroundColor: props.theme?.palette.primary.light,
          },
          '& .ant-tree-treenode-selected:hover::before': {
            color: props.theme?.palette.primary.contrastText,
            backgroundColor: props.theme?.palette.primary.main,
          },
        },
        '.MuiSelect-select.MuiSelect-select': {
          display: 'flex',
          alignItems: 'center',
        }
      }
    }))

    globalStyles()

    return (
      <GolbalStyleContext.Provider
        value={{
          globalStyles,
        }}
      >
        <ThemeProvider theme={props.theme}>
          <CssBaseline />
          {props.children}
        </ThemeProvider>
      </GolbalStyleContext.Provider>
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
