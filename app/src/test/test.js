(name, dataExpression, propsExpression, styleExpression, columnExpression) => {
  // styles element

const styles = $I('@material-ui/core.makeStyles')((theme) => ({

div: {
  padding: theme.spacing(1),
  /* These styles are suggested for the table fill all available space in its containing element */
  display: block,
  /* These styles are required for a horizontaly scrollable table overflow */
  overflow: auto,
},

table: {
  borderSpacing: 0,
  border: '1px solid black'
},

thead: {
  /* These styles are required for a scrollable body to align with the header properly */
  overflowY: auto,
  overflowX: hidden,
},

tbody: {
  /* These styles are required for a scrollable table body */
  overflowY: 'scroll',
  overflowX: 'hidden',
  height: '250px',
},

tr: {
  ':last-child': {
    td: {
      borderBottom: 0,
    }
  },
  borderBottom: '1px solid black'
},

th: {
  margin: 0,
  padding: theme.spacing(0.5),
  borderRight: '1px solid black',

  /* In this example we use an absolutely position resizer, so this is required. */
  position: 'relative',

  ':last-child': {
    borderRight: 0
  },

  resizer: {
    right: 0,
    background: 'blue',
    width: 10,
    height: '100%',
    position: 'absolute',
    top: 0;
    zIndex: 1;
    /* prevents from scrolling while dragging on touch devices */
    touchAction: ':none',
  }
}
}))()

  // GlobalFilter element

function GlobalFilter({
preGlobalFilteredRows,
globalFilter,
setGlobalFilter,
}) {
const count = preGlobalFilteredRows.length
const [value, setValue] = $I('react.useState')(globalFilter)
const onChange = $I('react-table.useAsyncDebounce')(value => {
  setGlobalFilter(value || undefined)
}, 500)

return (
  <$JSX $I="@material-ui/core.TextField"
        value={value || ""}
        onChange={e => {
          setValue(e.target.value)
          onChange(e.target.value)
        }}
        placeholder={`Search ${count} records...`}
  />
)
}

  // DefaultColumnFilter element

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
    $I('react-table.useResizeColumns'),
    $I('react-table.useFlexLayout'),
    $I('react-table.useRowSelect'),
  )
  // return
  return (

<div
    {...propsExpression}
    style={styleExpression}
>
<$JSX $L="GlobalFilter"
      preGlobalFilteredRows={preGlobalFilteredRows}
      globalFilter={state.globalFilter}
      setGlobalFilter={setGlobalFilter}
  >
</$JSX>
