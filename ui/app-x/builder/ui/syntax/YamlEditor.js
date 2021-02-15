import React, { useState, useContext, useEffect, useRef, useCallback, memo } from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types';
import YAML from 'yaml'
// import { default as parseCST } from 'yaml/parse-cst'
import yaml from 'js-yaml'
import _ from 'lodash'
import {
  Box,
  Typography,
  Tooltip,
  makeStyles,
  useTheme,
} from '@material-ui/core'
// ant design
import {
  Layout,
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
  deepCompareMemorize,
} from 'app-x/builder/ui/syntax/util_base'
import {
  generate_tree_node,
  lookup_icon_for_type,
  lookup_icon_for_input,
  lookup_title_for_input,
} from 'app-x/builder/ui/syntax/util_generate'
import {
  tree_traverse,
  tree_lookup,
  parse_tree_node,
} from 'app-x/builder/ui/syntax/util_parse'
// context provider
import SyntaxProvider from 'app-x/builder/ui/syntax/SyntaxProvider'
import ControlledEditor from 'app-x/builder/component/ControlledEditor'
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
    propYamlDirty,
    setPropYamlDirty,
    history,
    makeDesignAction,
    updateDesignAction,
    undo,
    redo,
  } = useContext(SyntaxProvider.Context)

  const [ treeNode,         setTreeNode       ] = useState(null)
  const [ yamlMsg,          setYamlMsg        ] = useState('')
  const [ yamlError,        setYamlError      ] = useState(false)
  const [ yamlContent,      setYamlContent    ] = useState('')

  // theme
  const theme = useTheme()
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
    const { ref, data } = parse_tree_node(tree_context, treeNode?.data?._type === '/' ? treeData : treeNode)
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
      if (!!lookupNode) {
        const js_context = { topLevel: treeNode?.data?._type === '/' }
        const parsed = generate_tree_node(
          js_context,
          {
            ref: null,
            parentKey: lookupNode.parentKey,
          },
          loaded
        )

        // console.log(`parsed`, parsed)

        if (treeNode?.data?._type === '/') {

          // replace the entire tree
          makeDesignAction(
            `Full Replace`,
            parsed,
            js_context.expandedKeys,
            '/',
          )

        } else {
          // preserve data._ref, data._array, etc.
          parsed.data._ref = lookupNode.data._ref
          parsed.data._array = lookupNode.data._array
          // the following can include condition for js/condition
          Object.keys(lookupNode.data).map(key => {
            if (! (key in parsed.data)) {
              parsed.data[key] = lookupNode.data[key]
            }
          })
          // check if parent is js/condition
          // const lookupParent = tree_lookup(resultTree, lookupNode.parentKey)
          // if (lookupParent?.data?._type === 'js/condition') {
          //   // if yes, preserve condition
          //   if (lookupNode?.data?._ref !== 'default') {
          //     parsed.data.condition = lookupNode.data.condition
          //   }
          // }
          lookupNode.key = parsed.key   // update node key
          lookupNode.data = parsed.data
          lookupNode.children = parsed.children
          lookupNode.title = lookup_title_for_input(lookupNode.data._ref, parsed.data)
          lookupNode.icon = lookup_icon_for_input(parsed.data)
          // lookupNode.parentKey = lookupNode.parentKey // no need to change parentKey
          const newExpandedKeys = _.cloneDeep(expandedKeys)
          newExpandedKeys.push(...js_context.expandedKeys)
          // console.log(lookupNode)
          makeDesignAction(
            `Replace [${lookupNode.title}]`,
            resultTree,
            newExpandedKeys,
            lookupNode.key,   // update selected key
          )
        }
        // if we are successful, reset changed flag
        setPropYamlDirty(false)
        setYamlError(false)
        setYamlMsg('')
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

  /*
  const contentRef = React.createRef()
  const [ maxHeight, setMaxHeight ] = useState(150)
  // resize listener
  useEffect(() => {
    if (!!contentRef.current) {
      // closure on ref
      const ref = contentRef.current
      function resizeYamlEditor() {
        const node = ReactDOM.findDOMNode(ref)
        // console.log(node, node.offsetWidth, node.offsetHeight)
        setMaxHeight(node.offsetHeight)
      }
      // resize now
      setTimeout(() => {
        resizeYamlEditor()
      }, 500)
      // event listener
      window.addEventListener("resize", event => {
        // console.log(event)
        // console.log(ref)
        resizeYamlEditor()
      })
    }
  }, [contentRef.current])
  */
  // editor change
  const handleEditorChange = (ev, value) => {
    setPropYamlDirty(true)
    setYamlContent(value)
  }

  /*
  const MemorizedEditor = React.useMemo(() => () => {
    // theme
    const theme = useTheme()
    return (
    )
  }, [yamlContent].map(deepCompareMemorize))

  const MemorizedFooter = React.useMemo(() => () => {
    // theme
    const theme = useTheme()
    // make styles
    const styles = makeStyles((theme) => ({
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
    }))()

    return (
      <Layout>
        <Content>
          <Box display="flex" alignItems="center" justifyContent="left" className={styles.yamlMsg}>
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
                  setPropYamlDirty(false)
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
    )
  },
  [
    yamlMsg,
    yamlError,
    reset_yaml_content,
    setPropYamlDirty,
    setYamlError,
    setYamlMsg,
    onYamlSubmit
  ].map(deepCompareMemorize))
  */

  return (
    <Layout
      className={styles.editor}
      onScroll={e => e.stopPropagation()}
      >
      <Content
        >
        <Box
          // ref={contentRef}
          className={styles.editor}
          >
          <ControlledEditor
            className={styles.editor}
            height='100%'
            language="yaml"
            theme={theme?.palette.type === 'dark' ? 'vs-dark' : 'vs'}
            options={{
              readOnly: false,
              wordWrap: 'on',
              wrappingIndent: 'deepIndent',
              scrollBeyondLastLine: false,
              wrappingStrategy: 'advanced',
              lineNumbersMinChars: 0,
              glyphMargin: true,
              // lineDecorationsWidth: 4,
              minimap: {
                enabled: false
              },
              // layoutInfo: {
              //  glyphMarginWidth: 2,
              //  glyphMarginLeft: 2,
              //},
            }}
            value={yamlContent}
            onChange={handleEditorChange}
            >
          </ControlledEditor>
        </Box>
      </Content>
      <Footer className={styles.yamlFooter}>
        <Layout>
          <Content>
            <Box display="flex" alignItems="center" justifyContent="left" className={styles.yamlMsg}>
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
                    setPropYamlDirty(false)
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
