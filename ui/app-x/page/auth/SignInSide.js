import React from 'react'
import { useState } from 'react'
import PropTypes from 'prop-types'
import { navigate } from 'app-x/router'

import {
  Avatar,
  Button,
  CssBaseline,
  TextField,
  Link,
  Paper,
  Box,
  Grid,
  Typography,
  makeStyles
} from '@material-ui/core'

import FacebookIcon from 'app-x/icon/Facebook'
import GoogleIcon from 'app-x/icon/Google'
import { login, me } from 'app-x/api'


const SignInSide = (props) => {

  function Copyright() {
    return (
      <Typography variant="body2" color="textSecondary" align="center">
        {'Copyright  '}
          { props.copyright }
          {'  ©  '}
          {new Date().getFullYear()}
      </Typography>
    );
  }

  const useStyles = makeStyles((theme) => ({
    root: {
      height: '100%',
    },
    image: {
      backgroundImage: 'url(https://source.unsplash.com/random)',
      backgroundRepeat: 'no-repeat',
      backgroundColor:
        theme.palette.type === 'light' ? theme.palette.grey[50] : theme.palette.grey[900],
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    },
    paper: {
      margin: theme.spacing(12, 4),
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    facebook: {
      backgroundColor: '#4267B2',
    },
    google: {
      backgroundColor: '#DB4437',
    },
    avatar: {
      margin: theme.spacing(1),
      backgroundColor: theme.palette.secondary.main,
    },
    line: {
      margin: theme.spacing(1),
    },
    error: {
      margin: theme.spacing(1),
      color: theme.palette.text.error,
    },
    button: {
      margin: theme.spacing(1),
    },
    form: {
      width: '100%', // Fix IE 11 issue.
      margin: theme.spacing(1),
    },
    grid: {
      margin: theme.spacing(2, 0, 2),
    },
    submit: {
      margin: theme.spacing(2, 0, 2),
    },
  }));

  const styles = useStyles()
  //const history = useHistory()
  //const { history } = props

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loginErr, setLoginErr] = useState("")
  const [displayErr, setDisplayErr] = useState(false)

  function handleSubmit(event) {
    event.preventDefault()
    login(
      props.app_name,
      username,
      password,
      res => {
        // TODO
        console.log(res)
        navigate(props.consoleUrl)
        me(props.app_name)
      },
      err => {
        // TODO
        setLoginErr(err.message)
        setDisplayErr(true)
      }
    )
  }

  return (
    <Grid container component="main" className={styles.root}>
      <CssBaseline />
      <Grid item xs={false} sm={4} md={7} lg={8} className={styles.image} />
      <Grid item xs={12} sm={8} md={5} lg={4} component={Paper} elevation={6} square>
        <div className={styles.paper}>
          <Avatar className={styles.avatar}>
            { props.titleIcon }
          </Avatar>
          <Typography component="h1" variant="h5" className={styles.line}>
            { props.title }
          </Typography>
          <Grid container spacing={2} className={styles.grid}>
              <Grid item xs={12}>
                <Button
                  color="primary"
                  className={styles.facebook}
                  fullWidth
                  startIcon={<FacebookIcon />}
                  onClick={handleSubmit}
                  size="large"
                  variant="contained"
                  >
                  Login with Facebook
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Button
                  color="primary"
                  className={styles.google}
                  fullWidth
                  startIcon={<GoogleIcon />}
                  onClick={handleSubmit}
                  size="large"
                  variant="contained"
                  >
                  Login with Google
                </Button>
              </Grid>
          </Grid>
          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="username"
              label="Login"
              name="username"
              autoComplete="username"
              value={username}
              onChange={e => { setUsername(e.target.value); setDisplayErr(false) }}
              autoFocus
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={e => { setPassword(e.target.value); setDisplayErr(false) }}
            />
            {
              displayErr ? (
                <Grid item xs={12}>
                  <Typography component="h1" variant="h5" className={styles.error}>
                    {loginErr}
                  </Typography>
                </Grid>
              ) : null
            }
            <Button
              type="submit"
              onClick={handleSubmit}
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              className={styles.submit}
            >
              Sign In
            </Button>
            <Box mt={5}>
              <Copyright />
            </Box>
          </form>
        </div>
      </Grid>
    </Grid>
  )
}

SignInSide.propTypes = {
  app_name: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  titleIcon: PropTypes.element.isRequired,
  copyright: PropTypes.string.isRequired,
  consoleUrl: PropTypes.string.isRequired,
}

export default SignInSide
