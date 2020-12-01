//const React = lib.react
import React from 'react'
// const { useState } = lib.react
import { useState } from 'react'
// const { A, navigate } = lib.hookrouter
import { A, navigate } from 'hookrouter'
// const PropTypes = lib['prop-types']
import PropTypes from 'prop-types'
import {
  Icon,
  Button,
  ListItem,
  makeStyles
} from '@material-ui/core'


const useStyles = makeStyles((theme) => ({
  item: {
    display: 'flex',
    paddingTop: 0,
    paddingBottom: 0
  },
  button: {
    color: theme.palette.text.secondary,
    fontWeight: theme.typography.fontWeightMedium,
    justifyContent: 'flex-start',
    letterSpacing: 0,
    padding: '10px 8px',
    textTransform: 'none',
    width: '100%'
  },
  icon: {
    marginRight: theme.spacing(1)
  },
  title: {
    marginRight: 'auto'
  },
  active: {
    color: theme.palette.primary.main,
    '& $title': {
      fontWeight: theme.typography.fontWeightMedium
    },
    '& $icon': {
      color: theme.palette.primary.main
    }
  }
}));

const NavItem = (props) => {
  const classes = useStyles();

  const { href, icon: Icon, title, ...rest } = props

  //console.log(`INFO: [${href}] [${title}]`)

  return (
    <ListItem
      className={classes.item}
      disableGutters
      {...rest}
    >
      <A href={href}>
        <Button
          className={classes.button}
        >
          {Icon && (
            <Icon
              className={classes.icon}
              size="20"
            />
          )}
          <span className={classes.title}>
            {title}
          </span>
        </Button>
      </A>
    </ListItem>
  );
};

NavItem.propTypes = {
  //className: PropTypes.string,
  href: PropTypes.string,
  icon: PropTypes.elementType,
  title: PropTypes.string
};

export default NavItem;
