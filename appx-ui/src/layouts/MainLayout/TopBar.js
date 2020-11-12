import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import ViewQuiltIcon from '@material-ui/icons/ViewQuilt';
import ViewQuiltRoundedIcon from '@material-ui/icons/ViewQuiltRounded';
import Avatar from '@material-ui/core/Avatar';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import {
  AppBar,
  Toolbar,
  makeStyles
} from '@material-ui/core';
import Logo from 'src/components/Logo';

const useStyles = makeStyles((theme) => ({
  root: {},
  toolbar: {
    height: 64
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.primary.light,
  },
}));

const TopBar = ({ className, ...rest }) => {
  const classes = useStyles();

  return (
    <AppBar
      className={clsx(classes.root, className)}
      elevation={0}
      {...rest}
    >
      <Toolbar className={classes.toolbar}>
        <RouterLink to="/">
          <Avatar className={classes.avatar}>
            <ViewQuiltRoundedIcon/>
          </Avatar>
        </RouterLink>
      </Toolbar>
    </AppBar>
  );
};

TopBar.propTypes = {
  className: PropTypes.string
};

export default TopBar;
