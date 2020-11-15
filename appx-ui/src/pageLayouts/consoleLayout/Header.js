import React, { useState } from 'react';
import { connect } from 'react-redux';
import { A, navigate } from 'hookrouter';
// import { Link as RouterLink } from 'react-router-dom';
import Avatar from '@material-ui/core/Avatar'
import Typography from '@material-ui/core/Typography'
import ViewQuiltRoundedIcon from '@material-ui/icons/ViewQuiltRounded'
import clsx from 'clsx';
import PropTypes from 'prop-types';
import {
  AppBar,
  Badge,
  Box,
  Hidden,
  IconButton,
  Toolbar,
  makeStyles
} from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import NotificationsIcon from '@material-ui/icons/NotificationsOutlined';
import { ExitToApp } from '@material-ui/icons';
import { logout, get_app_context, get_user_info } from 'src/api'

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

const Header = ({
  className,
  onMobileNavOpen,
  userToken,
  userInfo,
  ...rest
}) => {
  const classes = useStyles()
  const [notifications] = useState([])

  function handleLogout() {
    logout(
      null,
      (res) => {
        navigate('/appx/login')
        //console.log(res)
      },
      (err) => {
        // TODO
        console.log(err.stack)
      }
    )
  }

  if (!userToken || !userToken.token || !userToken.username) {
    navigate('/appx/login')
  }

  //console.log(userToken)
  setTimeout(() => {
    get_user_info(null)
  }, Math.floor((Math.random() * 60) + 60) * 1000)

  // render
  return (
    <AppBar
      className={clsx(classes.root, className)}
      elevation={0}
      {...rest}
    >
      <Toolbar>
        <A href="/appx/console" className={classes.inline}>
          <Avatar className={classes.avatar}>
            <ViewQuiltRoundedIcon/>
          </Avatar>
          <Typography variant="h4" display="inline" color="secondary" noWrap className={classes.text}>
            App Builder
          </Typography>
        </A>
        <Box flexGrow={1} />
        <Hidden mdDown>
          <IconButton color="inherit">
            <Badge
              badgeContent={notifications.length}
              color="primary"
              variant="dot"
            >
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <IconButton
            color="inherit"
            onClick={() => {handleLogout()}}
          >
            <ExitToApp />
          </IconButton>
        </Hidden>
        <Hidden lgUp>
          <IconButton
            color="inherit"
            onClick={onMobileNavOpen}
          >
            <MenuIcon />
          </IconButton>
        </Hidden>
      </Toolbar>
    </AppBar>
  );
};

Header.propTypes = {
  className: PropTypes.string,
  onMobileNavOpen: PropTypes.func,
  userToken: PropTypes.object,
  userInfo: PropTypes.object,
};

// state to props
const mapStateToProps = (state) => {
  //console.log(state)
  let app_context = get_app_context()
  if (! ('namespace' in app_context) || !('app_name' in app_context)) {
    return {}
  }
  if (!(app_context.namespace in state.userReducer)
      || !(app_context.app_name in state.userReducer[app_context.namespace])) {
    return {}
  }
  let userState = state.userReducer[app_context.namespace][app_context.app_name]
  let updateState = {}
  if ('userToken' in userState) {
    updateState.userToken = userState.userToken
  }
  if ('userInfo' in userState) {
    updateState.userInfo = userState.userInfo
  }
  return updateState
}

// dispatch to props
const mapDispatchToProps = (dispatch) => {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(Header)
