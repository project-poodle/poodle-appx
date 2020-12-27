import React from 'react'
import { A, usePath } from 'app-x/router'
import PropTypes from 'prop-types'
import { Box, Avatar, Typography, AppBar, Toolbar, makeStyles } from '@material-ui/core'
import { usePath as _usePath } from 'hookrouter'

const Header_plain = (props) => {

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

  const styles = useStyles()

  const { title, titleIcon, rootUrl, baseUrl, ...rest } = props

  return (
    <AppBar
      className={styles.root}
      elevation={0}
      {...rest}
    >
      <Toolbar className={styles.toolbar}>
        <A href={ rootUrl } className={styles.inline}>
          <Avatar className={styles.avatar}>
            { titleIcon }
          </Avatar>
        </A>
        <A href={ baseUrl } className={styles.inline}>
          <Typography variant="h6" display="inline" color="secondary" noWrap className={styles.text}>
            { title }
          </Typography>
        </A>
      </Toolbar>
    </AppBar>
  )
}

Header_plain.propTypes = {
  title: PropTypes.string.isRequired,
  titleIcon: PropTypes.element.isRequired,
  rootUrl: PropTypes.string.isRequired,
  baseUrl: PropTypes.string.isRequired,
}

export default Header_plain;
