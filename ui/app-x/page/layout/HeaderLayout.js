import React from 'react'
import { makeStyles } from '@material-ui/core'
import PropTypes from 'prop-types'

const HeaderLayout = (props) => {

  const useStyles = makeStyles((theme) => ({
    root: {
      backgroundColor: theme.palette.background.dark,
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

  const styles = useStyles();

  const { header, children } = props

  return (
    <div className={styles.root}>
      { header }
      <div className={styles.wrapper}>
        <div className={styles.contentContainer}>
          <div className={styles.content}>
            { children }
          </div>
        </div>
      </div>
    </div>
  )
}

HeaderLayout.propTypes = {
  header: PropTypes.element.isRequired,
  children: PropTypes.element.isRequired
}

export default HeaderLayout;
