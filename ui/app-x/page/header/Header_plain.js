import React from 'react'
import { A } from 'app-x/router'
import PropTypes from 'prop-types'
import { Box, Avatar, Typography, AppBar, Toolbar, makeStyles } from '@material-ui/core'
// const { ViewQuiltRounded : ViewQuiltRoundedIcon } = lib['@material-ui/icons']
// import { ViewQuiltRounded as ViewQuiltRoundedIcon } from '@material-ui/icons'


const Header = (props) => {

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

  const { title, icon, homeUrl, ...rest } = props

  return (
    <AppBar
      className={styles.root}
      elevation={0}
      {...rest}
    >
      <Toolbar className={styles.toolbar}>
        <A href={ homeUrl } className={styles.inline}>
          <Avatar className={styles.avatar}>
            { icon }
          </Avatar>
          <Typography variant="h4" display="inline" color="secondary" noWrap className={styles.text}>
            { title }
          </Typography>
        </A>
      </Toolbar>
    </AppBar>
  )
}

Header.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.element.isRequired,
  homeUrl: PropTyps.string.isRequired,
}

export default Header;
