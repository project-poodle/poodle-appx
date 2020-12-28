import React, { useState, useContext, useEffect, useRef, useCallback, memo } from 'react'
import PropTypes from 'prop-types';
import YAML from 'yaml'
// import { default as parseCST } from 'yaml/parse-cst'
import yaml from 'js-yaml'
import _ from 'lodash'
import {
  Box,
  Typography,
  makeStyles,
} from '@material-ui/core'
// ant design
import {
  Layout,
  Tooltip,
  Button as AntButton,
} from 'antd'
const {
  Header,
  Footer,
  Content,
  Sider,
} = Layout
import {
  CloseOutlined,
  CheckOutlined,
} from '@ant-design/icons'

// utilities
import {
  parse_js,
  lookup_icon_for_type,
  lookup_icon_for_input,
  lookup_title_for_input,
  valid_import_names,
  valid_html_tags,
} from 'app-x/builder/ui/util_parse'
import {
  tree_traverse,
  tree_lookup,
  lookup_child_by_ref,
  gen_js,
} from 'app-x/builder/ui/util_tree'
// context provider
import SyntaxProvider from 'app-x/builder/ui/SyntaxProvider'
import ControlledEditor from 'app-x/builder/ui/ControlledEditor'
import Asterisk from 'app-x/icon/Asterisk'

// console.log(monaco)
// console.log(Editor)
// console.log(ControlledEditor)

// YAML.parseCST = parseCST
// console.log(YAML)

// Yaml Editor
const YamlEditor = props => {
  // context
  const {
    treeData,
    expandedKeys,
    setExpandedKeys,
    selectedKey,
    setSelectedKey,
    history,
    makeAction,
    updateAction,
    undo,
    redo,
  } = useContext(SyntaxProvider.Context)

  const [ treeNode,         setTreeNode       ] = useState(null)
  const [ yamlDirty,        setYamlDirty      ] = useState(false)
  const [ yamlMsg,          setYamlMsg        ] = useState('')
  const [ yamlError,        setYamlError      ] = useState(false)
  const [ yamlContent,      setYamlContent    ] = useState('')

  // make styles
  const styles = makeStyles((theme) => ({
    editor: {
      width: '100%',
      height: '100%',
    },
    yamlFooter: {
      margin: theme.spacing(0, 0),
      padding: theme.spacing(0, 0),
      backgroundColor: theme.palette.background.paper,
      // border
      border: 1,
      borderLeft: 0,
      borderBottom: 0,
      borderStyle: 'dotted',
      borderColor: theme.palette.divider,
    },
    yamlToolbar: {
      padding: theme.spacing(0, 2),
      backgroundColor: theme.palette.background.paper,
    },
    yamlMsg: {
      height: '100%',
      width: '100%',
      padding: theme.spacing(0, 2),
      backgroundColor: theme.palette.background.paper,
    },
    fab: {
      margin: theme.spacing(1),
    },
    asterisk: {
      padding: theme.spacing(1, 1, 1, 0),
      color: theme.palette.primary.main,
    }
  }))()

  // compute treeNode
  useEffect(() => {
    // set local treeNode
    const lookupNode = tree_lookup(treeData, selectedKey)
    setTreeNode(lookupNode)
  }, [treeData, selectedKey])

  useEffect(() => {
    // reset prop editor data
    reset_yaml_content()
  }, [treeNode])

  // reset yaml content
  function reset_yaml_content() {
    const tree_context = { topLevel: true }
    const { ref, data } = gen_js(tree_context, treeNode?.data?.type === '/' ? treeData : treeNode)
    // yaml data
    const yamlDoc = new YAML.Document()
    yamlDoc.contents = data
    // console.log(yamlDoc.toString())
    // reset editor value
    setYamlContent(yamlDoc.toString())
  }

  // submit yaml data
  function onYamlSubmit() {
    try {
      // console.log(yamlContent)
      const loaded = yaml.load(yamlContent)
      // console.log(loaded)
      // replace current tree node
      const resultTree = _.cloneDeep(treeData)
      const lookupNode = tree_lookup(resultTree, selectedKey)
      if (lookupNode) {
        const js_context = { topLevel: false }
        const parsed = parse_js(js_context, lookupNode.parentKey, null, loaded)

        if (treeNode?.data?.type === '/') {

          // replace the entire tree
          makeAction(
            `Full Replace`,
            parsed,
            js_context.expandedKeys,
            null,
          )

        } else {
          // preserve data.__ref
          parsed.data.__ref = lookupNode.data.__ref
          // check if parent is js/switch
          const lookupParent = tree_lookup(resultTree, lookupNode.parentKey)
          if (lookupParent?.data?.type === 'js/switch') {
            // if yes, preserve condition
            if (lookupNode?.data?.__ref !== 'default') {
              parsed.data.condition = lookupNode.data.condition
            }
          }
          lookupNode.key = parsed.key   // update node key
          lookupNode.data = parsed.data
          lookupNode.children = parsed.children
          lookupNode.title = lookup_title_for_input(lookupNode.data.__ref, parsed.data)
          lookupNode.icon = lookup_icon_for_input(parsed.data)
          // lookupNode.parentKey = lookupNode.parentKey // no need to change parentKey
          // console.log(lookupNode)
          makeAction(
            `Replace [${lookupNode.title}]`,
            resultTree,
            expandedKeys,
            lookupNode.key,   // update selected key
          )
          // if we are successful, reset changed flag
          setYamlDirty(false)
          setYamlError(false)
          setYamlMsg('')
        }
      }
    } catch (err) {
      // console.log(err)
      setYamlError(true)
      if (!!err.message) {
        setYamlMsg(String(err.message))
      } else {
        setYamlMsg(String(err))
      }
    }
  }

  // editor change
  const handleEditorChange = (ev, value) => {
    setYamlDirty(true)
    setYamlContent(value)
  }

  return (
    <Layout
      className={styles.editor}
      onScroll={e => e.stopPropagation()}
      >
      <Content>
        <ControlledEditor
          className={styles.editor}
          language="yaml"
          options={{
            readOnly: false,
            wordWrap: 'on',
            wrappingIndent: 'deepIndent',
            scrollBeyondLastLine: false,
            wrappingStrategy: 'advanced',
            minimap: {
              enabled: false
            }
          }}
          value={yamlContent}
          onChange={handleEditorChange}
          >
        </ControlledEditor>
      </Content>
      <Footer className={styles.yamlFooter}>
        <Layout>
          <Content>
            <Box display="flex" alignItems="center" justifyContent="left" className={styles.yamlMsg}>
              {
                !!yamlDirty
                &&
                (
                  <Asterisk className={styles.asterisk} />
                )
              }
              <Typography variant="body2" color={yamlError ? "error" : "textSecondary"}>
                {yamlMsg}
              </Typography>
            </Box>
          </Content>
          <Sider width={100} className={styles.yamlToolbar}>
            <Box display="flex" alignItems="center" justifyContent="center">
              <Tooltip
                title="reset"
                placement="top"
                >
                <AntButton
                  size="small"
                  color="secondary"
                  type="default"
                  className={styles.fab}
                  value="reset"
                  icon={<CloseOutlined />}
                  shape="circle"
                  onClick={e => {
                    // reset prop editor data
                    reset_yaml_content()
                    setYamlDirty(false)
                    setYamlError(false)
                    setYamlMsg('')
                  }}
                  >
                </AntButton>
              </Tooltip>
              <Tooltip
                title="update"
                placement="top"
                >
                <AntButton
                  size="small"
                  color="secondary"
                  type="default"
                  className={styles.fab}
                  value="update"
                  icon={<CheckOutlined />}
                  shape="circle"
                  onClick={e => {
                    // setYamlSubmitTimer(new Date())
                    onYamlSubmit()
                  }}
                  >
                </AntButton>
              </Tooltip>
            </Box>
          </Sider>
        </Layout>
      </Footer>
    </Layout>
  )
}

export default YamlEditor
