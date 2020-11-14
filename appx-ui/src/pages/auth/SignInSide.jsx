import React, { useState } from 'react';
//import { withRouter } from "react-router";
//import { useHistory } from "react-router-dom";
import { navigate } from 'hookrouter';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import FacebookIcon from 'src/icons/Facebook';
import GoogleIcon from 'src/icons/Google';
import { makeStyles } from '@material-ui/core/styles';
import { login } from 'src/api'

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

  function handleSubmit(event) {
    login(
      'appx',
      username,
      password,
      res => {
        // TODO
        console.log(res)
        //history.push("/console")
        navigate('/appx/console')
      },
      err => {
        // TODO
        console.log(err)
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
                  //onClick={handleSubmit}
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
                  //onClick={handleSubmit}
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
              onChange={e => setUsername(e.target.value)}
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
              onChange={e => setPassword(e.target.value)}
            />
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
