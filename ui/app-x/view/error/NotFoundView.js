// const React = lib.react
import React from 'react'
// const { Box, Container, Typography, makeStyles } = lib['@material-ui/core']
import { Box, Container, Typography, makeStyles } from '@material-ui/core'

import Page from 'app-x/util/Page'

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.paper,
    // height: '100%',
    paddingBottom: theme.spacing(4),
    paddingTop: theme.spacing(4)
  },
  image: {
    marginTop: 50,
    display: 'inline-block',
    maxWidth: '100%',
    width: 560
  }
}))

const NotFoundView = () => {
  const classes = useStyles();

  return (
    <Box
      title="404"
      className={classes.root}
      display="flex"
      alignItems="center"
      justifyContent="center"
      height="100%"
      >
      <Container maxWidth="md">
        <Typography
          align="center"
          color="textPrimary"
          variant="h4"
        >
          404: The page you are looking for isn’t here
        </Typography>
        <Typography
          align="center"
          color="textPrimary"
          variant="subtitle1"
        >
          You either tried some shady route or you came here by mistake.
          Whichever it is, try using the navigation
        </Typography>
        <Box textAlign="center">
          <img
            alt="Under development"
            className={classes.image}
            src="/static/images/undraw_page_not_found_su7k.svg"
          />
        </Box>
      </Container>
    </Box>
  )
}

export default NotFoundView
