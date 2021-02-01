import _ from 'lodash'
import React, { useContext } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import {
  Typography,
  Box,
  Fab,
  makeStyles
} from '@material-ui/core'
import {
  Brightness7Rounded,
  Brightness4Rounded,
} from '@material-ui/icons'

import GlobalStyleProvider from 'app-x/theme/GlobalStyleProvider'

// user badge
const ThemeBadge = (props) => {

  const styles = (makeStyles(theme => ({
    fab: {
      boxShadow: "none",
      // margin: theme.spacing(1),
    },
  })))()

  // theme
  const { themeType, toggleThemeType } = useContext(GlobalStyleProvider.Context)

  // render
  return (
    <Fab
      color={props.color || "primary"}
      size={props.size || 'small'}
      aria-label="Theme"
      className={styles.fab}
      onClick={toggleThemeType}
    >
      {
        themeType === 'dark'
        &&
        (
          <Brightness7Rounded />
        )
      }
      {
        themeType !== 'dark'
        &&
        (
          <Brightness4Rounded />
        )
      }
    </Fab>
  )
}

// propTypes
ThemeBadge.propTypes = {
  color: PropTypes.string,
  size: PropTypes.string,
}

export default ThemeBadge
