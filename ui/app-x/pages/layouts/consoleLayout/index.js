// const React = lib.react
import React from 'react'
import { useState } from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core'

import NavBar from 'app-x/pages/layouts/consoleLayout/NavBar'
import Header from 'app-x/pages/layouts/consoleLayout/Header'


const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    display: 'flex',
    height: '100%',
    overflow: 'hidden',
    width: '100%'
  },
  wrapper: {
    display: 'flex',
    flex: '1 1 auto',
    overflow: 'hidden',
    paddingTop: 64,
    [theme.breakpoints.up('md')]: {
      paddingLeft: 256
    }
  },
  contentContainer: {
    display: 'flex',
    flex: '1 1 auto',
    overflow: 'hidden'
  },
  content: {
    flex: '1 1 auto',
    height: '100%',
    overflow: 'auto'
  }
}))

const ConsoleLayout = (props) => {
  const classes = useStyles();
  const [isMobileNavOpen, setMobileNavOpen] = useState(false);
  const { children } = props

  return (
    <div className={classes.root}>
      <Header onMobileNavOpen={() => setMobileNavOpen(true)} />
      <NavBar
        onMobileClose={() => setMobileNavOpen(false)}
        openMobile={isMobileNavOpen}
      />
      <div className={classes.wrapper}>
        <div className={classes.contentContainer}>
          <div className={classes.content}>
          { children }
          </div>
        </div>
      </div>
    </div>
  )
}

ConsoleLayout.propTypes = {
  children: PropTypes.element.isRequired
}

export default ConsoleLayout;
