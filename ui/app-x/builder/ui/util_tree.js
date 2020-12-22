////////////////////////////////////////////////////////////////////////////////
// utilities

// lookup child by ref
function lookup_child_by_ref(treeNode, ref) {
  // lookup child by ref
  const found = treeNode.children?.filter(child => {
    return (child.data.__ref === ref)
  })
  // check if found
  if (found?.length) {
    return found[0]
  } else {
    // not found
    return null
  }
}


////////////////////////////////////////////////////////////////////////////////
// traverse method
function tree_traverse(data, key, callback) {
  for (let i = 0; i < data.length; i++) {
    if (data[i].key === key) {
      return callback(data[i], i, data)
    }
    if (data[i].children) {
      tree_traverse(data[i].children, key, callback)
    }
  }
}

// lookup method
function tree_lookup(data, key) {
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

// generate js/string from tree
function gen_js_string(tree_context, treeNode) {

  if (! ('data' in treeNode)) {
    throw new Error(`ERROR: missing [data] in treeNode`)
  }

  if (! ('type' in treeNode.data)) {
    throw new Error(`ERROR: missing [type] in treeNode.data`)
  }

  if (treeNode.data.type !== 'js/string') {
    throw new Error(`ERROR: treeNode.data.type is not [js/string] [${treeNode.data.type}]`)
  }

  // return
  return {
    ref: treeNode.data.__ref,
    data: String(treeNode.data.data),
  }
}

// generate js/number from tree
function gen_js_number(tree_context, treeNode) {

  if (! ('data' in treeNode)) {
    throw new Error(`ERROR: missing [data] in treeNode`)
  }

  if (! ('type' in treeNode.data)) {
    throw new Error(`ERROR: missing [type] in treeNode.data`)
  }

  if (treeNode.data.type !== 'js/number') {
    throw new Error(`ERROR: treeNode.data.type is not [js/number] [${treeNode.data.type}]`)
  }

  // return
  return {
    ref: treeNode.data.__ref,
    data: isNaN(Number(treeNode.data.data)) ? 0 : Number(treeNode.data.data),
  }
}

// generate js/boolean from tree
function gen_js_boolean(tree_context, treeNode) {

  if (! ('data' in treeNode)) {
    throw new Error(`ERROR: missing [data] in treeNode`)
  }

  if (! ('type' in treeNode.data)) {
    throw new Error(`ERROR: missing [type] in treeNode.data`)
  }

  if (treeNode.data.type !== 'js/boolean') {
    throw new Error(`ERROR: treeNode.data.type is not [js/boolean] [${treeNode.data.type}]`)
  }

  // return
  return {
    ref: treeNode.data.__ref,
    data: Boolean(treeNode.data.data),
  }
}

// generate js/null from tree
function gen_js_null(tree_context, treeNode) {

  if (! ('data' in treeNode)) {
    throw new Error(`ERROR: missing [data] in treeNode`)
  }

  if (! ('type' in treeNode.data)) {
    throw new Error(`ERROR: missing [type] in treeNode.data`)
  }

  if (treeNode.data.type !== 'js/null') {
    throw new Error(`ERROR: treeNode.data.type is not [js/null] [${treeNode.data.type}]`)
  }

  // return
  return {
    ref: treeNode.data.__ref,
    data: null,
  }
}

// generate js/array from tree
function gen_js_array(tree_context, treeNode) {

  if (Array.isArray(treeNode)) {

    if (tree_context.topLevel) {
      // return result as object
      const result = {}
      treeNode.map(child => {
        const childResult = gen_js(
          {
            ...tree_context,
            topLevel: false,
          },
          child)
        if (!!childResult.ref) {
          result[childResult.ref] = childResult.data
        }
      })
      // return
      return {
        ref: null,
        data: result,
      }

    } else {
      // return result as array
      const data = []
      treeNode.map(child => {
        const childResult = gen_js(
          {
            ...tree_context,
            topLevel: false,
          },
          child)
        data.push(childResult.data)
      })
      // return
      return  {
        ref: null,
        data: data,
      }
    }
  }

  if (! ('data' in treeNode)) {
    throw new Error(`ERROR: missing [data] in treeNode`)
  }

  if (! ('type' in treeNode.data)) {
    throw new Error(`ERROR: missing [type] in treeNode.data`)
  }

  if (treeNode.data.type !== 'js/array') {
    throw new Error(`ERROR: treeNode.data.type is not [js/array] [${treeNode.data.type}]`)
  }

  // array data
  const data = []
  treeNode.children.map(child => {
    const childResult = gen_js(
      {
        ...tree_context,
        topLevel: false,
      },
      child)
    data.push(childResult.data)
  })

  // return
  return {
    ref: treeNode.data.__ref,
    data: data,
  }
}

// generate js/object from tree
function gen_js_object(tree_context, treeNode) {

  if (! ('data' in treeNode)) {
    throw new Error(`ERROR: missing [data] in treeNode`)
  }

  if (! ('type' in treeNode.data)) {
    throw new Error(`ERROR: missing [type] in treeNode.data`)
  }

  if (treeNode.data.type !== 'js/object') {
    throw new Error(`ERROR: treeNode.data.type is not [js/object] [${treeNode.data.type}]`)
  }

  // object data
  const data = {}
  treeNode.children.map(child => {
    const childResult = gen_js(
      {
        ...tree_context,
        topLevel: false,
      },
      child
    )
    data[childResult.ref] = childResult.data
  })

  // return
  return {
    ref: treeNode.data.__ref,
    data: data,
  }
}

// generate js/import from tree
function gen_js_import(tree_context, treeNode) {

  if (! ('data' in treeNode)) {
    throw new Error(`ERROR: missing [data] in treeNode`)
  }

  if (! ('type' in treeNode.data)) {
    throw new Error(`ERROR: missing [type] in treeNode.data`)
  }

  if (treeNode.data.type !== 'js/import') {
    throw new Error(`ERROR: treeNode.data.type is not [js/import] [${treeNode.data.type}]`)
  }

  // import data
  const data = {
    type: treeNode.data.type,
    name: treeNode.data.name,
  }

  // return
  return {
    ref: treeNode.data.__ref,
    data: data,
  }
}

// generate js/expression from tree
function gen_js_expression(tree_context, treeNode) {

  if (! ('data' in treeNode)) {
    throw new Error(`ERROR: missing [data] in treeNode`)
  }

  if (! ('type' in treeNode.data)) {
    throw new Error(`ERROR: missing [type] in treeNode.data`)
  }

  if (treeNode.data.type !== 'js/expression') {
    throw new Error(`ERROR: treeNode.data.type is not [js/expression] [${treeNode.data.type}]`)
  }

  // expression data
  const data = {
    type: treeNode.data.type,
    data: treeNode.data.data,
  }

  // return
  return {
    ref: treeNode.data.__ref,
    data: data,
  }
}

// generate js/block from tree
function gen_js_block(tree_context, treeNode) {

  if (! ('data' in treeNode)) {
    throw new Error(`ERROR: missing [data] in treeNode`)
  }

  if (! ('type' in treeNode.data)) {
    throw new Error(`ERROR: missing [type] in treeNode.data`)
  }

  if (treeNode.data.type !== 'js/block') {
    throw new Error(`ERROR: treeNode.data.type is not [js/block] [${treeNode.data.type}]`)
  }

  // block data
  const data = {
    type: treeNode.data.type,
    data: treeNode.data.data,
  }

  // return
  return {
    ref: treeNode.data.__ref,
    data: data,
  }
}

// generate js/function from tree
function gen_js_function(tree_context, treeNode) {

  if (! ('data' in treeNode)) {
    throw new Error(`ERROR: missing [data] in treeNode`)
  }

  if (! ('type' in treeNode.data)) {
    throw new Error(`ERROR: missing [type] in treeNode.data`)
  }

  if (treeNode.data.type !== 'js/function') {
    throw new Error(`ERROR: treeNode.data.type is not [js/function] [${treeNode.data.type}]`)
  }

  // function data
  const data = {
    type: treeNode.data.type,
    params: treeNode.data.params,
    body: treeNode.data.body,
  }

  // return
  return {
    ref: treeNode.data.__ref,
    data: data,
  }
}

// generate js/switch from tree
function gen_js_switch(tree_context, treeNode) {

  if (! ('data' in treeNode)) {
    throw new Error(`ERROR: missing [data] in treeNode`)
  }

  if (! ('type' in treeNode.data)) {
    throw new Error(`ERROR: missing [type] in treeNode.data`)
  }

  if (treeNode.data.type !== 'js/switch') {
    throw new Error(`ERROR: treeNode.data.type is not [js/switch] [${treeNode.data.type}]`)
  }

  // generate data
  const data = {
    type: treeNode.data.type,
    children: [],
  }

  // generate children with conditions
  if (treeNode.children.length) {
    treeNode.children.map(child => {

      if (child.data.__ref) {

        // process 'default' child
        if (child.data.__ref === 'default') {
          data.default = gen_js(
            {
              ...tree_context,
              topLevel: false,
            },
            child
          ).data
        }

      } else {
          // verify that data exist in child
          if (! ('data' in child)) {
            throw new Error(`ERROR: [js/switch] child missing [data] i[${JSON.stringify(child)}]`)
          }
          // verify that condition exist in child.data
          if (! ('condition' in child.data)) {
            throw new Error(`ERROR: [js/switch] child.data missing [condition] [${JSON.stringify(child.data)}]`)
          }
          // result is the same object, no need to check
          // update data.children
          data.children.push({
            condition: child.data.condition,
            result: gen_js(
              {
                ...tree_context,
                topLevel: false,
              },
              child
            ).data,
          })
      }
    })
  }

  // return
  return {
    ref: treeNode.data.__ref,
    data: data,
  }
}

// generate js/map from tree
function gen_js_map(tree_context, treeNode) {

  if (! ('data' in treeNode)) {
    throw new Error(`ERROR: missing [data] in treeNode`)
  }

  if (! ('type' in treeNode.data)) {
    throw new Error(`ERROR: missing [type] in treeNode.data`)
  }

  if (treeNode.data.type !== 'js/map') {
    throw new Error(`ERROR: treeNode.data.type is not [js/map] [${treeNode.data.type}]`)
  }

  const childData = lookup_child_by_ref(treeNode, 'data')
  if (! childData) {
    // throw new Error(`ERROR: [${treeNode.data.type}] missing [data] in treeNode.children`)
    console.warn(`WARN: [${treeNode.data.type}] missing [data] in treeNode.children`)
  }

  const childResult = lookup_child_by_ref(treeNode, 'result')
  if (! childResult) {
    // throw new Error(`ERROR: [${treeNode.data.type}] missing [result] in treeNode.children`)
    console.warn(`WARN: [${treeNode.data.type}] missing [result] in treeNode.children`)
  }

  // generate data
  const data = {
    type: treeNode.data.type,
    data: gen_js(
      {
        ...tree_context,
        topLevel: false,
      },
      childData
    ).data,
    result: gen_js(
      {
        ...tree_context,
        topLevel: false,
      },
      childResult
    ).data,
  }

  // return
  return {
    ref: treeNode.data.__ref,
    data: data,
  }
}

// generate js/reduce from tree
function gen_js_reduce(tree_context, treeNode) {

  if (! ('data' in treeNode)) {
    throw new Error(`ERROR: missing [data] in treeNode`)
  }

  if (! ('type' in treeNode.data)) {
    throw new Error(`ERROR: missing [type] in treeNode.data`)
  }

  if (treeNode.data.type !== 'js/reduce') {
    throw new Error(`ERROR: treeNode.data.type is not [js/reduce] [${treeNode.data.type}]`)
  }

  if (! ('reducer' in treeNode.data)) {
    throw new Error(`ERROR: missing [reducer] in treeNode.data`)
  }

  const childData = lookup_child_by_ref(treeNode, 'data')
  if (! childData) {
    //throw new Error(`ERROR: [${treeNode.data.type}] missing [data] in treeNode.children`)
    console.warn(`WARN: [${treeNode.data.type}] missing [data] in treeNode.children`)
  }

  const childInit = lookup_child_by_ref(treeNode, 'init')
  if (! childInit) {
    //throw new Error(`ERROR: [${treeNode.data.type}] missing [result] in treeNode.children`)
    console.warn(`WARN: [${treeNode.data.type}] missing [result] in treeNode.children`)
  }

  // generate data
  const data = {
    type: treeNode.data.type,
    data: gen_js(
      {
        ...tree_context,
        topLevel: false,
      },
      childData
    ).data,
    reducer: treeNode.data.reducer,
    init: gen_js(
      {
        ...tree_context,
        topLevel: false,
      },
      childInit
    ).data,
  }

  // return
  return {
    ref: treeNode.data.__ref,
    data: data,
  }
}

// generate js/filter from tree
function gen_js_filter(tree_context, treeNode) {

  if (! ('data' in treeNode)) {
    throw new Error(`ERROR: missing [data] in treeNode`)
  }

  if (! ('type' in treeNode.data)) {
    throw new Error(`ERROR: missing [type] in treeNode.data`)
  }

  if (treeNode.data.type !== 'js/filter') {
    throw new Error(`ERROR: treeNode.data.type is not [js/filter] [${treeNode.data.type}]`)
  }

  if (! ('filter' in treeNode.data)) {
    throw new Error(`ERROR: missing [filter] in treeNode.data`)
  }

  const childData = lookup_child_by_ref(treeNode, 'data')
  if (! childData) {
    // throw new Error(`ERROR: [${treeNode.data.type}] missing [data] in treeNode.children`)
    console.warn(`WARN: [${treeNode.data.type}] missing [data] in treeNode.children`)
  }

  // generate data
  const data = {
    type: treeNode.data.type,
    data: gen_js(
      {
        ...tree_context,
        topLevel: false,
      },
      childData
    ).data,
    filter: treeNode.data.filter,
  }

  // return
  return {
    ref: treeNode.data.__ref,
    data: data,
  }
}

// generate react/element from tree
function gen_react_element(tree_context, treeNode) {

  if (! ('data' in treeNode)) {
    throw new Error(`ERROR: missing [data] in treeNode`)
  }

  if (! ('type' in treeNode.data)) {
    throw new Error(`ERROR: missing [type] in treeNode.data`)
  }

  if (treeNode.data.type !== 'react/element') {
    throw new Error(`ERROR: treeNode.data.type is not [react/element] [${treeNode.data.type}]`)
  }

  if (! ('name' in treeNode.data)) {
    throw new Error(`ERROR: [${treeNode.data.type}] missing [name] in treeNode.data`)
  }

  // generate data
  const data = {
    type: treeNode.data.type,
    name: treeNode.data.name,
  }

  // process props
  const childProps = lookup_child_by_ref(treeNode, 'props')
  if (childProps) {
    data.props = gen_js(
      {
        ...tree_context,
        topLevel: false,
      },
      childProps
    ).data
  }

  // process children
  if (treeNode.children.length) {
    treeNode.children.map(child => {
      // process only child with null ref
      if (child.data.__ref === null) {
        if (! ('children' in data)) {
          data.children = []
        }
        data.children.push(
          gen_js(
            {
              ...tree_context,
              topLevel: false,
            },
            child
          ).data
        )
      }
    })
  }

  // return
  return {
    ref: treeNode.data.__ref,
    data: data,
  }
}

// generate react/html from tree
function gen_react_html(tree_context, treeNode) {

  if (! ('data' in treeNode)) {
    throw new Error(`ERROR: missing [data] in treeNode`)
  }

  if (! ('type' in treeNode.data)) {
    throw new Error(`ERROR: missing [type] in treeNode.data`)
  }

  if (treeNode.data.type !== 'react/html') {
    throw new Error(`ERROR: treeNode.data.type is not [react/html] [${treeNode.data.type}]`)
  }

  if (! ('name' in treeNode.data)) {
    throw new Error(`ERROR: [${treeNode.data.type}] missing [name] in treeNode.data`)
  }

  // generate data
  const data = {
    type: treeNode.data.type,
    name: treeNode.data.name,
  }

  // process props
  const childProps = lookup_child_by_ref(treeNode, 'props')
  if (childProps) {
    data.props = gen_js(
      {
        ...tree_context,
        topLevel: false,
      },
      childProps
    ).data
  }

  // process children
  if (treeNode.children.length) {
    treeNode.children.map(child => {
      // process only child with null ref
      if (child.data.__ref === null) {
        if (! ('children' in data)) {
          data.children = []
        }
        data.children.push(
          gen_js(
            {
              ...tree_context,
              topLevel: false,
            },
            child
          ).data
        )
      }
    })
  }

  // return
  return {
    ref: treeNode.data.__ref,
    data: data,
  }
}

// generate react/state from tree
function gen_react_state(tree_context, treeNode) {

  if (! ('data' in treeNode)) {
    throw new Error(`ERROR: missing [data] in treeNode`)
  }

  if (! ('type' in treeNode.data)) {
    throw new Error(`ERROR: missing [type] in treeNode.data`)
  }

  if (treeNode.data.type !== 'react/state') {
    throw new Error(`ERROR: treeNode.data.type is not [react/state] [${treeNode.data.type}]`)
  }

  if (! ('name' in treeNode.data)) {
    throw new Error(`ERROR: [${treeNode.data.type}] missing [name] in treeNode.data`)
  }

  if (! ('setter' in treeNode.data)) {
    throw new Error(`ERROR: [${treeNode.data.type}] missing [setter] in treeNode.data`)
  }

  if (! ('init' in treeNode.data)) {
    throw new Error(`ERROR: [${treeNode.data.type}] missing [init] in treeNode.data`)
  }

  // generate data
  const data = {
    type: treeNode.data.type,
    name: treeNode.data.name,
    setter: treeNode.data.setter,
    init: treeNode.data.init,
  }

  // return
  return {
    ref: treeNode.data.__ref,
    data: data,
  }
}

// generate react/effect from tree
function gen_react_effect(tree_context, treeNode) {

  if (! ('data' in treeNode)) {
    throw new Error(`ERROR: missing [data] in treeNode`)
  }

  if (! ('type' in treeNode.data)) {
    throw new Error(`ERROR: missing [type] in treeNode.data`)
  }

  if (treeNode.data.type !== 'react/effect') {
    throw new Error(`ERROR: treeNode.data.type is not [react/effect] [${treeNode.data.type}]`)
  }

  if (! ('data' in treeNode.data)) {
    throw new Error(`ERROR: [${treeNode.data.type}] missing [data] in treeNode.data`)
  }

  // generate data
  const data = {
    type: treeNode.data.type,
    data: treeNode.data.data,
  }

  // return
  return {
    ref: treeNode.data.__ref,
    data: data,
  }
}

// generate mui/style from tree
function gen_mui_style(tree_context, treeNode) {

  if (! ('data' in treeNode)) {
    throw new Error(`ERROR: missing [data] in treeNode`)
  }

  if (! ('type' in treeNode.data)) {
    throw new Error(`ERROR: missing [type] in treeNode.data`)
  }

  if (treeNode.data.type !== 'mui/style') {
    throw new Error(`ERROR: treeNode.data.type is not [mui/style] [${treeNode.data.type}]`)
  }

  // generate data
  const data = {
    type: treeNode.data.type,
  }

  if (treeNode.children.length) {
    treeNode.children.map(child => {
      const childResult = gen_js(
        {
          ...tree_context,
          topLevel: false,
        },
        child
      )
      data[childResult.ref] = childResult.data
    })
  }

  // return
  return {
    ref: treeNode.data.__ref,
    data: data,
  }
}

// generate appx/route from tree
function gen_appx_route(tree_context, treeNode) {

  if (! ('data' in treeNode)) {
    throw new Error(`ERROR: missing [data] in treeNode`)
  }

  if (! ('type' in treeNode.data)) {
    throw new Error(`ERROR: missing [type] in treeNode.data`)
  }

  if (treeNode.data.type !== 'appx/route') {
    throw new Error(`ERROR: treeNode.data.type is not [appx/route] [${treeNode.data.type}]`)
  }

  // generate data
  const data = {
    type: treeNode.data.type,
  }

  // return
  return {
    ref: treeNode.data.__ref,
    data: data,
  }
}

// generate data from tree
function gen_js(tree_context, treeNode) {

  if (!treeNode) {
    return {
      ref: null,
      data: null,
    }
  }

  if (Array.isArray(treeNode)) {
    return gen_js_array(tree_context, treeNode)
  }

  if (! ('data' in treeNode)) {
    throw new Error(`ERROR: missing data in treeNode`)
  }

  if (! ('type' in treeNode.data)) {
    throw new Error(`ERROR: missing type in treeNode.data`)
  }

  if (! ('__ref' in treeNode.data)) {
    throw new Error(`ERROR: missing __ref in treeNode.data`)
  }

  if (treeNode.data.type === 'js/string') {

    return gen_js_string(tree_context, treeNode)

  } else if (treeNode.data.type === 'js/number') {

    return gen_js_number(tree_context, treeNode)

  } else if (treeNode.data.type === 'js/boolean') {

    return gen_js_boolean(tree_context, treeNode)

  } else if (treeNode.data.type === 'js/null') {

    return gen_js_null(tree_context, treeNode)

  } else if (treeNode.data.type === 'js/array') {

    return gen_js_array(tree_context, treeNode)

  } else if (treeNode.data.type === 'js/object') {

    return gen_js_object(tree_context, treeNode)

  } else if (treeNode.data.type === 'js/import') {

    return gen_js_import(tree_context, treeNode)

  } else if (treeNode.data.type === 'js/expression') {

    return gen_js_expression(tree_context, treeNode)

  } else if (treeNode.data.type === 'js/block') {

    return gen_js_block(tree_context, treeNode)

  } else if (treeNode.data.type === 'js/function') {

    return gen_js_function(tree_context, treeNode)

  } else if (treeNode.data.type === 'js/switch') {

    return gen_js_switch(tree_context, treeNode)

  } else if (treeNode.data.type === 'js/map') {

    return gen_js_map(tree_context, treeNode)

  } else if (treeNode.data.type === 'js/reduce') {

    return gen_js_reduce(tree_context, treeNode)

  } else if (treeNode.data.type === 'js/filter') {

    return gen_js_filter(tree_context, treeNode)

  } else if (treeNode.data.type === 'react/element') {

    return gen_react_element(tree_context, treeNode)

  } else if (treeNode.data.type === 'react/html') {

    return gen_react_html(tree_context, treeNode)

  } else if (treeNode.data.type === 'react/state') {

    return gen_react_state(tree_context, treeNode)

  } else if (treeNode.data.type === 'react/effect') {

    return gen_react_effect(tree_context, treeNode)

  } else if (treeNode.data.type === 'mui/style') {

    return gen_mui_style(tree_context, treeNode)

  } else if (treeNode.data.type === 'mui/control') {

    // TODO
    throw new Error(`ERROR: unrecognized treeNode.data.type [${treeNode.data.type}] [${JSON.stringify(treeNode.data)}]`)

  } else if (treeNode.data.type === 'appx/route') {

    return gen_appx_route(tree_context, treeNode)

  } else if (treeNode.data.type === '/') {

    return {
      ref: null,
      data: null
    }

  } else {

    throw new Error(`ERROR: unrecognized treeNode.data.type [${treeNode.data.type}] [${JSON.stringify(treeNode.data)}]`)
  }
}

export {
  tree_traverse,
  tree_lookup,
  gen_js,
  lookup_child_by_ref,
}
