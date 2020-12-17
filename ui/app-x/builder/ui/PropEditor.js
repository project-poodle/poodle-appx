import React, { useContext } from "react"
import { useForm } from "react-hook-form"
import { Box, Container, Grid, makeStyles } from '@material-ui/core'
import EditorProvider from 'app-x/builder/ui/EditorProvider'
import { tree_traverse, tree_lookup } from 'app-x/builder/ui/util_tree'

const PropEditor = (props) => {
  // make styles
  const styles = makeStyles((theme) => ({
    box: {
      minHeight: 200,
      height: '100%',
      // maxHeight: 300
      backgroundColor: theme.palette.background.paper,
    }
  }))()

  const {
    treeData,
    setTreeData,
    expandedKeys,
    setExpandedKeys,
    selectedKey,
    setSelectedKey
  } = useContext(EditorProvider.Context)

  const treeNode = tree_lookup(treeData, selectedKey)
  //console.log(treeData)
  //console.log(treeNode)

  const { register, handleSubmit, watch, errors } = useForm()
  return (
    <Box className={styles.box}>
      <pre>
      { JSON.stringify(treeNode, null, 4) }
      </pre>
    </Box>
  )
}

export default PropEditor
