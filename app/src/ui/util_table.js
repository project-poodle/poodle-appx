const { parse, parseExpression } = require('@babel/parser')
const generate = require('@babel/generator').default
const t = require("@babel/types")
const {
  PATH_SEPARATOR,
  VARIABLE_SEPARATOR,
  SPECIAL_CHARACTER,
  JSX_CONTEXT,
  INPUT_REQUIRED,
  TOKEN_IMPORT,
  TOKEN_LOCAL,
  TOKEN_JSX,
  TOKEN_NAME,
  isPrimitive,
  capitalize,
  reg_js_import,
  reg_js_variable,
  reg_react_table,
  js_resolve_ids,
  _js_parse_snippet,
  _js_parse_statements,
  _js_parse_expression,
  _parse_var_full_path,
} = require('./util_base')

const REACT_TABLE_METHODS = [
  'getTableProps',
  'getTableBodyProps',
  'headerGroups',
  'rows',
  'prepareRow',
]

////////////////////////////////////////////////////////////////////////////////
// create react/form ast
function react_table(js_context, ref, input) {

  // require here to avoid circular require reference
  const { js_process, react_element_style } = require('./util_code')

  if (!('_type' in input) || input._type !== 'react/table') {
    throw new Error(`ERROR: input._type is not [react/table] [${input._type}] [${JSON.stringify(input)}]`)
  }

  if (!input.name) {
    throw new Error(`ERROR: input.name not set in [react/table] [${JSON.stringify(input)}]`)
  }

  //////////////////////////////////////////////////////////////////////
  // register import
  reg_js_import(js_context, 'react-table.useTable')
  // register react hook form with [input.name]
  const qualifiedName = `react-table.useTable.${input.name}`
  reg_js_variable(js_context, qualifiedName)
  // register form
  // reg_react_table(js_context, input.name, qualifiedName, tableProps)
  // console.log(`js_context.reactForm`, js_context.reactForm)
  // register variables
  REACT_TABLE_METHODS.map(method => {
    reg_js_variable(js_context, `${qualifiedName}.${method}`)
  })

  //////////////////////////////////////////////////////////////////////
  // start processing after registering table
  // process name
  const nameExpression = (() => {
    if (isPrimitive(input.name)) {
      return t.stringLiteral(String(input.name))
    } else {
      throw new Error(`ERROR: [react/table] input.name is not string [${JSON.stringify(input.name)}]`)
    }
  })()

  // process input expression
  const dataExpression = (() => {
    if (!!input.data) {
      return js_process(              // process data if exists
        {
          ...js_context,
          JSX_CONTEXT: false,
          STATEMENT_CONTEXT: false,
        },
        null,
        input.data
      )
    } else {
      return t.arrayExpression([])
    }
  })()

  // props expression
  const propsExpression = (() => {
    if (!!input.props) {
      return js_process(
        {
          ...js_context,
          JSX_CONTEXT: false,
          STATEMENT_CONTEXT: false,
        },
        null,
        input.props
      )
    } else {
      // return {}
      return t.objectExpression([])
    }
  })()

  // process style
  const styleExpression = (() => {
    if (!!input.style) {
      const style = react_element_style(
        {
          ...js_context,
          JSX_CONTEXT: false,
          STATEMENT_CONTEXT: false,
        },
        input.style
      )
      return style
    } else {
      return t.objectExpression(
        []
      )
    }
  })()

  // columnProps expression
  const columnPropsExpression = (() => {
    if (!!input.columnProps) {
      if (!Array.isArray(input.columnProps)) {
        throw new Error(`ERROR: input.columnProps is not array [${JSON.stringify(input)}]`)
      }
      const result = input.columnProps.map(column => {
        return js_process(
          {
            ...js_context,
            JSX_CONTEXT: false,
            STATEMENT_CONTEXT: false,
          },
          null,
          column
        )
      })
      // array expression
      return t.arrayExpression(
        result
      )
    } else {
      // return []
      return t.arrayExpression([])
    }
  })()

  //////////////////////////////////////////////////////////////////////
  const tableElement = `
    <$JSX $NAME="@material-ui/core.Table" {...getTableProps()}>
      <$JSX $NAME="@material-ui/core.TableHead">
        {
          headerGroups.map(headerGroup => {
            return (
              <$JSX $NAME="@material-ui/core.TableRow" {...headerGroup.getHeaderGroupProps()}>
                {
                  headerGroup.headers.map(column => {
                    return (
                      <$JSX $NAME="@material-ui/core.TableCell" {...column.getHeaderProps()}>
                        {
                          column.render('Header')
                        }
                      </$JSX>
                    )
                  })
                }
              </$JSX>
            )
          })
        }
      </$JSX>
      <$JSX $NAME="@material-ui/core.TableBody">
        {
          rows.map((row, index) => {
            prepareRow(row)
            return (
              <$JSX $NAME="@material-ui/core.TableRow" {...row.getRowProps()}>
                {
                  row.cells.map(cell => {
                    return (
                      <$JSX $NAME="@material-ui/core.TableCell" {...cell.getCellProps()}>
                        {
                          cell.render('Cell')
                        }
                      </$JSX>
                    )
                  })
                }
              </$JSX>
            )
          })
        }
      </$JSX>
    </$JSX>
  `

  //////////////////////////////////////////////////////////////////////
  const resultElement = t.callExpression(
    _js_parse_expression(
      js_context,
      `
      (name, dataExpression, propsExpression, styleExpression, columnExpression) => {
        // prepare props
        const columns = $I('react.useMemo')(() => columnExpression)
        const data = $I('react.useMemo')(() => dataExpression)
        // useTable hook
        const {
          getTableProps,
          headerGroups,
          rows,
          prepareRow
        } = $I('react-table.useTable') ({
          columns,
          data,
        })
        // return
        return (
          ${tableElement}
        )
      }
      `,
      {
        plugins: [
          'jsx', // support jsx here
        ]
      }
    ),
    [
      nameExpression,
      dataExpression,
      propsExpression,
      styleExpression,
      columnPropsExpression,
    ]
  )

  //////////////////////////////////////////////////////////////////////
  // check for JSX_CONTEXT and return
  if (js_context.JSX_CONTEXT) {
    return t.jSXExpressionContainer(
      resultElement
    )
  } else {
    return resultElement
  }
}

////////////////////////////////////////////////////////////////////////////////
// process table_column ast
function table_column(js_context, ref, input) {

  // require here to avoid circular require reference
  const { js_process } = require('./util_code')

  if (!('_type' in input) || input._type !== 'table/column') {
    throw new Error(`ERROR: input._type is not [table/column] [${input._type}] [${JSON.stringify(input)}]`)
  }

  if (!input.columns) {
    throw new Error(`ERROR: [table/column] missing input.columns [${JSON.stringify(input)}]`)
  }

  if (!Array.isArray(input.columns)) {
    throw new Error(`ERROR: [table/column] input.columns is not Array [${JSON.stringify(input)}]`)
  }

  const columnsExpression = (() => {
    // return array
    return t.arrayExpression(
      input.columns.map(column => {
        if (!column) {
          throw new Error(`ERROR: [table/column] column is empty [${JSON.stringify(column)}]`)
        } else if (typeof column !== 'object') {
          throw new Error(`ERROR: [table/column] column is not object [${JSON.stringify(column)}]`)
        } else if (!column.accessor) {
          throw new Error(`ERROR: [table/column] column missing [accessor] [${JSON.stringify(column)}]`)
        }
        return js_process(
          {
            ...js_context,
            JSX_CONTEXT: false,
            STATEMENT_CONTEXT: false,
          },
          null,
          column
        )
      })
    )
  })()

  // result
  const resultExpression = (() => {
    if (!!input.Header) {
      return t.objectExpression(
        [
          t.objectProperty(
            t.identifier('Header'),
            js_process(
              {
                ...js_context,
                JSX_CONTEXT: false,
                STATEMENT_CONTEXT: false,
              },
              null,
              input.Header
            )
          ),
          t.objectProperty(
            t.identifier('columns'),
            columnsExpression
          )
        ]
      )
    } else {
      return t.objectExpression(
        [
          t.objectProperty(
            t.identifier('columns'),
            columnsExpression
          )
        ]
      )
    }
  })()

  // return
  return resultExpression
}

////////////////////////////////////////////////////////////////////////////////
// export
module.exports = {
  react_table: react_table,
  table_column: table_column,
}
