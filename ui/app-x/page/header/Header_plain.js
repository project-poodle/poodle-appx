import React from 'react'
import { A } from 'app-x/router'
import PropTypes from 'prop-types'
import { Box, Avatar, Typography, AppBar, Toolbar, makeStyles } from '@material-ui/core'


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

  const { title, titleIcon, homeUrl, ...rest } = props

  return (
    <AppBar
      className={styles.root}
      elevation={0}
      {...rest}
    >
      <Toolbar className={styles.toolbar}>
        <A href={ homeUrl } className={styles.inline}>
          <Avatar className={styles.avatar}>
            { titleIcon }
          </Avatar>
        </A>
        <Typography variant="h6" display="inline" color="secondary" noWrap className={styles.text}>
          { title }
        </Typography>
      </Toolbar>
    </AppBar>
  )
}

Header_plain.propTypes = {
  title: PropTypes.string.isRequired,
  titleIcon: PropTypes.element.isRequired,
  homeUrl: PropTypes.string.isRequired,
}

export default Header_plain;
