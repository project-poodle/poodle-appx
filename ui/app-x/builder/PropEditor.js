import React from "react"
import { useForm } from "react-hook-form"
import { Box, Container, Grid, makeStyles } from '@material-ui/core'

const PropEditor = (props) => {
  // make styles
  const styles = makeStyles((theme) => ({
    box: {
      minHeight: 200,
      // maxHeight: 300
      backgroundColor: theme.palette.background.paper,
    }
  }))()

  const { register, handleSubmit, watch, errors } = useForm()
  return (
    <Box className={styles.box}>
    </Box>
  )
}

export default PropEditor
