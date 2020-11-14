import React from 'react'
import { A } from 'hookrouter'
import Avatar from '@material-ui/core/Avatar'
import Typography from '@material-ui/core/Typography'
import ViewQuiltRoundedIcon from '@material-ui/icons/ViewQuiltRounded'
import clsx from 'clsx'
// import PropTypes from 'prop-types'
import Box from '@material-ui/core/Box'
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
    paddingTop: 0,
    paddingLeft: 16,
    height: 60,
    verticalAlign: "text-bottom",
    color: theme.palette.background.default,
  },
}));

const Header = ({ ...rest }) => {
  const classes = useStyles()

  return (
    <AppBar
      className={clsx(classes.root)}
      elevation={0}
      {...rest}
    >
      <Toolbar className={classes.toolbar}>
        <a href="/" className={classes.inline}>
          <Avatar className={classes.avatar}>
            <ViewQuiltRoundedIcon/>
          </Avatar>
          <Typography variant="h3" display="inline" color="secondary" noWrap className={classes.text}>
            App-X
          </Typography>
        </a>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
