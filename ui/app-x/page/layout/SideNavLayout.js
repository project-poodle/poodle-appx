import React from 'react'
import { useState } from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core'

//import NavBar from 'app-x/pages/layouts/consoleLayout/NavBar'
//import Header from 'app-x/pages/layouts/consoleLayout/Header'

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

  const styles = useStyles();

  const [isMobileNavOpen, setMobileNavOpen] = useState(false);

  const { sideNav, children } = props

  return (
    <div className={styles.root}>
      <Header onMobileNavOpen={() => setMobileNavOpen(true)} />
      <NavBar
        onMobileClose={() => setMobileNavOpen(false)}
        openMobile={isMobileNavOpen}
      />
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
  sideNav: PropTypes.element.isRequired,
  children: PropTypes.element.isRequired
}

export default HeaderSideNavLayout;
