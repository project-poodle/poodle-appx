const React = module.react
const { A } = module.hookrouter
const  { Avatar, Typography } = module['@material-ui/core']
const { ViewQuiltRounded : ViewQuiltRoundedIcon } = module['@material-ui/icons']
//import clsx from 'clsx'
// import PropTypes from 'prop-types'
const { Box } = module['@material-ui/core']
const { AppBar, Toolbar, makeStyles } = module['@material-ui/core']

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

const Header = ({ ...rest }) => {
  const classes = useStyles()

  return (
    <AppBar
      className={classes.root}
      elevation={0}
      {...rest}
    >
    <Toolbar className={classes.toolbar}>
    <a href="/" className={classes.inline}>
    <Avatar className={classes.avatar}>
      <ViewQuiltRoundedIcon/>
    </Avatar>
    <Typography variant="h4" display="inline" color="secondary" noWrap className={classes.text}>
      App-X
    </Typography>
    </a>
    </Toolbar>
    </AppBar>
  );
};

export default Header;
