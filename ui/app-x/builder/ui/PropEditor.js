import React, { useContext } from "react"
import { useForm } from "react-hook-form"
import YAML from 'yaml'
import { Box, Container, Grid, makeStyles } from '@material-ui/core'
import EditorProvider from 'app-x/builder/ui/EditorProvider'
import { tree_traverse, tree_lookup, gen_js } from 'app-x/builder/ui/util_tree'

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
  const parentNode = treeNode ? tree_lookup(treeData, treeNode.parentKey) : null
  // console.log(treeNode)
  // console.log(parentNode)

  const tree_context = {}
  const generated = gen_js(tree_context, treeNode)

  const yamlDoc = new YAML.Document()
  yamlDoc.contents = generated
  // console.log(yamlDoc.toString())

  const { register, handleSubmit, watch, errors } = useForm()
  return (
    <Box className={styles.box}>
      <pre>
      { yamlDoc.toString() }
      </pre>
    </Box>
  )
}

export default PropEditor
