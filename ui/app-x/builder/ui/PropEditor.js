import React, { useState, useContext, useEffect } from "react"
import { useForm } from "react-hook-form"
import YAML from 'yaml'
import _ from 'lodash'
// material ui
import {
  Box,
  Container,
  Grid,
  ListItemIcon,
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
// utilities
import { lookup_icon_for_type, lookup_icon_for_input, lookup_title_for_input } from 'app-x/builder/ui/util_parse'
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
    select: {
      width: '100%',
      padding: theme.spacing(2, 0, 2, 2),
      display: 'flex',
      alignItems: 'center',
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

  // upgrade treeNode for the given treeData
  function updateRef(refValue) {
    const resultTree = _.cloneDeep(treeData)
    const lookupNode = tree_lookup(resultTree, selectedKey)
    lookupNode.data.__ref = refValue
    lookupNode.title = lookup_title_for_input(lookupNode.data.__ref, lookupNode.data)
    lookupNode.icon = lookup_icon_for_input(lookupNode.data)
    setTreeData(resultTree)
  }


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
          <TabPane tab="Properties" key="basic" className={styles.basicTab}>
          {
            (ref !== null)
            &&
            (
              <FormControl className={styles.formControl}>
                <TextField
                  name="ref"
                  label="Reference Name"
                  value={ref}
                  onChange={e => updateRef(e.target.value)}
                  />
              </FormControl>
            )
          }
          {
            (treeNode && treeNode.data && treeNode.data.type == 'js/primitive')
            &&
            (
              <Box>
                <FormControl className={styles.formControl}>
                  <TextField
                    name="type"
                    label="Type"
                    select={true}
                    value={treeNode.data.type}
                    onChange={e => console.log(e.target.value)}
                    >
                    <MenuItem value="js/primitive">
                      <ListItemIcon>
                        { lookup_icon_for_type('js/primitive') }
                      </ListItemIcon>
                      <Typography variant="inherit" noWrap={true}>
                        js/primitive
                      </Typography>
                    </MenuItem>
                    <MenuItem value="js/expression">
                      <ListItemIcon>
                        { lookup_icon_for_type('js/expression') }
                      </ListItemIcon>
                      <Typography variant="inherit" noWrap={true}>
                        js/expression
                      </Typography>
                    </MenuItem>
                  </TextField>
                </FormControl>
                <FormControl className={styles.formControl}>
                  <TextField
                    name="data"
                    label="Data"
                    value={data}
                    onChange={e => console.log(e.target.value)}
                    />
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
                    <MenuItem value="js/array">
                      <ListItemIcon>
                        { lookup_icon_for_type('js/array') }
                      </ListItemIcon>
                      <Typography variant="inherit" noWrap={true}>
                        js/array
                      </Typography>
                    </MenuItem>
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
                    <MenuItem value="js/object">
                      <ListItemIcon>
                        { lookup_icon_for_type('js/object') }
                      </ListItemIcon>
                      <Typography variant="inherit" noWrap={true}>
                        js/object
                      </Typography>
                    </MenuItem>
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
                    <MenuItem value="js/import">
                      <ListItemIcon>
                        { lookup_icon_for_type('js/import') }
                      </ListItemIcon>
                      <Typography variant="inherit" noWrap={true}>
                        js/import
                      </Typography>
                    </MenuItem>
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
                    <MenuItem value="js/primitive">
                      <ListItemIcon>
                        { lookup_icon_for_type('js/primitive') }
                      </ListItemIcon>
                      <Typography variant="inherit" noWrap={true}>
                        js/primitive
                      </Typography>
                    </MenuItem>
                    <MenuItem value="js/expression">
                      <ListItemIcon>
                        { lookup_icon_for_type('js/expression') }
                      </ListItemIcon>
                      <Typography variant="inherit" noWrap={true}>
                        js/expression
                      </Typography>
                    </MenuItem>
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
                    <MenuItem value="js/block">
                      <ListItemIcon>
                        { lookup_icon_for_type('js/block') }
                      </ListItemIcon>
                      <Typography variant="inherit" noWrap={true}>
                        js/block
                      </Typography>
                    </MenuItem>
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
                    <MenuItem value="js/function">
                      <ListItemIcon>
                        { lookup_icon_for_type('js/function') }
                      </ListItemIcon>
                      <Typography variant="inherit" noWrap={true}>
                        js/function
                      </Typography>
                    </MenuItem>
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
                    <MenuItem value="js/switch">
                      <ListItemIcon>
                        { lookup_icon_for_type('js/switch') }
                      </ListItemIcon>
                      <Typography variant="inherit" noWrap={true}>
                        js/switch
                      </Typography>
                    </MenuItem>
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
                    <MenuItem value="js/map">
                      <ListItemIcon>
                        { lookup_icon_for_type('js/map') }
                      </ListItemIcon>
                      <Typography variant="inherit" noWrap={true}>
                        js/map
                      </Typography>
                    </MenuItem>
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
                    <MenuItem value="js/reduce">
                      <ListItemIcon>
                        { lookup_icon_for_type('js/reduce') }
                      </ListItemIcon>
                      <Typography variant="inherit" noWrap={true}>
                        js/reduce
                      </Typography>
                    </MenuItem>
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
                    <MenuItem value="js/filter">
                      <ListItemIcon>
                        { lookup_icon_for_type('js/filter') }
                      </ListItemIcon>
                      <Typography variant="inherit" noWrap={true}>
                        js/filter
                      </Typography>
                    </MenuItem>
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
                    <MenuItem value="react/element">
                      <ListItemIcon>
                        { lookup_icon_for_type('react/element') }
                      </ListItemIcon>
                      <Typography variant="inherit" noWrap={true}>
                        react/element
                      </Typography>
                    </MenuItem>
                    <MenuItem value="react/html">
                      <ListItemIcon>
                        { lookup_icon_for_type('react/html') }
                      </ListItemIcon>
                      <Typography variant="inherit" noWrap={true}>
                        react/html
                      </Typography>
                    </MenuItem>
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
                    <MenuItem value="react/element">
                      <ListItemIcon>
                        { lookup_icon_for_type('react/element') }
                      </ListItemIcon>
                      <Typography variant="inherit" noWrap={true}>
                        react/element
                      </Typography>
                    </MenuItem>
                    <MenuItem value="react/html">
                      <ListItemIcon>
                        { lookup_icon_for_type('react/html') }
                      </ListItemIcon>
                      <Typography variant="inherit" noWrap={true}>
                        react/html
                      </Typography>
                    </MenuItem>
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
                    <MenuItem value="react/state">
                      <ListItemIcon>
                        { lookup_icon_for_type('react/state') }
                      </ListItemIcon>
                      <Typography variant="inherit" noWrap={true}>
                        react/state
                      </Typography>
                    </MenuItem>
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
                    <MenuItem value="react/effect">
                      <ListItemIcon>
                        { lookup_icon_for_type('react/effect') }
                      </ListItemIcon>
                      <Typography variant="inherit" noWrap={true}>
                        react/effect
                      </Typography>
                    </MenuItem>
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
                    <MenuItem value="mui/style">
                      <ListItemIcon>
                        { lookup_icon_for_type('mui/style') }
                      </ListItemIcon>
                      <Typography variant="inherit" noWrap={true}>
                        mui/style
                      </Typography>
                    </MenuItem>
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
                    <MenuItem value="appx/route">
                      <ListItemIcon>
                        { lookup_icon_for_type('appx/route') }
                      </ListItemIcon>
                      <Typography variant="inherit" noWrap={true}>
                        appx/route
                      </Typography>
                    </MenuItem>
                  </TextField>
                </FormControl>
              </Box>
            )
          }
          </TabPane>
          <TabPane tab="YAML" key="advanced" className={styles.editor}>
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
