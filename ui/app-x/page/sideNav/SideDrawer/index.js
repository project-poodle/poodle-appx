// const React = lib.react
import React from 'react'
// const { useState } = lib.react
import { useState } from 'react'
// const { A, navigate } = lib.hookrouter
import { A, navigate } from 'hookrouter'
// const PropTypes = lib['prop-types']
import PropTypes from 'prop-types'
import {
  Avatar,
  Box,
  Button,
  Divider,
  Drawer,
  Hidden,
  List,
  Typography,
  makeStyles
} from '@material-ui/core'
import {
  AlertCircle as AlertCircleIcon,
  BarChart as BarChartIcon,
  Lock as LockIcon,
  Settings as SettingsIcon,
  ShoppingBag as ShoppingBagIcon,
  User as UserIcon,
  UserPlus as UserPlusIcon,
  Users as UsersIcon
} from 'react-feather'

import NavItem from 'app-x/page/sideNav/SideDrawer/NavItem'

const user = {
  avatar: '/static/images/avatars/avatar_6.png',
  jobTitle: 'Senior Developer',
  name: 'Katarina Smith'
}

const items = [
  {
    title: 'Dashboard',
    titleIcon: BarChartIcon,
    href: '/app/dashboard',
  },
  {
    title: 'Customers',
    titleIcon: UsersIcon,
    href: '/app/customers',
  },
  {
    title: 'Products',
    titleIcon: ShoppingBagIcon,
    href: '/app/products',
  },
  {
    href: '/app/account',
    titleIcon: UserIcon,
    title: 'Account'
  },
  {
    title: 'Settings',
    titleIcon: SettingsIcon,
    href: '/app/settings',
  },
  {
    title: 'Login',
    titleIcon: LockIcon,
    href: '/login',
  },
  {
    title: 'Register',
    titleIcon: UserPlusIcon,
    href: '/register',
  },
  {
    title: 'Error',
    titleIcon: AlertCircleIcon,
    href: '/404',
  }
];

const NavBar = (props) => {

  const useStyles = makeStyles(() => ({
    mobileDrawer: {
      width: 256
    },
    desktopDrawer: {
      width: 256,
      top: 64,
      height: 'calc(100% - 64px)'
    },
    avatar: {
      cursor: 'pointer',
      width: 64,
      height: 64
    }
  }));

  const classes = useStyles();
  //const location = useLocation();

  const { onMobileClose, isMobileNavOpen } = props

  const content = (
    <Box
      height="100%"
      display="flex"
      flexDirection="column"
    >
      <Box
        alignItems="center"
        display="flex"
        flexDirection="column"
        p={2}
      >
        <A href="/app/account">
          <Avatar
            className={classes.avatar}
            src={user.avatar}
          />
        </A>
        <Typography
          className={classes.name}
          color="textPrimary"
          variant="h5"
        >
          {user.name}
        </Typography>
        <Typography
          color="textSecondary"
          variant="body2"
        >
          {user.jobTitle}
        </Typography>
      </Box>
      <Divider />
      <Box p={2}>
        <List>
          {items.map((item) => (
            <NavItem
              href={item.href}
              key={item.title}
              title={item.title}
              titleIcon={item.titleIcon}
            />
          ))}
        </List>
      </Box>
      <Box flexGrow={1} />
      <Box
        p={2}
        m={2}
        bgcolor="background.dark"
      >
        <Typography
          align="center"
          gutterBottom
          variant="h4"
        >
          Have Questions?
        </Typography>
      </Box>
    </Box>
  );

  return (
    <>
      <Hidden mdUp>
        <Drawer
          anchor="left"
          classes={{ paper: classes.mobileDrawer }}
          onClose={props.onMobileClose}
          open={props.isMobileNavOpen}
          variant="temporary"
        >
          {content}
        </Drawer>
      </Hidden>
      <Hidden smDown>
        <Drawer
          anchor="left"
          classes={{ paper: classes.desktopDrawer }}
          open
          variant="persistent"
        >
          {content}
        </Drawer>
      </Hidden>
    </>
  );
};

NavBar.propTypes = {
  isMobileNavOpen: PropTypes.bool
}

NavBar.defaultProps = {
  isMobileNavOpen: false
}

export default NavBar;
