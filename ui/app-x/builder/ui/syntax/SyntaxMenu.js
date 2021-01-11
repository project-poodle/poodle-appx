import React, { useState, useEffect, useContext } from 'react'
import ReactDOM from 'react-dom'
import ReactDOMServer from 'react-dom/server'
import PropTypes from 'prop-types'
import _ from 'lodash'
import {
  Box,
  Button,
  IconButton,
  Fab,
  Menu,
  MenuItem,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  makeStyles
} from '@material-ui/core'
import {
  DeleteOutlineOutlined,
} from '@material-ui/icons'
import { default as NestedMenuItem } from 'material-ui-nested-menu-item'
import {
  Layout,
  Tree,
  Tabs,
  Radio,
  Button as AntButton,
} from 'antd'
const { Header, Footer, Sider, Content } = Layout
const {
  TreeNode,
  DirectoryTree,
} = Tree
const { TabPane } = Tabs;
import {
  DeleteOutlined,
  Icon,
} from '@ant-design/icons'
import { v4 as uuidv4 } from 'uuid'
import { useForm, Controller } from "react-hook-form";
import { parse, parseExpression } from "@babel/parser"

import * as api from 'app-x/api'
import ReactIcon from 'app-x/icon/React'
import {
  lookup_icon_for_type,
} from 'app-x/builder/ui/syntax/util_generate'
import {
  tree_traverse,
  tree_lookup,
  lookup_child_by_ref
} from 'app-x/builder/ui/syntax/util_parse'
import {
  lookup_classes,
  lookup_groups,
  lookup_types,
  lookup_types_by_class,
  lookup_classes_by_type,
  lookup_types_by_group,
  lookup_group_by_type,
  lookup_changeable_types,
  lookup_type_by_data,
} from 'app-x/builder/ui/syntax/util_base'
import NavProvider from 'app-x/builder/ui/NavProvider'
import SyntaxProvider from 'app-x/builder/ui/syntax/SyntaxProvider'

// make context menu
const SyntaxMenu = (props) => {

  // styles
  const styles = makeStyles((theme) => ({
    menuItem: {
      minWidth: 216,
    },
    nestedMenuItem: {
      padding: 0,
    },
  }))()

  // nav context
  const {
    navDeployment,
    navComponent,
    navRoute,
    navSelected,
  } = useContext(NavProvider.Context)

  // context
  const {
    treeData,
    expandedKeys,
    setExpandedKeys,
    selectedKey,
    setSelectedKey,
  } = useContext(SyntaxProvider.Context)

  // states and effects
  const [ parentNode,   setParentNode   ] = useState(null)
  const [ parentSpec,   setParentSpec   ] = useState(null)

  // parentNode
  useEffect(() => {
    // lookup node
    const lookupNode = tree_lookup(treeData, selectedKey)
    setParentNode(lookupNode)
    // console.log(lookupNode)
    if (!!lookupNode) {
      const type_spec = globalThis.appx.SPEC.types[lookupNode.data._type] || null
      setParentSpec(type_spec)
    }
  }, [selectedKey])

  // create menu items
  function create_menu_items(spec) {
      if (!spec._childNode?.class) {
        return
      }
      const childNodeSpec = spec._childNode
      // console.log(`childNodeSpec.class`, childNodeSpec.class)
      const valid_types = lookup_types_by_class(childNodeSpec.class)
      // console.log(`valid_types`, valid_types)
      const groups = lookup_groups()
      return groups.map(group => {
        return lookup_types_by_group(group)
          .map(group_type => {
            if (valid_types.includes(group_type)) {
              // console.log(`group_type [${group}] ${group_type}`)
              return (
                <MenuItem
                  dense={true}
                  className={styles.menuItem}
                  key={group_type}
                  onClick={
                    () => props.addMenuClicked({
                      nodeRef: spec.name,
                      nodeKey: parentNode.key,
                      nodeType: group_type,
                    })
                  }
                  >
                  <ListItemIcon>
                    { lookup_icon_for_type(group_type) }
                  </ListItemIcon>
                  <ListItemText primary={`Add ${group_type}`} />
                </MenuItem>
              )
            }
          })
          .filter(item => !!item)
          .concat(`divider/${group}`)
          // remove first divider item
          .filter((item, index, array) => !((index === 0) && (typeof item === 'string') && (item.startsWith('divider'))))
      })
      .flat(2)
      // remove last divider item
      .filter((item, index, array) => !((index === array.length - 1) && (typeof item === 'string') && (item.startsWith('divider'))))
      .map(item => {
        // console.log(`item`, item)
        return (typeof item === 'string' && item.startsWith('divider')) ? <Divider key={item} /> : item
      })
  }

  return (
    <Menu
      keepMounted={true}
      getContentAnchorEl={null}
      anchorEl={props.contextAnchorEl}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      open={Boolean(props.contextAnchorEl)}
      onClose={ e => props.setContextAnchorEl(null) }
      >
      {
        (
          !!parentNode
          && !!parentSpec
        )
        &&
        (
          <Box>
            {
              parentSpec
                .children
                ?.filter(spec => spec.name !== '*' && !spec.array && !!spec._childNode)
                .map(spec => {
                  const exists = lookup_child_by_ref(parentNode, spec.name)
                  if (exists) {
                    return null
                  }
                  return (
                    <NestedMenuItem
                      className={styles.nestedMenuItem}
                      key={spec.name}
                      label={(
                        <List className={styles.nestedMenuItem}>
                          <ListItem
                            dense={true}
                            className={styles.menuItem}
                            >
                            <ListItemIcon>
                              { lookup_icon_for_type('js/object') }
                            </ListItemIcon>
                            <ListItemText primary={`[ ${spec.name} ]`} />
                          </ListItem>
                        </List>
                      )}
                      parentMenuOpen={!!props.contextAnchorEl}
                      >
                      {
                        create_menu_items(spec)
                      }
                    </NestedMenuItem>
                  )
                })
                .concat('divider/specProps')
                // remove last divider item
                .filter((item, index, array) => !((index === 0) && (typeof item === 'string') && (item.startsWith('divider'))))
                .map(item => {
                  // console.log(`item`, item)
                  return (typeof item === 'string' && item.startsWith('divider')) ? <Divider key={item} /> : item
                })
            }
          </Box>
        )
      }
      {
        (
          !!parentNode
          && !!parentSpec
        )
        &&
        (
          <Box>
            {
              parentSpec
                .children
                ?.filter(spec => (spec.name === '*' || !!spec.array) && !!spec._childNode)
                .map(spec => (
                  create_menu_items(spec)
                ))
                .flat(2)
                .filter((item, index, array) => !((index === array.length - 1) && (typeof item === 'string') && (item.startsWith('divider'))))
                .map(item => {
                  // console.log(`item`, item)
                  return (typeof item === 'string' && item.startsWith('divider')) ? <Divider key={item} /> : item
                })
            }
          </Box>
        )
      }
      {
        // delete menu
        !!parentNode
        && !!parentSpec
        &&
        !(
          (parentNode?.key === '/')
          ||
          (
            (
              (
                navSelected.type === 'ui_component'
                && navComponent.ui_component_type === 'react/component'
              )
              ||
              (
                navSelected.type === 'ui_route'
              )
            )
            && parentNode?.data._ref === 'element'
            &&
            (
              parentNode?.parentKey === '/'
              || parentNode?.parentKey === null
            )
          )
          ||
          (
            navSelected.type === 'ui_component'
            && navComponent.ui_component_type=== 'react/provider'
            && parentNode?.data._ref === 'provider'
            &&
            (
              parentNode?.parentKey === '/'
              || parentNode?.parentKey === null
            )
          )
        )
        &&
        (
          (() => {
            return (
              <Box>
                <Divider key='divider/delete' />
                <MenuItem
                  dense={true}
                  className={styles.menuItem}
                  key='delete'
                  onClick={
                    () => props.deleteMenuClicked({
                      nodeKey: parentNode.key,
                    })
                  }
                  >
                  <ListItemIcon>
                    <DeleteOutlined />
                  </ListItemIcon>
                  <ListItemText primary="Delete" />
                </MenuItem>
              </Box>
            )
          })()
        )
      }
    </Menu>
  )
}

export default SyntaxMenu
