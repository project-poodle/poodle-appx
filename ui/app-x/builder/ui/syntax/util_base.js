const PATH_SEPARATOR = '/'
const VARIABLE_SEPARATOR = '.'

////////////////////////////////////////////////////////////////////////////////
// primitive test
function isPrimitive(test) {
    return (test !== Object(test))
}

// parse variable full path
function parse_var_full_path(var_full_path) {

  let import_paths = var_full_path.split(PATH_SEPARATOR)
  let sub_vars = import_paths[import_paths.length - 1].split(VARIABLE_SEPARATOR)

  // add first sub_var to import_path
  import_paths[import_paths.length - 1] = sub_vars.shift()

  return {
    full_paths: [].concat(import_paths, sub_vars),
    import_paths: import_paths,
    sub_vars: sub_vars
  }
}

////////////////////////////////////////////////////////////////////////////////

// lookup data type
const lookup_data_type = (data) => {
  // get data type
  let dataType = ''
  if (isPrimitive(data)) {
    switch(typeof data) {
      case 'string':
        return 'js/string'
      case 'number':
        return 'js/number'
      case 'boolean':
        return 'js/boolean'
      case 'undefined':
        return 'js/null'
      case 'object':
        if (data === null)
          return 'js/null'
        else
          throw new Error(`ERROR: unexpected primitive data type [${data}]`)
    }
  }

  if (Array.isArray(data)) {
    return 'js/array'
  }

  if (!data._type) {
    return 'js/object'
  }

  return data._type
}

// enrich_primitive_data
const enrich_primitive_data = (data) => {
  if (isPrimitive(data)) {
    return {
      _type: lookup_data_type(data),
      data: data
    }
  } else {
    return data
  }
}

// check if data type matches the match spec
const type_matches_spec = (type, matchSpec) => {
  // if no class in matchSpec
  if (!matchSpec?.class) {
    return false
  }
  // check classSpec
  if (!globalThis.appx?.SPEC?.classes[matchSpec.class]) {
    return false
  }
  // get classSpec
  const classSpec = globalThis.appx.SPEC.classes[matchSpec.class]
  if (!classSpec.types.includes(type)) {
    return false
  }
  // check includes flag
  if (!!matchSpec.includes) {
    if (!matchSpec.includes.includes(type)) {
      return false
    }
  }
  // check excludes flag
  if (!!matchSpec.excludes) {
    if (matchSpec.excludes.includes(type)) {
      return false
    }
  }
  // we have passed all checks
  return true
}

// check if data type matches the match spec
const data_matches_spec = (data, matchSpec) => {
  const data_type = lookup_data_type(data)
  return type_matches_spec(data_type, matchSpec)
}

export {
  PATH_SEPARATOR,
  VARIABLE_SEPARATOR,
  isPrimitive,
  parse_var_full_path,
  lookup_data_type,
  // enrich_primitive_data,
  type_matches_spec,
  data_matches_spec,
}
