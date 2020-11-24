const React = lib.react
const { useState } = lib.react
const { connect } = lib['react-redux']
const { A, navigate } = lib['hookrouter']
const PropTypes = lib['prop-types']
const clsx = lib.clsx.default
const {
  Avatar,
  Typography,
  AppBar,
  Badge,
  Box,
  Hidden,
  IconButton,
  Toolbar,
  makeStyles
} = lib['@material-ui/core']
const { ViewQuiltRounded : ViewQuiltRoundedIcon } = lib['@material-ui/icons']
const {
  Menu: MenuIcon,
  NotificationsOutlined: NotificationsIcon,
  ExitToApp: ExitToApp
} = lib['@material-ui/icons']

import { logout, get_app_context, get_user_info } from 'app-x/api'


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

//console.log(userToken)
setInterval(() => {
  get_user_info(null)
}, Math.floor((Math.random() * 120) + 60) * 1000)


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
        navigate('/appbuilder/login')
        //console.log(res)
      },
      (err) => {
        // TODO
        console.log(err.stack)
      }
    )
  }

  if (!userToken || !userToken.token || !userToken.username) {
    navigate('/appbuilder/login')
  }

  // render
  return (
    <AppBar
      className={clsx(classes.root, className)}
      elevation={0}
      {...rest}
    >
      <Toolbar>
        <A href="/appbuilder/console" className={classes.inline}>
          <Avatar className={classes.avatar}>
            <ViewQuiltRoundedIcon/>
          </Avatar>
          <Typography variant="h4" display="inline" color="secondary" noWrap className={classes.text}>
            App Builder
          </Typography>
        </A>
        <Box flexGrow={1} />
        <Hidden smDown>
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
        <Hidden mdUp>
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
