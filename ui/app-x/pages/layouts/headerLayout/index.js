const React = lib.react
//import { Outlet } from 'react-router-dom';
const { makeStyles } = lib['@material-ui/core']

const PropTypes = lib['prop-types']
import Header from '/app-x/pages/layouts/headerLayout/Header';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.default,
    display: 'flex',
    height: '100%',
    overflow: 'hidden',
    width: '100%'
  },
  wrapper: {
    display: 'flex',
    flex: '1 1 auto',
    overflow: 'hidden',
    paddingTop: 64
  },
  contentContainer: {
    display: 'flex',
    flex: '1 1 auto',
    overflow: 'hidden'
  },
  content: {
    flex: '1 1 auto',
    height: '100%',
    overflow: 'auto'
  }
}));

const HeaderLayout = (props) => {
  const classes = useStyles();
  const { children } = props

  return (
    <div className={classes.root}>
      <Header />
      <div className={classes.wrapper}>
        <div className={classes.contentContainer}>
          <div className={classes.content}>
            { children }
          </div>
        </div>
      </div>
    </div>
  )
}

HeaderLayout.propTypes = {
  children: PropTypes.element.isRequired
}

export default HeaderLayout;
