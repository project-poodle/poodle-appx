import _ from 'lodash'
import React, { useEffect } from 'react'
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


const Header_user = (props) => {

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
    Object.keys(globalThis.appx.API_MAPS).map(namespace => {
      Object.keys(globalThis.appx.API_MAPS[namespace]).map(app_name => {
        logout(
          props.realm,
          (res) => {
            navigate(props.loginUrl)
          },
          (err) => {
            // TODO
            console.log(err.stack)
          }
        )
      })
    })
  }

  const styles = useStyles()

  useEffect(() => {
    function self_check(namespace, app_name) {
      me(
        namespace,
        app_name,
        (data) => {
          console.log({
            ...data,
            t: new Date()
          })
          // recurring check if successful
          //setTimeout(
          //  self_check,
          //  Math.floor((Math.random() * 60) + 120) * 1000
          //)
        },
        (error) => {
          navigate(props.loginUrl)
        }
      )
    }

    Object.keys(globalThis.appx.API_MAPS).map(namespace => {
      Object.keys(globalThis.appx.API_MAPS[namespace]).map(app_name => {
        if ('deployment' in globalThis.appx.API_MAPS[namespace][app_name]) {
          self_check(namespace, app_name)
        }
      })
    })
  }, [])

  // render
  return (
    <AppBar
      className={styles.root}
      elevation={0}
    >
      <Toolbar>
        { props.prefix }
        <A href={props.homeUrl} className={styles.inline}>
          <Avatar className={styles.avatar}>
            { props.titleIcon }
          </Avatar>
          <Typography variant="h6" display="inline" color="secondary" noWrap className={styles.text}>
            { props.title }
          </Typography>
        </A>
        <Box flexGrow={1} />
        { props.content }
        <IconButton
          color="inherit"
          onClick={() => { handleLogout() }}
        >
          <ExitToApp />
        </IconButton>
        { props.suffix }
      </Toolbar>
    </AppBar>
  );
};

Header_user.propTypes = {
  title: PropTypes.string.isRequired,
  titleIcon: PropTypes.element.isRequired,
  homeUrl: PropTypes.string.isRequired,
  loginUrl: PropTypes.string.isRequired,
  prefix: PropTypes.element,
  content: PropTypes.element,
  suffix: PropTypes.element,
  reducers: PropTypes.shape({
    user: PropTypes.shape({
      realm: PropTypes.string,
      username: PropTypes.string,
      token: PropTypes.string
    }),
    role: PropTypes.shape({
      namespace: PropTypes.string,
      app_name: PropTypes.string,
      realm: PropTypes.string,
      username: PropTypes.string,
      data: PropTypes.object
    })
  }),
  realm: PropTypes.string,
}

// state to props
const mapStateToProps = (state, ownProps) => {
  //console.log(state)
  //console.log(ownProps)

  const updateState = {
    reducers: {
      user: ownProps.reducers && ownProps.reducers.user ? ownProps.reducers.user : {},
      role: ownProps.reducers && ownProps.reducers.role ? ownProps.reducers.role : {}
    },
    realm: ownProps.realm
  }

  // update role reducers
  Object.keys(globalThis.appx.API_MAPS).map(namespace => {
    Object.keys(globalThis.appx.API_MAPS[namespace]).map(app_name => {
      if (! (namespace in updateState.reducers.role)) {
        updateState.reducers.role[namespace] = {}
      }
      if (namespace in state.roleReducer && app_name in state.roleReducer[namespace]) {
        updateState.reducers.role[namespace][app_name] = {
          namespace: namespace,
          app_name: app_name,
          realm: state.roleReducer[namespace][app_name].realm,
          username: state.roleReducer[namespace][app_name].username,
          data: _.cloneDeep(state.roleReducer[namespace][app_name].username),
        }
        // update realm
        updateState.realm = state.roleReducer[namespace][app_name].realm
      }
    })
  })

  // update user reducers
  if (updateState.realm in state.userReducer) {
    updateState.reducers.user.realm = state.userReducer[updateState.realm].realm
    updateState.reducers.user.username = state.userReducer[updateState.realm].username
    updateState.reducers.user.token = state.userReducer[updateState.realm].token
  }

  // return updateState
  return updateState
}

// dispatch to props
const mapDispatchToProps = (dispatch) => {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(Header_user)
// export default Header_user
