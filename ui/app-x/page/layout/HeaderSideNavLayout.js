// const React = lib.react
import React from 'react'
import { useState } from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core'

const HeaderSideNavLayout = (props) => {

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
        paddingLeft: 300
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

  const styles = useStyles()

  const { header, sideNav, children } = props

  // console.log(header)
  // console.log(sideNav)
  // console.log(children)

  return (
    <div className={styles.root}>
      { header }
      { sideNav }
      <div className={styles.wrapper}>
        <div className={styles.contentContainer}>
          <div className={styles.content}>
          { children }
          </div>
        </div>
      </div>
    </div>
  )
}

HeaderSideNavLayout.propTypes = {
  header: PropTypes.element.isRequired,
  sideNav: PropTypes.element.isRequired,
}

export default HeaderSideNavLayout;
