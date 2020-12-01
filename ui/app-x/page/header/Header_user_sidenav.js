import React from 'react'
import { useState } from 'react'
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

setInterval(() => {
  me(app_name)
}, Math.floor((Math.random() * 60) + 120) * 1000)


const Header = (props) => {

  const {
    appName,
    homeUrl,
    loginUrl,
    handlers,
    reducers,
    ...rest
  } = props

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
  const [notifications] = useState([])

  // check that userToken exist and is valid, otherwise, navigate to login
  if (!reducers
      || !reducers.user
      || !reducers.user.userToken
      || !reducers.user.userToken.token
      || !reducers.user.userToken.username) {
    navigate(loginUrl)
  }

  // render
  return (
    <AppBar
      className={styles.root}
      elevation={0}
      {...rest}
    >
      <Toolbar>
        <A href={homeUrl} className={styles.inline}>
          <Avatar className={styles.avatar}>
            { props.titleIcon }
          </Avatar>
          <Typography variant="h4" display="inline" color="secondary" noWrap className={styles.text}>
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
            onClick={handlers.sideNavHandler}
          >
            <MenuIcon />
          </IconButton>
        </Hidden>
      </Toolbar>
    </AppBar>
  );
};

Header.propTypes = {
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
  let app_context = get_app_context()
  if (! ('namespace' in app_context) || !('app_name' in app_context)) {
    return {}
  }
  if (!(app_context.namespace in state.userReducer)
      || !(app_context.app_name in state.userReducer[app_context.namespace])) {
    return {}
  }
  const userReducer = state.userReducer[app_context.namespace][app_context.app_name]

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

export default connect(mapStateToProps, mapDispatchToProps)(Header)
