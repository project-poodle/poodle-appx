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
  'footerGroups',
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

  // columns expression
  const columnsExpression = (() => {
    if (!!input.columns) {
      if (!Array.isArray(input.columns)) {
        throw new Error(`ERROR: input.columns is not array [${JSON.stringify(input)}]`)
      }
      const result = input.columns.map(column => {
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

  reg_js_variable(js_context, 'GlobalFilter')

  // global filter
  const globalFilterElement = `
    function GlobalFilter({
      preGlobalFilteredRows,
      globalFilter,
      setGlobalFilter,
    }) {
      const count = preGlobalFilteredRows.length
      const [value, setValue] = $I('react.useState')(globalFilter)
      const onChange = $I('react-table.useAsyncDebounce')(value => {
        setGlobalFilter(value || undefined)
      }, 200)

      return (
        <$JSX $I="@material-ui/core.TextField"
              value={value || ""}
              onChange={e => {
                setValue(e.target.value)
                onChange(e.target.value)
              }}
              placeholder={\`Search \${count} records...\`}
        />
      )
    }
  `

  // Define a default UI for filtering
  const defaultFilterElement = `
    function DefaultColumnFilter({
      column: { filterValue, preFilteredRows, setFilter },
    }) {
      const count = preFilteredRows.length

      return (
        <$JSX $I="@material-ui/core.TextField"
              value={filterValue || ''}
              onChange={e => {
                // Set undefined to remove the filter entirely
                setFilter(e.target.value || undefined)
              }}
        />
      )
    }
  `

  //////////////////////////////////////////////////////////////////////
  const tableElement = `
    <$JSX $I="@material-ui/core.TableContainer"
          {...propsExpression}
          style={styleExpression}
      >
      <$JSX $L="GlobalFilter"
            preGlobalFilteredRows={preGlobalFilteredRows}
            globalFilter={state.globalFilter}
            setGlobalFilter={setGlobalFilter}
        >
      </$JSX>
      <$JSX $I="@material-ui/core.Table"
            {...getTableProps()}
            stickyHeader={true}
        >
        <$JSX $I="@material-ui/core.TableHead">
          {
            headerGroups.map(headerGroup => {
              return (
                <$JSX $I="@material-ui/core.TableRow"
                      {...headerGroup.getHeaderGroupProps()}
                  >
                  {
                    headerGroup.headers.map(column => {
                      return (
                        <$JSX $I="@material-ui/core.TableCell"
                              {...column.getHeaderProps(column.getSortByToggleProps())}
                          >
                          <$JSX $I="@material-ui/core.TableSortLabel"
                                active={column.isSorted}
                                direction={column.isSortedDesc ? 'desc' : 'asc'}
                            >
                            {
                              column.render('Header')
                            }
                          </$JSX>
                          <div>
                          {
                            column.canFilter ? column.render('Filter') : null
                          }
                          </div>
                        </$JSX>
                      )
                    })
                  }
                </$JSX>
              )
            })
          }
        </$JSX>
        <$JSX $I="@material-ui/core.TableBody"
              {...getTableBodyProps()}
          >
          {
            rows.map((row, index) => {
              prepareRow(row)
              return (
                <$JSX $I="@material-ui/core.TableRow"
                      {...row.getRowProps()}
                  >
                  {
                    row.cells.map(cell => {
                      return (
                        <$JSX $I="@material-ui/core.TableCell"
                              {...cell.getCellProps()}
                          >
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
        <$JSX $I="@material-ui/core.TableFooter">
          {
            footerGroups.map(footerGroup => {
              return (
                <$JSX $I="@material-ui/core.TableRow"
                      {...footerGroup.getFooterGroupProps()}
                  >
                  {
                    footerGroup.headers.map(column => {
                      return (
                        <$JSX $I="@material-ui/core.TableCell"
                              {...column.getFooterProps()}
                          >
                          {
                            column.render('Footer')
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
    </$JSX>
  `

  //////////////////////////////////////////////////////////////////////
  const resultElement = t.callExpression(
    _js_parse_expression(
      js_context,
      `
      (name, dataExpression, propsExpression, styleExpression, columnExpression) => {
        // GlobalFilter element
        ${globalFilterElement}
        // DefaultColumnFilter element
        ${defaultFilterElement}
        // defaultColumn
        const defaultColumn = $I('react.useMemo')(
          () => ({
            // Let's set up our default Filter UI
            Filter: DefaultColumnFilter,
          }),
          []
        )
        // prepare props
        const columns = $I('react.useMemo')(() => columnExpression, [])
        const data = $I('react.useMemo')(() => dataExpression, [dataExpression])
        // useTable hook
        const {
          getTableProps,
          getTableBodyProps,
          headerGroups,
          footerGroups,
          rows,
          prepareRow,
          state,
          allColumns,
          visibleColumns,
          setColumnOrder,
          getToggleHideAllColumnsProps,
          preGlobalFilteredRows,
          setGlobalFilter,
          resetResizing,
        } = $I('react-table.useTable') (
          {
            columns,
            data,
            defaultColumn,
          },
          $I('react-table.useFilters'),
          $I('react-table.useGlobalFilter'),
          $I('react-table.useSortBy'),
          $I('react-table.useBlockLayout'),
          $I('react-table.useResizeColumns'),
        )
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
      columnsExpression,
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

  if (!input.id) {
    throw new Error(`ERROR: [table/column] missing input.id [${JSON.stringify(input)}]`)
  }

  // columns expression
  const columnsExpression = (() => {
    if (!!input.columns) {
      if (!Array.isArray(input.columns)) {
        throw new Error(`ERROR: input.columns is not array [${JSON.stringify(input)}]`)
      }
      const result = input.columns.map(column => {
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
      // return null
      return null
    }
  })()

  // result
  const resultExpression = (() => {
    const object_properties = []
    Object.keys(input)
      .filter(key => !key.startsWith('_'))
      .map(key => {
        object_properties.push(
          t.objectProperty(
            t.identifier(key),
            js_process(
              {
                ...js_context,
                JSX_CONTEXT: false,
                STATEMENT_CONTEXT: false,
              },
              null,
              input[key]
            )
          )
        )
      })
    // add column expression if exists
    if (!!columnsExpression) {
      object_properties.push(
        t.objectProperty(
          t.identifier('columns'),
          columnsExpression
        )
      )
    }
    // return
    return t.objectExpression(object_properties)
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
