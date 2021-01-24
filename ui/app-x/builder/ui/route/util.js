import React from 'react'

////////////////////////////////////////////////////////////////////////////////
// utilities

import {
  ContainerOutlined,
  ProfileOutlined,
  FileOutlined,
  FolderOutlined,
  FolderOpenOutlined,
  HomeOutlined,
} from '@ant-design/icons'
import ReactIcon from 'app-x/icon/React'
import Route from 'app-x/icon/Route'

////////////////////////////////////////////////////////////////////////////////

const PATH_SEPARATOR = '*'
const ROOT_KEY = '/'

////////////////////////////////////////////////////////////////////////////////
// tree traverse method
const tree_traverse = (data, key, callback) => {
  for (let i = 0; i < data.length; i++) {
    if (data[i].key === key) {
      return callback(data[i], i, data)
    }
    if (data[i].children) {
      tree_traverse(data[i].children, key, callback)
    }
  }
}

////////////////////////////////////////////////////////////////////////////////
// lookup method
function tree_lookup(data, key) {

  if (!data) {
    return null
  }

  for (let i = 0; i < data.length; i++) {
    // console.log(data[i].key, key)
    if (data[i].key === key) {
      return data[i]
    }
    if (data[i].children && data[i].children.length) {
      const result = tree_lookup(data[i].children, key)
      if (result !== null) {
        return result
      }
    }
  }
  return null
}

// lookup default spec
function default_route_spec() {

  return {
    styles: {
      type: 'mui/style',
      root: {
        width: '100%',
        height: '100%',
        position: 'absolute',
      }
    },
    element: {
      type: 'react/element',
      name: '@material-ui/core.Box',
      props: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        className: {
          type: 'js/expression',
          data: 'styles.root',
        },
      },
      children: [
        {
          type: 'react/element',
          name: '@material-ui/core.Typography',
          props: {
            variant: 'h6',
          },
          children: [
            'This is template text'
          ]
        },
      ]
    }
  }
}

// create new folder node
function new_folder_node(parentKey, subName, data) {
  const result = {
    title: subName,
    type: 'folder',
    key: !!parentKey && parentKey !== ROOT_KEY
          ? (parentKey + PATH_SEPARATOR + subName).replace(/\*+/g, PATH_SEPARATOR)
          : subName,
    parentKey: !!parentKey && parentKey !== ROOT_KEY
                ? parentKey
                : ROOT_KEY,
    // isLeaf: false,
    subName: subName,
    children: [],
    data: data,
  }
  // check for root
  if (result.key === ROOT_KEY) {
    result.icon = <HomeOutlined />  // override root icon
    result.apiKey = ROOT_KEY
    return result
  } else {
    result.apiKey = result.key + PATH_SEPARATOR
    return result
  }
}

// create new element node
function new_route_node(parentKey, subName, spec) {
  const result = {
    title: subName,
    type: 'route',
    key: !!parentKey && parentKey !== ROOT_KEY
          ? (parentKey + PATH_SEPARATOR + subName).replace(/\*+/g, PATH_SEPARATOR)
          : subName,
    parentKey: !!parentKey && parentKey !== ROOT_KEY
                ? parentKey
                : ROOT_KEY,
    isLeaf: true,
    icon: <Route />,
    subName: subName,
    spec: spec,
  }
  // check for root
  if (result.key === ROOT_KEY) {
    result.icon = <HomeOutlined />  // override root icon
    result.apiKey = ROOT_KEY
    return result
  } else {
    result.apiKey = result.key
    return result
  }
}

// reorder children
const reorder_array = (children) => {

  const reordered = []
  // add add non-leaf child first
  children
    .filter(child => !child.isLeaf)
    .sort((a, b) => {
      return a.subName.localeCompare(b.subName)
    })
    .map(child => {
      reordered.push(child)
    })
  // add add all leaf child next
  children
    .filter(child => !!child.isLeaf)
    .sort((a, b) => {
      return a.subName.localeCompare(b.subName)
    })
    .map(child => {
      reordered.push(child)
    })
  // return reordered
  return reordered
}

export {
  tree_traverse,
  tree_lookup,
  default_route_spec,
  new_folder_node,
  new_route_node,
  reorder_array,
  PATH_SEPARATOR,
  ROOT_KEY,
}
