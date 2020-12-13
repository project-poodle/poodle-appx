// const React = lib.react
import React from 'react'
import { useState } from 'react'
import PropTypes from 'prop-types'
import { Box, makeStyles } from '@material-ui/core'

import SideDrawer from 'app-x/page/layout/SideDrawer'

const SideNavLayout = (props) => {

  const useStyles = makeStyles((theme) => ({
    root: {
      backgroundColor: theme.palette.background.dark,
      display: 'flex',
      height: '100%',
      width: '100%',
      overflow: 'hidden',
    },
    wrapper: {
      display: 'flex',
      flex: '1 1 auto',
      overflow: 'hidden',
      // paddingTop: 64,
      [theme.breakpoints.up('md')]: {
        paddingLeft: 300
      }
    },
    contentContainer: {
      display: 'flex',
      flex: '1 1 auto',
      overflow: 'hidden',
    },
    content: {
      flex: '1 1 auto',
      height: '100%',
      overflow: 'auto',
    }
  }))

  const styles = useStyles()

  // const { sideNav, children } = props
  // console.log(sideNav)
  // console.log(children)

  return (
    <div className={styles.root}>
      <SideDrawer
        isMobileNavOpen={props.isMobileNavOpen}
        onMobileClose={props.onMobileClose}
      >
        { props.sideNav }
      </SideDrawer>
      <div className={styles.wrapper}>
        <div className={styles.contentContainer}>
          <div className={styles.content}>
          { props.children }
          </div>
        </div>
      </div>
    </div>
  )
}

SideNavLayout.propTypes = {
  sideNav: PropTypes.element.isRequired,
  isMobileNavOpen: PropTypes.bool,
  onMobileClose: PropTypes.func,
}

export default SideNavLayout;
