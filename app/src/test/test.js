(
  name,
  dataExpression,
  propsExpression,
  styleExpression,
  columnExpression,
  toolbarExpression,
  subComponentExpression
) => {
  // styles element

const tableStyles = $I('@material-ui/core.makeStyles')((theme) => ({

div: {
  padding: theme.spacing(1),
  /* These styles are suggested for the table fill all available space in its containing element */
  display: 'block',
  /* These styles are required for a horizontaly scrollable table overflow */
  overflow: 'auto',
},

table: {
  borderSpacing: 0,
  padding: theme.spacing(2)
  // borderTop: '1px',
  // borderTopStyle: 'solid',
  // borderTopColor: theme.palette.divider,
},

thead: {
  /* These styles are required for a scrollable body to align with the header properly */
  overflowY: 'auto',
  overflowX: 'hidden',
},

tbody: {
  /* These styles are required for a scrollable table body */
  overflowY: 'scroll',
  overflowX: 'hidden',
  height: '100%',
},

tr: {
  borderBottom: '1px',
  borderBottomStyle: 'solid',
  borderBottomColor: theme.palette.divider,
  '&:hover': {
    backgroundColor: theme.palette.action.selected,
  }
},

th: {
  margin: theme.spacing(0),
  padding: theme.spacing(1),
  /* we use an absolutely position resizer, so this is required. */
  position: 'relative',
  // borderRight: '1px solid black',
  // ':last-child': {
  //   borderRight: 0
  // }
},

td: {
  margin: theme.spacing(0),
  padding: theme.spacing(1),
  overflowY: 'auto',
  overflowX: 'hidden',
  // borderRight: '1px solid black',
  // ':last-child': {
  //   borderRight: 0
  // }
},

sorter: {
  right: theme.spacing(1),
  position: 'absolute',
  zIndex: 1,
  /* prevents from scrolling while dragging on touch devices */
  touchAction: ':none',
},

resizer: {
  right: 0,
  background: theme.palette.divider,
  width: theme.spacing(0.25),
  height: '30%',
  position: 'absolute',
  top: '15%',
  zIndex: 1,
  /* prevents from scrolling while dragging on touch devices */
  touchAction: ':none',
},

tool: {
  margin: theme.spacing(2)
},
}))()

  // GlobalFilter element

const GlobalFilter = $I('react.useCallback')(({
preGlobalFilteredRows,
globalFilter,
setGlobalFilter,
className,
}) => {
const count = preGlobalFilteredRows.length
const [value, setValue] = $I('react.useState')(globalFilter)
const onChange = $I('react-table.useAsyncDebounce')(value => {
  setGlobalFilter(value || undefined)
}, 300)

return (
  <$J $I="@material-ui/core.TextField"
        className={className}
        size="small"
        value={value || ""}
        onChange={e => {
          setValue(e.target.value)
          onChange(e.target.value)
        }}
        InputProps={{
          startAdornment:
            <$J $I="@material-ui/core.InputAdornment" position="start">
              <$J $I="@material-ui/icons.SearchOutlined" fontSize="small" />
            </$J>
        }}
        // helperText={`Search ${count} records...`}
  />
)
}, [])

  // DefaultColumnFilter element

function DefaultColumnFilter({
column: { filterValue, preFilteredRows, setFilter },
}) {
const count = preFilteredRows.length

return (
  <$J $I="@material-ui/core.TextField"
      fullWidth={true}
      size="small"
      value={filterValue || ''}
      onChange={e => {
        // Set undefined to remove the filter entirely
        setFilter(e.target.value || undefined)
      }}
  />
)
}

  // render row element

const renderRowSubComponent = $I('react.useCallback')(
({row}) => {
  return (
    [object Object]
  )
},
[]
)

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
  const dataExpr = $I('react.useMemo')(() => dataExpression, [dataExpression])
  // useTable hook
  const useTableProps = $I('react-table.useTable') (
    {
      columns,
      data: dataExpr,
      defaultColumn,
      initialState: { pageSize: 10 },
    },
    $I('react-table.useFilters'),
    $I('react-table.useGlobalFilter'),
    $I('react-table.useSortBy'),
    $I('react-table.useResizeColumns'),
    $I('react-table.useFlexLayout'),
    $I('react-table.useExpanded'),
    $I('react-table.usePagination'),
    $I('react-table.useRowSelect'),
  )
  // console.log('useTableProps', useTableProps)
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    footerGroups,
    data,
    page,
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
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize, expanded },
  } = useTableProps
  // menu and anchorEl
  const columnIconRef = React.createRef()
  const [anchorEl, setAnchorEl] = React.useState(null)
  // console.log('rows', rows, 'allColumns', allColumns)
  // return
  return (

<div
    {...propsExpression}
    style={styleExpression}
>
<$J $I='@material-ui/core.Toolbar'
  disableGutters={true}
  >
  <$J $L="$local.GlobalFilter"
        preGlobalFilteredRows={preGlobalFilteredRows}
        globalFilter={state.globalFilter}
        setGlobalFilter={setGlobalFilter}
        className={tableStyles.tool}
    >
  </$J>
  <$J $I='@material-ui/core.Box'
    flexGrow={1}
    >
  </$J>
  <$J $I='@material-ui/core.Box'
    display='flex'
    className={tableStyles.tool}
    >
    {
      toolbarExpression
    }
    <$J $I="react-csv.CSVLink"
      filename={"ui_deployments.csv"}
      data={rows.map(row => allColumns.map(column => {
        const result = !!column.accessor ? column.accessor(row.original) : ''
        if (typeof result === 'string') {
          return result.replaceAll('"', '""')
        } else {
          return result
        }
        })
      )}
      headers={allColumns.map(column => column.Header || column.id)}
      >
      <$J $I="@material-ui/core.IconButton"
        size="medium"
        color={props.color}
        style={{boxShadow: 'none'}}
        >
        <$J $I="@material-ui/icons.GetAppOutlined" />
      </$J>
    </$J>
    <$J $I="@material-ui/core.IconButton"
      ref={columnIconRef}
      size="medium"
      color={props.color}
      style={{boxShadow: 'none'}}
      onClick={e => {
        // setAnchorEl(e.target)
        setAnchorEl(columnIconRef.current)
      }}
      >
      <$J $I="@material-ui/icons.ViewColumnOutlined" />
    </$J>
  </$J>
  <$J $I='@material-ui/core.Popover'
    anchorEl={anchorEl}
    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
    id="column-selector-ui_deployments"
    keepMounted
    open={Boolean(anchorEl)}
    onClose={e => setAnchorEl(null)}
  >
    {
      allColumns.map(column => (
        <$J $I='@material-ui/core.ListItem'
            key={column.id}
            dense={true}
            button={true}
          >
          <$J $I='@material-ui/core.FormControlLabel'
            control={
              <$J $I='@material-ui/core.Checkbox'
                  size="small"
                  {...column.getToggleHiddenProps()}
              />
            }
            label={column.Header || column.id}
          />
        </$J>
      ))
    }
  </$J>
</$J>
<div
    {...getTableProps()}
    className={tableStyles.table}
    // stickyHeader={true}
  >
  <div
    className={tableStyles.thead}
    >
    {
      headerGroups.map(headerGroup => {
        return (
          <div
              {...headerGroup.getHeaderGroupProps()}
              // className={tableStyles.tr}
            >
            {
              headerGroup.headers.map(column => {
                return (
                  <div
                      {...column.getHeaderProps()}
                      className={tableStyles.th}
                    >
                    <$J $I="@material-ui/core.Box"
                        display="flex"
                        justifyContent="center"
                        // {...column.getHeaderProps(column.getSortByToggleProps())}
                        {...column.getSortByToggleProps()}
                      >
                      {
                        column.render('Header')
                      }
                      {
                        !!column.isSorted
                        &&
                        (
                          column.isSortedDesc
                          ? <div className={tableStyles.sorter}>
                              <$J $I="@material-ui/icons.ExpandMore" />
                            </div>
                          : <div className={tableStyles.sorter}>
                              <$J $I="@material-ui/icons.ExpandLess" />
                            </div>
                        )
                      }
                    </$J>
                    <div>
                    {
                      column.canFilter ? column.render('Filter') : null
                    }
                    </div>
                    <$J $I="@material-ui/core.Divider"
                        orientation="vertical"
                        flexItem
                    />
                    {/* Use column.getResizerProps to hook up the events correctly */}
                    {
                      column.canResize
                      &&
                      (
                        <div
                          {...column.getResizerProps()}
                          className={tableStyles.resizer}
                        />
                      )
                    }
                  </div>
                )
              })
            }
          </div>
        )
      })
    }
  </div>
  <div
      {...getTableBodyProps()}
      className={tableStyles.tbody}
    >
    {
      page.map((row, index) => {
        prepareRow(row)
        return (
          <div
            className={tableStyles.tr}
            >
            <div
              {...row.getRowProps()}
              className={tableStyles.tr}
              >
              {
                row.cells.map(cell => {
                  return (
                    <div
                        {...cell.getCellProps()}
                        className={tableStyles.td}
                      >
                      <$J $I="@material-ui/core.Box"
                          {...row.getToggleRowExpandedProps()}
                          width="100%"
                          height="100%"
                        >
                        {
                          cell.render('Cell')
                        }
                      </$J>
                    </div>
                  )
                })
              }
            </div>
            {
              !!row.isExpanded
              &&
              (
                <div
                  {...row.getRowProps()}
                  >
                  {$L('$local.renderRowSubComponent')({row})}
                </div>
              )
            }
          </div>
        )
      })
    }
  </div>
  <div
    className={tableStyles.thead}
    >
    {
      footerGroups.map(footerGroup => {
        return (
          <div
              {...footerGroup.getFooterGroupProps()}
              // className={tableStyles.tr}
            >
            {
              footerGroup.headers.map(column => {
                return (
                  <div
                      {...column.getFooterProps()}
                      className={tableStyles.td}
                    >
                    {
                      column.render('Footer')
                    }
                  </div>
                )
              })
            }
          </div>
        )
      })
    }
  </div>
</div>
<$J $I='@material-ui/core.Toolbar'
  disableGutters={true}
  >
  <$J $I='@material-ui/core.Typography'
    className={tableStyles.tool}
    variant="body2"
    >
    Showing {rows.length} of {data.length} rows
  </$J>
  <$J $I='@material-ui/core.Box'
    flexGrow={1}
    >
  </$J>
  <$J $I='@material-ui/core.TextField'
    size="small"
    select={true}
    value={pageSize}
    className={tableStyles.tool}
    onChange={e => setPageSize(e.target.value)}
    >
    <$J $I='@material-ui/core.ListItem' value={10}>10 per page</$J>
    <$J $I='@material-ui/core.ListItem' value={20}>20 per page</$J>
    <$J $I='@material-ui/core.ListItem' value={50}>50 per page</$J>
    <$J $I='@material-ui/core.ListItem' value={100}>100 per page</$J>
  </$J>
  <$J $I='@material-ui/lab.Pagination'
    className={tableStyles.tool}
    color={props.color}
    count={pageCount}
    showFirstButton={true}
    showLastButton={true}
    page={pageIndex+1}
    onChange={(event, value) => {
      gotoPage(value-1)
    }}
    >
  </$J>
</$J>
</div>

  )
}
