import React, { useState, useContext, useEffect, useCallback, useMemo } from "react"
import PropTypes from 'prop-types'
import {
  useTable,
  useFilters,
  useGlobalFilter,
  useSortBy,
  useResizeColumns,
  useFlexLayout,
  useExpanded,
  usePagination,
  useRowSelect,
  useAsyncDebounce,
} from 'react-table'
import {
  Box,
  Toolbar,
  ListItem,
  TextField,
  IconButton,
  Divider,
  Popover,
  Checkbox,
  Typography,
  FormControlLabel,
  InputAdornment,
  makeStyles,
  useTheme,
} from '@material-ui/core'
import {
  Pagination,
} from '@material-ui/lab'
import {
  GetAppOutlined,
  ViewColumnOutlined,
  ExpandLess,
  ExpandMore,
  SearchOutlined,
} from '@material-ui/icons'
import { CSVLink, CSVDownload } from "react-csv"
import _ from 'lodash'

const Table = (props) => {
  // theme
  const theme = useTheme()
  // make styles
  const styles = makeStyles((theme) => ({

    div: {
      // margin: theme.spacing(0),
      // padding: theme.spacing(1),
      /* These styles are suggested for the table fill all available space in its containing element */
      display: 'block',
      /* These styles are required for a horizontaly scrollable table overflow */
      overflow: 'auto',
    },

    table: {
      borderSpacing: 0,
      // padding: theme.spacing(2),
      padding: props.margin === 'dense' ? theme.spacing(1, 2) : theme.spacing(2)
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
      padding: props.margin === 'dense' ? theme.spacing(0, 1) : theme.spacing(1),
      /* use an absolute position resizer, so this is required. */
      position: 'relative',
    },

    td: {
      margin: theme.spacing(0),
      padding: props.margin === 'dense' ? theme.spacing(0, 1) : theme.spacing(1),
      overflowY: 'auto',
      overflowX: 'hidden',
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

    toolbar: {
      padding: props.margin === 'dense' ? theme.spacing(0, 1) : theme.spacing(0, 2)
    },

    tool: {
      margin: props.margin === 'dense' ? theme.spacing(0, 1) : theme.spacing(0, 0)
    },
  }))()

  // global filter widget
  const GlobalFilter = useCallback(({
    preGlobalFilteredRows,
    globalFilter,
    setGlobalFilter,
    className,
  }) => {
    const count = preGlobalFilteredRows.length
    const [value, setValue] = useState(globalFilter)
    const onChange = useAsyncDebounce(value => {
      setGlobalFilter(value || undefined)
    }, 300)

    return (
      <TextField
        className={className}
        color={props.color || 'primary'}
        size="small"
        // size={props.margin === 'dense' ? "small" : "normal"}
        value={value || ""}
        onChange={e => {
          setValue(e.target.value)
          onChange(e.target.value)
        }}
        InputProps={{
          startAdornment:
            <InputAdornment position="start">
              <SearchOutlined fontSize="small" />
            </InputAdornment>
        }}
        // helperText={\`Search \${count} records...\`}
      />
    )
  }, [])

  // column filter widget
  const DefaultColumnFilter = ({
    column: { filterValue, preFilteredRows, setFilter },
  }) => {
    const count = preFilteredRows.length

    return (
      <TextField
        fullWidth={true}
        color={props.color || 'primary'}
        size="small"
        value={filterValue || ''}
        onChange={e => {
          // Set undefined to remove the filter entirely
          setFilter(e.target.value || undefined)
        }}
      />
    )
  }

  /*
  // rowPanel widget need to convert to react hooks
  const renderRowPanel = useCallback(({row}) => {
    // console.log(`props.rowPanel`, props.rowPanel)
    const RowPanel = props.rowPanel || (() => null)
    return (
      <RowPanel
        row={row}
        />
    )
  }, [])
  */

  // rowPanel widget need to convert to react hooks
  const renderRowPanel = ({row}) => {
    // console.log(`props.rowPanel`, props.rowPanel)
    const RowPanel = props.rowPanel || (() => null)
    return (
      <RowPanel
        row={row}
        />
    )
  }

  // defaultColumn
  const defaultColumn = useMemo(
    () => ({
      // set up default Filter UI
      Filter: DefaultColumnFilter,
    }),
    []
  )

  // prepare props
  const columns = useMemo(() => props.columns || [], [props.columns])
  const dataExpr = useMemo(() => props.data || [], [props.data])
  // useTable hook
  const useTableProps = useTable(
    {
      columns: columns,
      data: dataExpr,
      defaultColumn: defaultColumn,
      initialState: { pageSize: props.defaultPageSize || 10 },
    },
    useFilters,
    useGlobalFilter,
    useSortBy,
    useResizeColumns,
    useFlexLayout,
    useExpanded,
    usePagination,
    useRowSelect,
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
      className={props.className}
      style={props.style || {}}
      >
      {
        !props.hideToolbar
        &&
        (
          <Toolbar
            disableGutters={true}
            className={styles.toolbar}
            >
            <GlobalFilter
              preGlobalFilteredRows={preGlobalFilteredRows}
              globalFilter={state.globalFilter}
              setGlobalFilter={setGlobalFilter}
              className={styles.tool}
              >
            </GlobalFilter>
            <Box flexGrow={1}>
            </Box>
            <Box
              display='flex'
              >
              {
                props.tools
              }
              <CSVLink
                className={styles.tool}
                filename={`Table.csv`}
                data={rows.map(row =>
                  allColumns.map(column => {
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
                <IconButton
                  size={props.margin === 'dense' ? "small" : "medium"}
                  color={props.color}
                  style={{boxShadow: 'none'}}
                  >
                  <GetAppOutlined />
                </IconButton>
              </CSVLink>
              <IconButton
                ref={columnIconRef}
                size={props.margin === 'dense' ? "small" : "medium"}
                color={props.color}
                className={styles.tool}
                style={{boxShadow: 'none'}}
                onClick={e => {
                  // setAnchorEl(e.target)
                  setAnchorEl(columnIconRef.current)
                }}
                >
                <ViewColumnOutlined />
              </IconButton>
            </Box>
            <Popover
              anchorEl={anchorEl}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              id={`column-selector-Table`}
              keepMounted
              open={Boolean(anchorEl)}
              onClose={e => setAnchorEl(null)}
            >
              {
                allColumns.map(column => (
                  <ListItem
                    key={column.id}
                    dense={true}
                    button={true}
                    >
                    <FormControlLabel
                      control={
                        <Checkbox
                            size="small"
                            {...column.getToggleHiddenProps()}
                        />
                      }
                      label={column.Header || column.id}
                    />
                  </ListItem>
                ))
              }
            </Popover>
          </Toolbar>
        )
      }
      <div
        {...getTableProps()}
        className={styles.table}
        >
        {
          !props.hideHeader
          &&
          (
            <div
              className={styles.thead}
              >
              {
                headerGroups.map(headerGroup => {
                  return (
                    <div
                      {...headerGroup.getHeaderGroupProps()}
                      // className={styles.tr}
                      >
                      {
                        headerGroup.headers.map(column => {
                          return (
                            <div
                              {...column.getHeaderProps()}
                              className={styles.th}
                              >
                              <Box
                                display="flex"
                                justifyContent="center"
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
                                    ? <div className={styles.sorter}>
                                        <ExpandMore />
                                      </div>
                                    : <div className={styles.sorter}>
                                        <ExpandLess />
                                      </div>
                                  )
                                }
                              </Box>
                              <div>
                              {
                                column.canFilter ? column.render('Filter') : null
                              }
                              </div>
                              <Divider
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
                                    className={styles.resizer}
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
          )
        }
        <div
            {...getTableBodyProps()}
            className={styles.tbody}
          >
          {
            page.map((row, index) => {
              prepareRow(row)
              return (
                <div
                  key={row.id}
                  >
                  <div
                    {...row.getRowProps()}
                    className={styles.tr}
                    >
                    {
                      row.cells.map(cell => {
                        return (
                          <div
                              {...cell.getCellProps()}
                              className={styles.td}
                            >
                            <Box
                              {...row.getToggleRowExpandedProps()}
                              display="flex"
                              justifyContent="center"
                              alignItems="center"
                              width="100%"
                              height="100%"
                              >
                              {
                                cell.render('Cell')
                              }
                            </Box>
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
                        key="expanded"
                        >
                        {renderRowPanel({row})}
                      </div>
                    )
                  }
                </div>
              )
            })
          }
        </div>
        {
          !!props.showFooter
          &&
          (
            <div
              className={styles.thead}
              >
              {
                footerGroups.map(footerGroup => {
                  return (
                    <div
                        {...footerGroup.getFooterGroupProps()}
                        // className={styles.tr}
                      >
                      {
                        footerGroup.headers.map(column => {
                          return (
                            <div
                                {...column.getFooterProps()}
                                className={styles.td}
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
          )
        }
      </div>
      {
        !props.hidePagination
        &&
        (
          <Toolbar
            disableGutters={true}
            className={styles.toolbar}
            >
            <Typography
              className={styles.tool}
              variant="body2"
              >
              Showing {rows.length} of {data.length} rows
            </Typography>
            <Box
              flexGrow={1}
              >
            </Box>
            <TextField
              color={props.color || 'primary'}
              size="small"
              select={true}
              value={pageSize}
              className={styles.tool}
              onChange={e => setPageSize(e.target.value)}
              >
              <ListItem value={10}>10 per page</ListItem>
              <ListItem value={20}>20 per page</ListItem>
              <ListItem value={50}>50 per page</ListItem>
              <ListItem value={100}>100 per page</ListItem>
            </TextField>
            <Pagination
              className={styles.tool}
              color={props.color}
              count={pageCount}
              showFirstButton={true}
              showLastButton={true}
              page={pageIndex+1}
              size="small"
              onChange={(event, value) => {
                gotoPage(value-1)
              }}
              >
            </Pagination>
          </Toolbar>
        )
      }
    </div>
  )
}

Table.propTypes = {
  data: PropTypes.array,
  columns: PropTypes.array,
  tools: PropTypes.element,
  rowPanel: PropTypes.func,
  className: PropTypes.string,
  style: PropTypes.object,
  color: PropTypes.string,
  hideToolbar: PropTypes.bool,
  hidePagination: PropTypes.bool,
  hideHeader: PropTypes.bool,
  showFooter: PropTypes.bool,
  defaultPageSize: PropTypes.number,
}

Table.appxType = 'appx/table'

export default Table
