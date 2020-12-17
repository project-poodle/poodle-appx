import React, { useState, useContext, useEffect } from "react"
import { useForm } from "react-hook-form"
import YAML from 'yaml'
// material ui
import {
  Box,
  Container,
  Grid,
  Typography,
  FormControl,
  InputLabel,
  Select,
  Input,
  TextField,
  MenuItem,
  makeStyles
} from '@material-ui/core'
// ant design
import {
  Tabs,
} from 'antd'
const { TabPane } = Tabs;
// monaco editor
import { default as Editor } from '@monaco-editor/react'
// context provider
import EditorProvider from 'app-x/builder/ui/EditorProvider'
import { tree_traverse, tree_lookup, gen_js } from 'app-x/builder/ui/util_tree'

const PropEditor = (props) => {
  // make styles
  const styles = makeStyles((theme) => ({
    root: {
      // minHeight: 200,
      width: '100%',
      height: '100%',
      // maxHeight: 300
      backgroundColor: theme.palette.background.paper,
    },
    formControl: {
      width: '100%',
      // margin: theme.spacing(1),
      padding: theme.spacing(2, 0, 2, 2),
    },
    //label: {
    //  width: '100%',
    //  padding: theme.spacing(2, 2, 0),
    //},
    //tabHeader: {
    //  padding: theme.spacing(0, 0),
    //  margin: theme.spacing(0, 0),
    //},
    editor: {
      width: '100%',
      height: '100%',
    },
    basicTab: {
      width: '100%',
      height: '100%',
      overflow: 'scroll',
    },
  }))()

  // context
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

  // prop editor data
  const tree_context = { topLevel: true }
  const { ref, data } = gen_js(tree_context, treeNode)

  const yamlDoc = new YAML.Document()
  yamlDoc.contents = data
  // console.log(yamlDoc.toString())

  console.log(Tabs)
  console.log(TabPane)

  const { register, handleSubmit, watch, errors } = useForm()
  return (
    <Box className={styles.root}>
    {
      (!treeNode)
      &&
      (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          className={styles.root}
          >
          <Typography variant="body2">
            Select an element to edit
          </Typography>
        </Box>
      )
    }
    {
      (treeNode)
      &&
      (
        <Tabs defaultActiveKey="basic" className={styles.editor} tabPosition="right" size="small">
          <TabPane tab="Basic" key="basic" className={styles.basicTab}>
          {
            (ref)
            &&
            (
              <FormControl className={styles.formControl}>
                <TextField name="ref" label="Reference Name" value={ref} />
              </FormControl>
            )
          }
          {
            (treeNode && treeNode.data && treeNode.data.type == 'js/primitive')
            &&
            (
              <Box>
                <FormControl className={styles.formControl}>
                  <TextField name="type" label="Type" select={true} value={treeNode.data.type}>
                    <MenuItem value="js/primitive">js/primitive</MenuItem>
                    <MenuItem value="js/expression">js/expression</MenuItem>
                  </TextField>
                </FormControl>
                <FormControl className={styles.formControl}>
                  <TextField name="data" label="Data" value={data} />
                </FormControl>
              </Box>
            )
          }
          {
            (treeNode && treeNode.data && treeNode.data.type == 'js/array')
            &&
            (
              <Box>
                <FormControl className={styles.formControl}>
                  <TextField name="type" label="Type" select={true} value={treeNode.data.type}>
                    <MenuItem value="js/array">js/array</MenuItem>
                  </TextField>
                </FormControl>
              </Box>
            )
          }
          {
            (treeNode && treeNode.data && treeNode.data.type == 'js/object')
            &&
            (
              <Box>
                <FormControl className={styles.formControl}>
                  <TextField name="type" label="Type" select={true} value={treeNode.data.type}>
                    <MenuItem value="js/object">js/object</MenuItem>
                  </TextField>
                </FormControl>
              </Box>
            )
          }
          {
            (treeNode && treeNode.data && treeNode.data.type == 'js/import')
            &&
            (
              <Box>
                <FormControl className={styles.formControl}>
                  <TextField name="type" label="Type" select={true} value={treeNode.data.type}>
                    <MenuItem value="js/import">js/import</MenuItem>
                  </TextField>
                </FormControl>
                <FormControl className={styles.formControl}>
                  <TextField name="name" label="Name" value={data.name} />
                </FormControl>
              </Box>
            )
          }
          {
            (treeNode && treeNode.data && treeNode.data.type == 'js/expression')
            &&
            (
              <Box>
                <FormControl className={styles.formControl}>
                  <TextField name="type" label="Type" select={true} value={treeNode.data.type}>
                    <MenuItem value="js/primitive">js/primitive</MenuItem>
                    <MenuItem value="js/expression">js/expression</MenuItem>
                  </TextField>
                </FormControl>
                <FormControl className={styles.formControl}>
                  <TextField name="data" label="Expression" multiline={true} value={data.data} />
                </FormControl>
              </Box>
            )
          }
          {
            (treeNode && treeNode.data && treeNode.data.type == 'js/block')
            &&
            (
              <Box>
                <FormControl className={styles.formControl}>
                  <TextField name="type" label="Type" select={true} value={treeNode.data.type}>
                    <MenuItem value="js/block">js/expression</MenuItem>
                  </TextField>
                </FormControl>
                <FormControl className={styles.formControl}>
                  <TextField name="data" label="Code Block" multiline={true} value={data.data} />
                </FormControl>
              </Box>
            )
          }
          {
            (treeNode && treeNode.data && treeNode.data.type == 'js/function')
            &&
            (
              <Box>
                <FormControl className={styles.formControl}>
                  <TextField name="type" label="Type" select={true} value={treeNode.data.type}>
                    <MenuItem value="js/function">js/primitive</MenuItem>
                  </TextField>
                </FormControl>
                <FormControl className={styles.formControl}>
                  <TextField name="params" label="Parameters" value={data.params} />
                </FormControl>
                <FormControl className={styles.formControl}>
                  <TextField name="body" label="Body" multiline={true} value={data.body} />
                </FormControl>
              </Box>
            )
          }
          {
            (treeNode && treeNode.data && treeNode.data.type == 'js/switch')
            &&
            (
              <Box>
                <FormControl className={styles.formControl}>
                  <TextField name="type" label="Type" select={true} value={treeNode.data.type}>
                    <MenuItem value="js/switch">js/switch</MenuItem>
                  </TextField>
                </FormControl>
              </Box>
            )
          }
          {
            (treeNode && treeNode.data && treeNode.data.type == 'js/map')
            &&
            (
              <Box>
                <FormControl className={styles.formControl}>
                  <TextField name="type" label="Type" select={true} value={treeNode.data.type}>
                    <MenuItem value="js/map">js/map</MenuItem>
                  </TextField>
                </FormControl>
              </Box>
            )
          }
          {
            (treeNode && treeNode.data && treeNode.data.type == 'js/reduce')
            &&
            (
              <Box>
                <FormControl className={styles.formControl}>
                  <TextField name="type" label="Type" select={true} value={treeNode.data.type}>
                    <MenuItem value="js/reduce">js/reduce</MenuItem>
                  </TextField>
                </FormControl>
                <FormControl className={styles.formControl}>
                  <TextField name="reducer" label="Reducer" multiline={true} value={data.reducer} />
                </FormControl>
              </Box>
            )
          }
          {
            (treeNode && treeNode.data && treeNode.data.type == 'js/filter')
            &&
            (
              <Box>
                <FormControl className={styles.formControl}>
                  <TextField name="type" label="Type" select={true} value={treeNode.data.type}>
                    <MenuItem value="js/filter">js/filter</MenuItem>
                  </TextField>
                </FormControl>
                <FormControl className={styles.formControl}>
                  <TextField name="filter" label="Filter" multiline={true} value={data.filter} />
                </FormControl>
              </Box>
            )
          }
          {
            (treeNode && treeNode.data && treeNode.data.type == 'react/element')
            &&
            (
              <Box>
                <FormControl className={styles.formControl}>
                  <TextField name="type" label="Type" select={true} value={treeNode.data.type}>
                    <MenuItem value="react/element">react/element</MenuItem>
                    <MenuItem value="react/html">react/html</MenuItem>
                  </TextField>
                </FormControl>
                <FormControl className={styles.formControl}>
                  <TextField name="name" label="Name" value={data.name} />
                </FormControl>
              </Box>
            )
          }
          {
            (treeNode && treeNode.data && treeNode.data.type == 'react/html')
            &&
            (
              <Box>
                <FormControl className={styles.formControl}>
                  <TextField name="type" label="Type" select={true} value={treeNode.data.type}>
                    <MenuItem value="react/element">react/element</MenuItem>
                    <MenuItem value="react/html">react/html</MenuItem>
                  </TextField>
                </FormControl>
                <FormControl className={styles.formControl}>
                  <TextField name="name" label="Name" value={data.name} />
                </FormControl>
              </Box>
            )
          }
          {
            (treeNode && treeNode.data && treeNode.data.type == 'react/state')
            &&
            (
              <Box>
                <FormControl className={styles.formControl}>
                  <TextField name="type" label="Type" select={true} value={treeNode.data.type}>
                    <MenuItem value="react/state">react/state</MenuItem>
                  </TextField>
                </FormControl>
                <FormControl className={styles.formControl}>
                  <TextField name="name" label="Name" value={data.name} />
                </FormControl>
                <FormControl className={styles.formControl}>
                  <TextField name="setter" label="Setter" value={data.setter} />
                </FormControl>
                <FormControl className={styles.formControl}>
                  <TextField name="init" label="Init Value" multiline={true} value={data.init} />
                </FormControl>
              </Box>
            )
          }
          {
            (treeNode && treeNode.data && treeNode.data.type == 'react/effect')
            &&
            (
              <Box>
                <FormControl className={styles.formControl}>
                  <TextField name="type" label="Type" select={true} value={treeNode.data.type}>
                    <MenuItem value="react/effect">react/effect</MenuItem>
                  </TextField>
                </FormControl>
                <FormControl className={styles.formControl}>
                  <TextField name="data" label="Effect" multiline={true} value={data.data} />
                </FormControl>
              </Box>
            )
          }
          {
            (treeNode && treeNode.data && treeNode.data.type == 'mui/style')
            &&
            (
              <Box>
                <FormControl className={styles.formControl}>
                  <TextField name="type" label="Type" select={true} value={treeNode.data.type}>
                    <MenuItem value="mui/style">mui/style</MenuItem>
                  </TextField>
                </FormControl>
              </Box>
            )
          }
          {
            (treeNode && treeNode.data && treeNode.data.type == 'appx/route')
            &&
            (
              <Box>
                <FormControl className={styles.formControl}>
                  <TextField name="type" label="Type" select={true} value={treeNode.data.type}>
                    <MenuItem value="appx/route">appx/route</MenuItem>
                  </TextField>
                </FormControl>
              </Box>
            )
          }
          </TabPane>
          <TabPane tab="Advanced" key="advanced" className={styles.editor}>
            <Box
              className={styles.editor}
              onScroll={e => e.stopPropagation()}
              >
              <Editor
                className={styles.editor}
                language="yaml"
                options={{
                  wordWrap: 'on',
                  wrappingIndent: 'deepIndent',
                  scrollBeyondLastLine: false,
                  wrappingStrategy: 'advanced',
                  minimap: {
                    enabled: false
                  }
                }}
                value={yamlDoc.toString()}
                >
              </Editor>
            </Box>
          </TabPane>
        </Tabs>
      )
    }
    </Box>
  )
}

export default PropEditor
