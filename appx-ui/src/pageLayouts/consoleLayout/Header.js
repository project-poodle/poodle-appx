import React, { useState } from 'react';
// import { Link as RouterLink } from 'react-router-dom';
import { A } from 'hookrouter'
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
import { logout } from 'src/api'

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
  ...rest
}) => {
  const classes = useStyles()
  const [notifications] = useState([])

  function handleLogout() {
    logout(
      'appx',
      'appx@LDAP',
      () => {
        // TODO
      },
      () => {
        // TODO
      }
    )
  }

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
            onClick={handleLogout}
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
  onMobileNavOpen: PropTypes.func
};

export default Header;
