////////////////////////////////////////////////////////////////////////////////
// utilities

// lookup child by ref
function lookup_child_by_ref(treeNode, ref) {
  // lookup child by ref
  const found = treeNode.children?.filter(child => {
    return (child.data?._ref === ref)
  })
  // check if found
  if (found?.length) {
    return found[0]
  } else {
    // not found
    return null
  }
}

// remove child by ref
function remove_child_by_ref(treeNode, ref) {
  // lookup child by ref
  treeNode.children = treeNode.children?.filter(child => {
    return (child.data._ref !== ref)
  })
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

////////////////////////////////////////////////////////////////////////////////
// parse methods

/*
// generate js/string from tree
function gen_js_string(tree_context, treeNode) {

  if (! ('data' in treeNode)) {
    throw new Error(`ERROR: missing [data] in treeNode`)
  }

  if (! ('_type' in treeNode.data)) {
    throw new Error(`ERROR: missing [type] in treeNode.data`)
  }

  if (treeNode.data._type !== 'js/string') {
    throw new Error(`ERROR: treeNode.data._type is not [js/string] [${treeNode.data._type}]`)
  }

  // return
  return {
    ref: treeNode.data._ref,
    data: String(treeNode.data.data),
  }
}

// generate js/number from tree
function gen_js_number(tree_context, treeNode) {

  if (! ('data' in treeNode)) {
    throw new Error(`ERROR: missing [data] in treeNode`)
  }

  if (! ('_type' in treeNode.data)) {
    throw new Error(`ERROR: missing [type] in treeNode.data`)
  }

  if (treeNode.data._type !== 'js/number') {
    throw new Error(`ERROR: treeNode.data._type is not [js/number] [${treeNode.data._type}]`)
  }

  // return
  return {
    ref: treeNode.data._ref,
    data: isNaN(Number(treeNode.data.data)) ? 0 : Number(treeNode.data.data),
  }
}

// generate js/boolean from tree
function gen_js_boolean(tree_context, treeNode) {

  if (! ('data' in treeNode)) {
    throw new Error(`ERROR: missing [data] in treeNode`)
  }

  if (! ('_type' in treeNode.data)) {
    throw new Error(`ERROR: missing [type] in treeNode.data`)
  }

  if (treeNode.data._type !== 'js/boolean') {
    throw new Error(`ERROR: treeNode.data._type is not [js/boolean] [${treeNode.data._type}]`)
  }

  // return
  return {
    ref: treeNode.data._ref,
    data: Boolean(treeNode.data.data),
  }
}

// generate js/null from tree
function gen_js_null(tree_context, treeNode) {

  if (! ('data' in treeNode)) {
    throw new Error(`ERROR: missing [data] in treeNode`)
  }

  if (! ('_type' in treeNode.data)) {
    throw new Error(`ERROR: missing [type] in treeNode.data`)
  }

  if (treeNode.data._type !== 'js/null') {
    throw new Error(`ERROR: treeNode.data._type is not [js/null] [${treeNode.data._type}]`)
  }

  // return
  return {
    ref: treeNode.data._ref,
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

  if (! ('_type' in treeNode.data)) {
    throw new Error(`ERROR: missing [type] in treeNode.data`)
  }

  if (treeNode.data._type !== 'js/array') {
    throw new Error(`ERROR: treeNode.data._type is not [js/array] [${treeNode.data._type}]`)
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
    ref: treeNode.data._ref,
    data: data,
  }
}

// generate js/object from tree
function gen_js_object(tree_context, treeNode) {

  if (! ('data' in treeNode)) {
    throw new Error(`ERROR: missing [data] in treeNode`)
  }

  if (! ('_type' in treeNode.data)) {
    throw new Error(`ERROR: missing [type] in treeNode.data`)
  }

  if (treeNode.data._type !== 'js/object') {
    throw new Error(`ERROR: treeNode.data._type is not [js/object] [${treeNode.data._type}]`)
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
    ref: treeNode.data._ref,
    data: data,
  }
}

// generate js/import from tree
function gen_js_import(tree_context, treeNode) {

  if (! ('data' in treeNode)) {
    throw new Error(`ERROR: missing [data] in treeNode`)
  }

  if (! ('_type' in treeNode.data)) {
    throw new Error(`ERROR: missing [type] in treeNode.data`)
  }

  if (treeNode.data._type !== 'js/import') {
    throw new Error(`ERROR: treeNode.data._type is not [js/import] [${treeNode.data._type}]`)
  }

  // import data
  const data = {
    _type: treeNode.data._type,
    name: treeNode.data.name,
  }

  // return
  return {
    ref: treeNode.data._ref,
    data: data,
  }
}

// generate js/expression from tree
function gen_js_expression(tree_context, treeNode) {

  if (! ('data' in treeNode)) {
    throw new Error(`ERROR: missing [data] in treeNode`)
  }

  if (! ('_type' in treeNode.data)) {
    throw new Error(`ERROR: missing [type] in treeNode.data`)
  }

  if (treeNode.data._type !== 'js/expression') {
    throw new Error(`ERROR: treeNode.data._type is not [js/expression] [${treeNode.data._type}]`)
  }

  // expression data
  const data = {
    _type: treeNode.data._type,
    data: treeNode.data.data,
  }

  // return
  return {
    ref: treeNode.data._ref,
    data: data,
  }
}

// generate js/statement from tree
function gen_js_statement(tree_context, treeNode) {

  if (! ('data' in treeNode)) {
    throw new Error(`ERROR: missing [data] in treeNode`)
  }

  if (! ('_type' in treeNode.data)) {
    throw new Error(`ERROR: missing [type] in treeNode.data`)
  }

  if (treeNode.data._type !== 'js/statement') {
    throw new Error(`ERROR: treeNode.data._type is not [js/statement] [${treeNode.data._type}]`)
  }

  // block data
  const data = {
    _type: treeNode.data._type,
    body: treeNode.data.body,
  }

  // return
  return {
    ref: treeNode.data._ref,
    data: data,
  }
}

// generate js/function from tree
function gen_js_function(tree_context, treeNode) {

  if (! ('data' in treeNode)) {
    throw new Error(`ERROR: missing [data] in treeNode`)
  }

  if (! ('_type' in treeNode.data)) {
    throw new Error(`ERROR: missing [type] in treeNode.data`)
  }

  if (treeNode.data._type !== 'js/function') {
    throw new Error(`ERROR: treeNode.data._type is not [js/function] [${treeNode.data._type}]`)
  }

  // function data
  const data = {
    _type: treeNode.data._type,
    params: treeNode.data.params,
    body: treeNode.data.body,
  }

  // return
  return {
    ref: treeNode.data._ref,
    data: data,
  }
}

// generate js/switch from tree
function gen_js_switch(tree_context, treeNode) {

  if (! ('data' in treeNode)) {
    throw new Error(`ERROR: missing [data] in treeNode`)
  }

  if (! ('_type' in treeNode.data)) {
    throw new Error(`ERROR: missing [type] in treeNode.data`)
  }

  if (treeNode.data._type !== 'js/switch') {
    throw new Error(`ERROR: treeNode.data._type is not [js/switch] [${treeNode.data._type}]`)
  }

  // generate data
  const data = {
    _type: treeNode.data._type,
    children: [],
  }

  // generate children with conditions
  if (treeNode.children.length) {
    treeNode.children.map(child => {

      if (!!child.data._ref) {

        // process 'default' child
        if (child.data._ref === 'default') {
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
          if (! ('_condition' in child.data)) {
            throw new Error(`ERROR: [js/switch] child.data missing [_condition] [${JSON.stringify(child.data)}]`)
          }
          // result is the same object, no need to check
          // update data.children
          data.children.push({
            condition: child.data._condition,
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
    ref: treeNode.data._ref,
    data: data,
  }
}

// generate js/map from tree
function gen_js_map(tree_context, treeNode) {

  if (! ('data' in treeNode)) {
    throw new Error(`ERROR: missing [data] in treeNode`)
  }

  if (! ('_type' in treeNode.data)) {
    throw new Error(`ERROR: missing [type] in treeNode.data`)
  }

  if (treeNode.data._type !== 'js/map') {
    throw new Error(`ERROR: treeNode.data._type is not [js/map] [${treeNode.data._type}]`)
  }

  const childData = lookup_child_by_ref(treeNode, 'data')
  if (! childData) {
    // throw new Error(`ERROR: [${treeNode.data._type}] missing [data] in treeNode.children`)
    console.warn(`WARN: [${treeNode.data._type}] missing [data] in treeNode.children`)
  }

  const childResult = lookup_child_by_ref(treeNode, 'result')
  if (! childResult) {
    // throw new Error(`ERROR: [${treeNode.data._type}] missing [result] in treeNode.children`)
    console.warn(`WARN: [${treeNode.data._type}] missing [result] in treeNode.children`)
  }

  // generate data
  const data = {
    _type: treeNode.data._type,
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

  // console.log(data)

  // return
  return {
    ref: treeNode.data._ref,
    data: data,
  }
}

// generate js/reduce from tree
function gen_js_reduce(tree_context, treeNode) {

  if (! ('data' in treeNode)) {
    throw new Error(`ERROR: missing [data] in treeNode`)
  }

  if (! ('_type' in treeNode.data)) {
    throw new Error(`ERROR: missing [type] in treeNode.data`)
  }

  if (treeNode.data._type !== 'js/reduce') {
    throw new Error(`ERROR: treeNode.data._type is not [js/reduce] [${treeNode.data._type}]`)
  }

  if (! ('reducer' in treeNode.data)) {
    throw new Error(`ERROR: missing [reducer] in treeNode.data`)
  }

  const childData = lookup_child_by_ref(treeNode, 'data')
  if (! childData) {
    //throw new Error(`ERROR: [${treeNode.data._type}] missing [data] in treeNode.children`)
    console.warn(`WARN: [${treeNode.data._type}] missing [data] in treeNode.children`)
  }

  const childInit = lookup_child_by_ref(treeNode, 'init')
  if (! childInit) {
    //throw new Error(`ERROR: [${treeNode.data._type}] missing [result] in treeNode.children`)
    console.warn(`WARN: [${treeNode.data._type}] missing [result] in treeNode.children`)
  }

  // generate data
  const data = {
    _type: treeNode.data._type,
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
    ref: treeNode.data._ref,
    data: data,
  }
}

// generate js/filter from tree
function gen_js_filter(tree_context, treeNode) {

  if (! ('data' in treeNode)) {
    throw new Error(`ERROR: missing [data] in treeNode`)
  }

  if (! ('_type' in treeNode.data)) {
    throw new Error(`ERROR: missing [type] in treeNode.data`)
  }

  if (treeNode.data._type !== 'js/filter') {
    throw new Error(`ERROR: treeNode.data._type is not [js/filter] [${treeNode.data._type}]`)
  }

  if (! ('filter' in treeNode.data)) {
    throw new Error(`ERROR: missing [filter] in treeNode.data`)
  }

  const childData = lookup_child_by_ref(treeNode, 'data')
  if (! childData) {
    // throw new Error(`ERROR: [${treeNode.data._type}] missing [data] in treeNode.children`)
    console.warn(`WARN: [${treeNode.data._type}] missing [data] in treeNode.children`)
  }

  // generate data
  const data = {
    _type: treeNode.data._type,
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
    ref: treeNode.data._ref,
    data: data,
  }
}

// generate react/element from tree
function gen_react_element(tree_context, treeNode) {

  if (! ('data' in treeNode)) {
    throw new Error(`ERROR: missing [data] in treeNode`)
  }

  if (! ('_type' in treeNode.data)) {
    throw new Error(`ERROR: missing [type] in treeNode.data`)
  }

  if (treeNode.data._type !== 'react/element') {
    throw new Error(`ERROR: treeNode.data._type is not [react/element] [${treeNode.data._type}]`)
  }

  if (! ('name' in treeNode.data)) {
    throw new Error(`ERROR: [${treeNode.data._type}] missing [name] in treeNode.data`)
  }

  // generate data
  const data = {
    _type: treeNode.data._type,
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
      if (child.data._ref === null) {
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
    ref: treeNode.data._ref,
    data: data,
  }
}

// generate react/html from tree
function gen_react_html(tree_context, treeNode) {

  if (! ('data' in treeNode)) {
    throw new Error(`ERROR: missing [data] in treeNode`)
  }

  if (! ('_type' in treeNode.data)) {
    throw new Error(`ERROR: missing [type] in treeNode.data`)
  }

  if (treeNode.data._type !== 'react/html') {
    throw new Error(`ERROR: treeNode.data._type is not [react/html] [${treeNode.data._type}]`)
  }

  if (! ('name' in treeNode.data)) {
    throw new Error(`ERROR: [${treeNode.data._type}] missing [name] in treeNode.data`)
  }

  // generate data
  const data = {
    _type: treeNode.data._type,
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
      if (child.data._ref === null) {
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
    ref: treeNode.data._ref,
    data: data,
  }
}

// generate react/state from tree
function gen_react_state(tree_context, treeNode) {

  if (! ('data' in treeNode)) {
    throw new Error(`ERROR: missing [data] in treeNode`)
  }

  if (! ('_type' in treeNode.data)) {
    throw new Error(`ERROR: missing [type] in treeNode.data`)
  }

  if (treeNode.data._type !== 'react/state') {
    throw new Error(`ERROR: treeNode.data._type is not [react/state] [${treeNode.data._type}]`)
  }

  if (! ('name' in treeNode.data)) {
    throw new Error(`ERROR: [${treeNode.data._type}] missing [name] in treeNode.data`)
  }

  if (! ('setter' in treeNode.data)) {
    throw new Error(`ERROR: [${treeNode.data._type}] missing [setter] in treeNode.data`)
  }

  if (! ('init' in treeNode.data)) {
    throw new Error(`ERROR: [${treeNode.data._type}] missing [init] in treeNode.data`)
  }

  // generate data
  const data = {
    _type: treeNode.data._type,
    name: treeNode.data.name,
    setter: treeNode.data.setter,
    init: !!treeNode.data.init ? treeNode.data.init : null, // default to null
  }

  // return
  return {
    ref: treeNode.data._ref,
    data: data,
  }
}

// generate react/context from tree
function gen_react_context(tree_context, treeNode) {

  if (! ('data' in treeNode)) {
    throw new Error(`ERROR: missing [data] in treeNode`)
  }

  if (! ('_type' in treeNode.data)) {
    throw new Error(`ERROR: missing [type] in treeNode.data`)
  }

  if (treeNode.data._type !== 'react/context') {
    throw new Error(`ERROR: treeNode.data._type is not [react/context] [${treeNode.data._type}]`)
  }

  if (! ('name' in treeNode.data)) {
    throw new Error(`ERROR: [${treeNode.data._type}] missing [name] in treeNode.data`)
  }

  // generate data
  const data = {
    _type: treeNode.data._type,
    name: treeNode.data.name,
  }

  // return
  return {
    ref: treeNode.data._ref,
    data: data,
  }
}

// generate react/effect from tree
function gen_react_effect(tree_context, treeNode) {

  if (! ('data' in treeNode)) {
    throw new Error(`ERROR: missing [data] in treeNode`)
  }

  if (! ('_type' in treeNode.data)) {
    throw new Error(`ERROR: missing [type] in treeNode.data`)
  }

  if (treeNode.data._type !== 'react/effect') {
    throw new Error(`ERROR: treeNode.data._type is not [react/effect] [${treeNode.data._type}]`)
  }

  if (! ('data' in treeNode.data)) {
    throw new Error(`ERROR: [${treeNode.data._type}] missing [data] in treeNode.data`)
  }

  // generate data
  const data = {
    _type: treeNode.data._type,
    data: treeNode.data.data,
    states: treeNode.data.states,
  }

  // return
  return {
    ref: treeNode.data._ref,
    data: data,
  }
}

// generate react/form from tree
function gen_react_form(tree_context, treeNode) {

  if (! ('data' in treeNode)) {
    throw new Error(`ERROR: missing [data] in treeNode`)
  }

  if (! ('_type' in treeNode.data)) {
    throw new Error(`ERROR: missing [type] in treeNode.data`)
  }

  if (treeNode.data._type !== 'react/form') {
    throw new Error(`ERROR: treeNode.data._type is not [react/form] [${treeNode.data._type}]`)
  }

  if (! ('name' in treeNode.data)) {
    throw new Error(`ERROR: [${treeNode.data._type}] missing [name] in treeNode.data`)
  }

  // generate data
  const data = {
    _type: treeNode.data._type,
    name: treeNode.data.name,
    onSubmit: treeNode.data.onSubmit,
    onError: treeNode.data.onError,
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

  // process props
  const formProps = lookup_child_by_ref(treeNode, 'formProps')
  if (formProps) {
    data.formProps = gen_js(
      {
        ...tree_context,
        topLevel: false,
      },
      formProps
    ).data
  }

  // process children
  if (treeNode.children.length) {
    treeNode.children.map(child => {
      // process only child with null ref
      if (child.data._ref === null) {
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
    ref: treeNode.data._ref,
    data: data,
  }
}

// generate input/text from tree
function gen_input_text(tree_context, treeNode) {

  if (! ('data' in treeNode)) {
    throw new Error(`ERROR: missing [data] in treeNode`)
  }

  if (! ('_type' in treeNode.data)) {
    throw new Error(`ERROR: missing [type] in treeNode.data`)
  }

  if (treeNode.data._type !== 'input/text') {
    throw new Error(`ERROR: treeNode.data._type is not [input/text] [${treeNode.data._type}]`)
  }

  if (! ('name' in treeNode.data)) {
    throw new Error(`ERROR: [${treeNode.data._type}] missing [name] in treeNode.data`)
  }

  // generate data
  const data = {
    _type: treeNode.data._type,
    name: treeNode.data.name,
    array: treeNode.data.array,
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

  // process rules
  const ruleProps = lookup_child_by_ref(treeNode, 'rules')
  if (ruleProps) {
    data.rules = gen_js(
      {
        ...tree_context,
        topLevel: false,
      },
      ruleProps
    ).data
  }

  // return
  return {
    ref: treeNode.data._ref,
    data: data,
  }
}

// generate mui/style from tree
function gen_mui_style(tree_context, treeNode) {

  if (! ('data' in treeNode)) {
    throw new Error(`ERROR: missing [data] in treeNode`)
  }

  if (! ('_type' in treeNode.data)) {
    throw new Error(`ERROR: missing [type] in treeNode.data`)
  }

  if (treeNode.data._type !== 'mui/style') {
    throw new Error(`ERROR: treeNode.data._type is not [mui/style] [${treeNode.data._type}]`)
  }

  // generate data
  const data = {
    _type: treeNode.data._type,
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
    ref: treeNode.data._ref,
    data: data,
  }
}

// generate appx/api from tree
function gen_appx_api(tree_context, treeNode) {

  if (! ('data' in treeNode)) {
    throw new Error(`ERROR: missing [data] in treeNode`)
  }

  if (! ('_type' in treeNode.data)) {
    throw new Error(`ERROR: missing [type] in treeNode.data`)
  }

  if (treeNode.data._type !== 'appx/api') {
    throw new Error(`ERROR: treeNode.data._type is not [appx/route] [${treeNode.data._type}]`)
  }

  if (! ('namespace' in treeNode.data)) {
    throw new Error(`ERROR: [${treeNode.data._type}] missing [namespace] in treeNode.data`)
  }

  if (! ('app_name' in treeNode.data)) {
    throw new Error(`ERROR: [${treeNode.data._type}] missing [app_name] in treeNode.data`)
  }

  if (! ('method' in treeNode.data)) {
    throw new Error(`ERROR: [${treeNode.data._type}] missing [method] in treeNode.data`)
  }

  if (! ('endpoint' in treeNode.data)) {
    throw new Error(`ERROR: [${treeNode.data._type}] missing [endpoint] in treeNode.data`)
  }

  // generate data
  const data = {
    _type: treeNode.data._type,
    namespace: treeNode.data.namespace,
    app_name: treeNode.data.app_name,
    method: treeNode.data.method,
    endpoint: treeNode.data.endpoint,
    data: treeNode.data.data,
    prep: treeNode.data.prep,
    result: treeNode.data.result,
    error: treeNode.data.error,
  }

  // return
  return {
    ref: treeNode.data._ref,
    data: data,
  }
}

// generate appx/route from tree
function gen_appx_route(tree_context, treeNode) {

  if (! ('data' in treeNode)) {
    throw new Error(`ERROR: missing [data] in treeNode`)
  }

  if (! ('_type' in treeNode.data)) {
    throw new Error(`ERROR: missing [type] in treeNode.data`)
  }

  if (treeNode.data._type !== 'appx/route') {
    throw new Error(`ERROR: treeNode.data._type is not [appx/route] [${treeNode.data._type}]`)
  }

  // generate data
  const data = {
    _type: treeNode.data._type,
  }

  // return
  return {
    ref: treeNode.data._ref,
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

  if (! ('_type' in treeNode.data)) {
    throw new Error(`ERROR: missing type in treeNode.data`)
  }

  if (! ('_ref' in treeNode.data)) {
    throw new Error(`ERROR: missing _ref in treeNode.data`)
  }

  try {
    if (treeNode.data._type === 'js/string') {

      return gen_js_string(tree_context, treeNode)

    } else if (treeNode.data._type === 'js/number') {

      return gen_js_number(tree_context, treeNode)

    } else if (treeNode.data._type === 'js/boolean') {

      return gen_js_boolean(tree_context, treeNode)

    } else if (treeNode.data._type === 'js/null') {

      return gen_js_null(tree_context, treeNode)

    } else if (treeNode.data._type === 'js/array') {

      return gen_js_array(tree_context, treeNode)

    } else if (treeNode.data._type === 'js/object') {

      return gen_js_object(tree_context, treeNode)

    } else if (treeNode.data._type === 'js/import') {

      return gen_js_import(tree_context, treeNode)

    } else if (treeNode.data._type === 'js/expression') {

      return gen_js_expression(tree_context, treeNode)

    } else if (treeNode.data._type === 'js/statement') {

      return gen_js_statement(tree_context, treeNode)

    } else if (treeNode.data._type === 'js/function') {

      return gen_js_function(tree_context, treeNode)

    } else if (treeNode.data._type === 'js/switch') {

      return gen_js_switch(tree_context, treeNode)

    } else if (treeNode.data._type === 'js/map') {

      return gen_js_map(tree_context, treeNode)

    } else if (treeNode.data._type === 'js/reduce') {

      return gen_js_reduce(tree_context, treeNode)

    } else if (treeNode.data._type === 'js/filter') {

      return gen_js_filter(tree_context, treeNode)

    } else if (treeNode.data._type === 'react/element') {

      return gen_react_element(tree_context, treeNode)

    } else if (treeNode.data._type === 'react/html') {

      return gen_react_html(tree_context, treeNode)

    } else if (treeNode.data._type === 'react/form') {

      return gen_react_form(tree_context, treeNode)

    } else if (treeNode.data._type === 'react/state') {

      return gen_react_state(tree_context, treeNode)

    } else if (treeNode.data._type === 'react/context') {

      return gen_react_context(tree_context, treeNode)

    } else if (treeNode.data._type === 'react/effect') {

      return gen_react_effect(tree_context, treeNode)

    } else if (treeNode.data._type === 'input/text') {

      return gen_input_text(tree_context, treeNode)

    } else if (treeNode.data._type === 'mui/style') {

      return gen_mui_style(tree_context, treeNode)

    } else if (treeNode.data._type === 'appx/api') {

      return gen_appx_api(tree_context, treeNode)

    } else if (treeNode.data._type === 'appx/route') {

      return gen_appx_route(tree_context, treeNode)

    } else if (treeNode.data._type === '/') {

      return {
        ref: null,
        data: null
      }

    } else {

      throw new Error(`ERROR: unrecognized treeNode.data._type [${treeNode.data._type}] [${JSON.stringify(treeNode.data)}]`)
    }
  } catch (err) {
    console.error(err)
    throw err
  }
}
*/

// parse tree data
function parse_tree_node(tree_context, treeNode) {

  if (!treeNode) {
    return {
      ref: null,
      data: null,
    }
  }

  // child_context
  const child_context = {
    ...tree_context,
    topLevel: false,
  }

  // topLevel
  if (tree_context.topLevel) {
    // top level must be array
    if (Array.isArray(treeNode)) {
      // return result as object
      const result = {}
      treeNode.map(child => {
        // ignore '/' node
        if (child.key === '/') {
          return
        }
        // process each child
        const childResult = parse_tree_node(
          child_context,
          child
        )
        // add child to result
        if (!!child.data._ref) {
          result[child.data._ref] = childResult
        }
      })
      // log
      console.log(`result`, result)
      // return
      return {
        ref: null,
        data: result,
      }
    } else {
      return {
        ref: treeNode.data._ref,
        data: parse_tree_node(child_context, treeNode),
      }
    }
  }

  // we are here if we are not top level
  if (!treeNode.data?._type) {
    throw new Error(`ERROR: missing tree node type`)
  } else if (! (treeNode.data._type in globalThis.appx.SPEC.types)) {
    throw new Error(`ERROR: unrecognized tree node type [${treeNode.data._type}]`)
  }

  // get spec
  const classes = globalThis.appx.SPEC.classes
  const spec = globalThis.appx.SPEC.types[treeNode.data._type]

  // create evaluation variables
  // thisNode
  const thisNode = treeNode
  // thisData
  let thisData = {
    _type: treeNode.data._type
  }

  // process children (not including '*')
  spec.children.map((childSpec) => {

    function _process_this(_ref, node) {
      // update data if _thisNode is defined
      if (!!childSpec._thisNode) {
        // no need to check conditional
        // if (!!childSpec._thisNode.condition && ! eval(childSpec._thisNode.condition)) {
        //  // condition evaluated to false
        // } else {
        // }
        // parse data
        if (!!childSpec._thisNode.parse) {
          return eval(childSpec._thisNode.parse)
        } else if (!!childSpec._thisNode.array) {
          throw new Error(`ERROR: array type missing parse method [${JSON.stringify(childSpec._thisNode)}]`)
        } else if (childSpec._thisNode.input === 'js/string') {
          return String(node.data[_ref])
        } else if (childSpec._thisNode.input === 'js/number') {
          return Number(node.data[_ref])
        } else if (childSpec._thisNode.input === 'js/boolean') {
          return Boolean(node.data[_ref])
        } else if (childSpec._thisNode.input === 'js/null') {
          return null
        } else if (childSpec._thisNode.input === 'js/expression') {
          return String(node.data[_ref])
        } else if (childSpec._thisNode.input === 'js/import') {
          return String(node.data[_ref])
        } else if (childSpec._thisNode.input === 'js/statement') {
          return String(node.data[_ref])
        } else {
          throw new Error(`ERROR: node type [${childSpec._thisNode.input}] missing generate method [${JSON.stringify(childSpec._thisNode)}]`)
        }
      }
    }

    function _process_child(node) {
      // node data
      const nodeData = node.data
      // parse function
      const parse = (node) => {
        return parse_tree_node(child_context, node)
      }

      // update data if _childNode is defined
      if (!!childSpec._childNode) {
        // if (!!childSpec._childNode.condition && ! eval(childSpec._childNode.condition)) {
        //  // condition evaluated to false
        // } else {
        // }
        // console.log(`childSpec._childNode`, childSpec._childNode)
        // parse child node
        if (!!childSpec._childNode.array) {
          // console.log(`childSpec._childNode [array]`, childSpec._childNode)
          // check parse definition
          if (!!childSpec._childNode.parse) {
            // console.log(childSpec._childNode.parse)
            const children = eval(childSpec._childNode.parse)
            // console.log(`children`, children)
            return children
          } else {
            throw new Error(`ERROR: child node array missing parse method [${JSON.stringify(childSpec._childNode)}]`)
          }

        } else {
          // check parse definition
          if (!!childSpec._childNode.parse) {
            // parse child node
            const child = eval(childSpec._childNode.parse)
            return child
          } else {
            const child = parse_tree_node(child_context, node)
            return child
          }
        }
      }
    }

    let _ref = childSpec.name
    let data = undefined
    if (childSpec.name === '*') {

      thisNode.children.map(childNode => {
        // ignore _type
        if (childNode.data?._ref === '_type') {
          return
        }
        // process child node
        try {
          _ref = childNode.data._ref
          thisData[_ref] = _process_child(childNode)
        } catch (err) {
          console.error(err)
          throw err
        }
      })

    } else {

      try {
        // get _ref
        const _ref = childSpec.name
        // process this
        data = _process_this(_ref, thisNode)
        // get childNode
        const childNode = lookup_child_by_ref(thisNode, _ref)
        if (!!childNode) {
          // process child node if exists
          data = _process_child(childNode)
        } else if (!!childSpec._childNode && !!childSpec._childNode.array) {
          // console.log(`childNode`, thisNode, _ref)
          data = _process_child(thisNode)
        }
      } catch (err) {
        console.error(err)
        throw err
      }

      // check if data exist
      if (data === undefined) {
        if (!!childSpec.optional) {
          // ignore optional node
        } else {
          throw new Error(`ERROR: [${thisNode.data?._type}] missing [${_ref}] [${JSON.stringify(thisNode.data)}]`)
        }
      }
    }

    if (thisNode.data._type === 'js/array') {
      // console.log(`js/array`, data)
      thisData = data || [] // special handling for js/array
    } else if (data !== undefined) {
      thisData[_ref] = data
    }
  })

  if (thisData._type === 'js/object') {
    delete thisData._type
  } else if (thisData._type === 'js/string') {
    return String(thisData.data)
  } else if (thisData._type === 'js/number') {
    return Number(thisData.data)
  } else if (thisData._type === 'js/boolean') {
    return Boolean(thisData.data)
  } else if (thisData._type === 'js/null') {
    return null
  }

  // console.log(thisData)
  return thisData
}

export {
  tree_traverse,
  tree_lookup,
  parse_tree_node,
  lookup_child_by_ref,
  remove_child_by_ref,
}
