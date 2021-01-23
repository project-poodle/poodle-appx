import _ from 'lodash'
import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { A, HLink, navigate, hnavigate } from 'app-x/router'
import PropTypes from 'prop-types'
import {
  Avatar,
  Typography,
  AppBar,
  Badge,
  Box,
  Hidden,
  Fab,
  IconButton,
  Toolbar,
  Menu,
  MenuItem,
  ListItem,
  ListItemIcon,
  ListItemText,
  Popover,
  makeStyles
} from '@material-ui/core'
import {
  ExitToApp as ExitToApp,
  AccountCircleOutlined
} from '@material-ui/icons'

import { logout, me } from 'app-x/api'

// user badge
const UserBadge = (props) => {

  const styles = (makeStyles(theme => ({
    fab: {
      // margin: theme.spacing(1),
      boxShadow: "none",
    },
    extendedIcon: {
      marginRight: theme.spacing(1),
    },
  })))()

  // redirect for logout
  function redirectLogout() {
    if (!!props.auth) {
      hnavigate(
        props.auth.namespace,
        props.auth.ui_name,
        props.auth.ui_deployment,
        props.authUrl,
      )
    } else {
      navigate(props.authUrl)
    }
  }

  function handleLogout() {
    Object.keys(globalThis.appx.API_MAPS).map(namespace => {
      Object.keys(globalThis.appx.API_MAPS[namespace]).map(app_name => {
        logout(
          props.realm,
          (res) => {
            redirectLogout()
          },
          (err) => {
            // TODO
            console.log(err.stack)
            redirectLogout()
          }
        )
      })
    })
  }

  // check each api map with deployment
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
        },
        (error) => {
          redirectLogout()
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

  // logout user if user token not exist
  useEffect(() => {
    if (!!props.reducers.user) {
      if (!props.reducers.user.realm
          || !props.reducers.user.username
          || !props.reducers.user.token) {
        // handle logout
        handleLogout()
      }
    }
  },
  [
    props.reducers?.user?.realm,
    props.reducers?.user?.username,
    props.reducers?.user?.token,
  ])

  const fabRef = React.createRef()

  // menu and anchorEl
  const [anchorEl, setAnchorEl] = React.useState(null)

  // render
  return (
    <>
      <Fab
        ref={fabRef}
        color={props.color || "primary"}
        size={props.size || 'medium'}
        aria-label="User"
        variant="extended"
        className={styles.fab}
        onClick={e => {
          console.log(e)
          // setAnchorEl(event.target)
          setAnchorEl(fabRef.current)
        }}
      >
        { props.icon || <AccountCircleOutlined className={styles.extendedIcon}/> }
        { props.reducers?.user?.username }
      </Fab>
      <Popover
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        id="account-menu"
        keepMounted
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={Boolean(anchorEl)}
        onClose={e => setAnchorEl(null)}
      >
        <ListItem onClick={handleLogout} button={true}>
          <ListItemIcon>
            <ExitToApp/>
          </ListItemIcon>
          <ListItemText primary="Logout"></ListItemText>
        </ListItem>
      </Popover>
    </>
  )
}

// state to props
const mapStateToProps = (state, ownProps) => {

  const updateState = {
    reducers: {
      user: !!ownProps.reducers?.user ? ownProps.reducers.user : {},
      role: !!ownProps.reducers?.role ? ownProps.reducers.role : {}
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

// propTypes
UserBadge.propTypes = {
  realm: PropTypes.string,
  auth: PropTypes.shape({
    namespace: PropTypes.string.isRequired,
    ui_name: PropTypes.string.isRequired,
    ui_deployment: PropTypes.string.isRequired,
  }),
  authUrl: PropTypes.string.isRequired,
  icon: PropTypes.element,
  color: PropTypes.string,
}

export default connect(mapStateToProps, mapDispatchToProps)(UserBadge)
// export default UserBadge
