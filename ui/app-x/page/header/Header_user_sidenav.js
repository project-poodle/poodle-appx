import React from 'react'
// import { useState } from 'react'
import { connect } from 'react-redux'
import { A, navigate } from 'app-x/router'
import PropTypes from 'prop-types'
import {
  Avatar,
  Typography,
  AppBar,
  Badge,
  Box,
  Hidden,
  IconButton,
  Toolbar,
  makeStyles
} from '@material-ui/core'
import {
  Menu as MenuIcon,
  ExitToApp as ExitToApp
} from '@material-ui/icons'

import { logout, me } from 'app-x/api'


const Header_user_sidenav = (props) => {

  const useStyles = makeStyles((theme) => ({
    root: {},
    avatar: {
      display: "inline-grid",
      margin: theme.spacing(1),
      backgroundColor: theme.palette.primary.light,
    },
    text: {
      paddingLeft: 12,
      verticalAlign: "super",
      color: theme.palette.background.default,
    },
  }));

  function handleLogout() {
    logout(
      props.appName,
      (res) => {
        navigate(props.loginUrl)
      },
      (err) => {
        // TODO
        console.log(err.stack)
      }
    )
  }

  const styles = useStyles()

  function self_check() {
    me(props.appName,
      (data) => {
        console.log({
          ...data,
          t: new Date()
        })
        // recurring check if successful
        setTimeout(
          self_check,
          Math.floor((Math.random() * 60) + 120) * 1000
        )
      },
      (error) => {
        navigate(props.loginUrl)
      }
    )
  }

  self_check()

  // check that userToken exist and is valid, otherwise, navigate to login
  /*
  if (!props.reducers
      || !props.reducers.user
      || !props.reducers.user.userToken
      || !props.reducers.user.userToken.token
      || !props.reducers.user.userToken.username) {
    navigate(props.loginUrl)
  }
  */

  // render
  return (
    <AppBar
      className={styles.root}
      elevation={0}
    >
      <Toolbar>
        <A href={props.homeUrl} className={styles.inline}>
          <Avatar className={styles.avatar}>
            { props.titleIcon }
          </Avatar>
          <Typography variant="h6" display="inline" color="secondary" noWrap className={styles.text}>
            { props.title }
          </Typography>
        </A>
        <Box flexGrow={1} />
        <IconButton
          color="inherit"
          onClick={() => { handleLogout() }}
        >
          <ExitToApp />
        </IconButton>
        <Hidden mdUp>
          <IconButton
            color="inherit"
            onClick={() => {props.handlers.sideNavHandler()}}
          >
            <MenuIcon />
          </IconButton>
        </Hidden>
      </Toolbar>
    </AppBar>
  );
};

Header_user_sidenav.propTypes = {
  appName: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  titleIcon: PropTypes.element.isRequired,
  homeUrl: PropTypes.string.isRequired,
  loginUrl: PropTypes.string.isRequired,
  handlers: PropTypes.shape({
    sideNavHandler: PropTypes.func.isRequired
  }),
  reducers: PropTypes.shape({
    user: PropTypes.shape({
      userToken: PropTypes.object,
      userInfo: PropTypes.object
    })
  })
}

// state to props
const mapStateToProps = (state, ownProps) => {
  //console.log(state)
  //console.log(ownProps)
  const app_name = ownProps.appName
  const userReducer = state.userReducer[app_name]

  const userState = {}
  if ('userToken' in userState) {
    userState.userToken = userReducer.userToken
  }
  if ('userInfo' in userState) {
    userState.userInfo = userReducer.userInfo
  }

  let updateState = ownProps.reducers
    ? {
        reducers: {
          ...ownProps.reducers,
          user: userState // update user from existing props
        }
      }
    : {
        reducers: {
          user: userState
        }
      }

  return userState
}

// dispatch to props
const mapDispatchToProps = (dispatch) => {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(Header_user_sidenav)
// export default Header_user_sidenav
