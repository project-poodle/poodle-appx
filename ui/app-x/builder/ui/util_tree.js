
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

function tree_gen_array(tree_context, treeData) {

  if (!Array.isArray(treeData)) {
    throw new Error(`ERROR: treeData is not array`)
  }

  const result = treeData.map(data => {
    return tree_generate(tree_context, data)
  })

  return result
}

function tree_gen(tree_context, treeData) {

  if (!treeData) {
    return null
  }

  if (Array.isArray(treeData)) {
    return tree_gen_array(tree_context, treeData)
  }

  if (! ('data' in treeData)) {
    throw new Error(`ERROR: missing data in treeData`)
  }

  if (! ('__prop' in treeData.data)) {
    throw new Error(`ERROR: missing __prop in treeData.data`)
  }

  if (!tree_context.ignoreProp && treeData.data.__prop) {
    const result = {}
    result[treeData.data.__prop] = tree_gen(treeData.children)
  } else {

  }
}

export {
  tree_traverse,
  tree_lookup,
  tree_gen,
}
