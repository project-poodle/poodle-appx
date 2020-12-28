////////////////////////////////////////////////////////////////////////////////
// utilities

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


export {
  tree_traverse,
}
