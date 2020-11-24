const React = lib.react
const  { useState } = lib.react
//import React, { useState } from 'react'
const { navigate } = lib.hookrouter
const {
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
} = lib['@material-ui/core']
const { LockOutlined : LockOutlinedIcon } = lib['@material-ui/icons']

import FacebookIcon from 'app-x/icons/Facebook'
import GoogleIcon from 'app-x/icons/Google'
import { login, get_user_info } from 'app-x/api'

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © '}
      <Link color="inherit" href="https://material-ui.com/">
        App-X.org
      </Link>{' '}
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


export default function SignInSide() {

  const classes = useStyles()
  //const history = useHistory()
  //const { history } = props

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loginErr, setLoginErr] = useState("")
  const [displayErr, setDisplayErr] = useState(false)

  function handleSubmit(event) {
    login(
      null,
      username,
      password,
      res => {
        // TODO
        console.log(res)
        navigate('/appbuilder/console')
        get_user_info(null)
      },
      err => {
        // TODO
        console.log(err.stack)
        setLoginErr(err.message)
        setDisplayErr(true)
      }
    )
    event.preventDefault()
  }

  return (
    <Grid container component="main" className={classes.root}>
      <CssBaseline />
      <Grid item xs={false} sm={4} md={7} lg={8} className={classes.image} />
      <Grid item xs={12} sm={8} md={5} lg={4} component={Paper} elevation={6} square>
        <div className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5" className={classes.line}>
            Sign in to App-X
          </Typography>
          <Grid container spacing={2} className={classes.grid}>
              <Grid item xs={12}>
                <Button
                  color="primary"
                  className={classes.facebook}
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
                  className={classes.google}
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
          <form className={classes.form} noValidate>
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
                  <Typography component="h1" variant="h5" className={classes.error}>
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
              className={classes.submit}
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
