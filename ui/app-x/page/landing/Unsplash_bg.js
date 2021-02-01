import React from 'react'
import { useState } from 'react'
import PropTypes from 'prop-types'

import {
  Avatar,
  Button,
  CssBaseline,
  TextField,
  Link,
  Paper,
  Container,
  Box,
  Grid,
  Typography,
  makeStyles
} from '@material-ui/core'

import FacebookIcon from 'app-x/icon/Facebook'
import GoogleIcon from 'app-x/icon/Google'
import { login, me } from 'app-x/api'


const SignInSide = (props) => {

  const collection = props.unsplashCollections[Math.floor(Math.random() * props.unsplashCollections.length)]

  const useStyles = makeStyles((theme) => ({
    root: {
      height: '100%',
      width: '100%',
      zIndex: -1,
    },
    foreground: {
      zIndex: 0,
    },
    image: {
      position: 'fixed',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      backgroundImage: 'url(https://source.unsplash.com/collection/' + collection.toString() + ')',
      backgroundRepeat: 'no-repeat',
      backgroundColor:
        theme.palette.type === 'light' ? theme.palette.grey[50] : theme.palette.grey[900],
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    },
  }))

  const styles = useStyles()

  return (
    <Box component="main" className={styles.root}>
      <CssBaseline />
      <Box className={styles.image} />
      <Box className={styles.foreground}>
        { props.children }
      </Box>
    </Box>
  )
}

SignInSide.propTypes = {
  unsplashCollections: PropTypes.arrayOf(PropTypes.number).isRequired,
}

export default SignInSide
