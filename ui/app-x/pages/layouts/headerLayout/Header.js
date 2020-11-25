//const React = lib.react
import React from 'react'
//const { A } = lib.hookrouter
import { A } from 'hookrouter'
// const  { Avatar, Typography } = lib['@material-ui/core']
import { Avatar, Typography } from '@material-ui/core'
// const { ViewQuiltRounded : ViewQuiltRoundedIcon } = lib['@material-ui/icons']
import { ViewQuiltRounded as ViewQuiltRoundedIcon } from '@material-ui/icons'
//import clsx from 'clsx'
// import PropTypes from 'prop-types'
import { Box } from '@material-ui/core'
import { AppBar, Toolbar, makeStyles } from '@material-ui/core'

const useStyles = makeStyles((theme) => ({
  root: {},
  toolbar: {
    height: 64
  },
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

const Header = ({ ...rest }) => {
  const classes = useStyles()

  return (
    <AppBar
      className={classes.root}
      elevation={0}
      {...rest}
    >
    <Toolbar className={classes.toolbar}>
    <a href="/" className={classes.inline}>
    <Avatar className={classes.avatar}>
      <ViewQuiltRoundedIcon/>
    </Avatar>
    <Typography variant="h4" display="inline" color="secondary" noWrap className={classes.text}>
      App-X
    </Typography>
    </a>
    </Toolbar>
    </AppBar>
  );
};

export default Header;
