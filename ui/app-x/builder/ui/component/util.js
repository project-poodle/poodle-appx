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
import Provider from 'app-x/icon/Provider'

////////////////////////////////////////////////////////////////////////////////

const PATH_SEPARATOR = '/'

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

////////////////////////////////////////////////////////////////////////////////
// lookup icon for type
function lookup_icon_for_type (type) {

  if (type === 'react/component') {

    return <ReactIcon />

  } else if (type === 'react/provider') {

    return <Provider />

  } else if (type === 'html') {

    return <ContainerOutlined />

  } else if (type === 'folder') {

    return <FolderOutlined />

  } else {

    return <FileOutlined />
  }
}

// lookup icon for type
function lookup_desc_for_type (type) {

  if (type === 'react/component') {

    return 'React Component'

  } else if (type === 'react/provider') {

    return 'Context Provider'

  } else if (type === 'html') {

    return 'HTML'

  } else if (type === 'folder') {

    return 'Folder'

  } else {

    return 'File'
  }
}

// lookup default spec
function default_spec_for_type (type) {

  if (type === 'react/component') {

    return {
      theme: {
        _type: 'mui/theme',
      },
      styles: {
        _type: 'mui/style',
        root: {
          width: '100%',
          height: '100%',
          color: {
            _type: 'js/expression',
            data: 'theme?.palette.text.primary'
          },
          backgroundColor: {
            _type: 'js/expression',
            data: 'theme?.palette.background.paper'
          }
        }
      },
      router: {
        _type: 'route/context',
        name: 'app-x/route/RouterProvider.Context',
      },
      component: {
        _type: 'react/element',
        name: '@material-ui/core.Box',
        props: {
          className: {
            _type: 'js/expression',
            data: 'styles.root',
          },
        },
        children: [
          {
            _type: 'react/element',
            name: '@material-ui/core.Box',
            props: {
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              className: {
                _type: 'js/expression',
                data: 'styles.root',
              },
            },
            children: [
              {
                _type: 'react/element',
                name: '@material-ui/core.Typography',
                children: [
                  'This is template text'
                ]
              }
            ]
          },
        ]
      },
      _test: {
        providers: [
          {
            _type: 'react/element',
            name: 'react-redux.Provider',
            props: {
              store: {
                _type: 'js/import',
                name: 'app-x/redux/store'
              }
            }
          },
          {
            _type: 'react/element',
            name: 'app-x/theme/GlobalStyleProvider',
          },
          {
            _type: 'react/element',
            name: 'app-x/route/RouterProvider',
          },
        ]
      }
    }

  } else if (type === 'react/provider') {

    return {
      // state
      '...open': {
        _type: 'react/state',
        name: 'open',
        setter: 'setOpen',
        init: "false"
      },
      // function
      toggle: {
        _type: 'js/function',
        body: [
          'setOpen(!open)'
        ]
      },
      // provider
      provider: {
        open: {
          _type: 'js/expression',
          data: 'open'
        },
        setOpen: {
          _type: 'js/expression',
          data: 'setOpen'
        },
        toggle: {
          _type: 'js/expression',
          data: 'toggle'
        }
      }
    }

  } else if (type === 'html') {

    return {
      data: {
        title: 'This is application title'
      }
    }

  } else {

    throw new Error(`Unknown component type [ ${type} ]`)
  }
}

// create new folder node
function new_folder_node(parentKey, subName) {
  const result = {
    title: subName,
    type: 'folder',
    key: (parentKey + PATH_SEPARATOR + subName).replace(/\/+/g, '/'),
    parentKey: parentKey,
    // isLeaf: false,
    subName: subName,
    children: [],
  }
  if (result.key === '/') {
    result.icon = <HomeOutlined />  // override root icon
    return result
  } else {
    return result
  }
}

// create new component node
function new_component_node(parentKey, subName, type, spec) {
  return {
    title: subName,
    type: type,
    key: (parentKey + PATH_SEPARATOR + subName).replace(/\/+/g, '/'),
    parentKey: parentKey,
    isLeaf: true,
    icon: lookup_icon_for_type(type),
    subName: subName,
    spec: spec,
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
  lookup_icon_for_type,
  lookup_desc_for_type,
  default_spec_for_type,
  new_folder_node,
  new_component_node,
  reorder_array,
  PATH_SEPARATOR,
}
