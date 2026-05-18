/* eslint-disable @typescript-eslint/prefer-optional-chain */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable multiline-ternary */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable react/prop-types */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-unused-vars */

/* PAGE: TableUser
========================================================================== */
import React, { useEffect, useState, useMemo } from 'react'
import Select, { MultiValue } from 'react-select'
import { UserWithDoneCourse, DataListUserWithDoneCourse } from 'api/post/post.interface'
import {
  type MRT_ColumnDef,
  useMaterialReactTable,
  //   MRT_TableOptions,
  type MRT_RowSelectionState,
  MRT_PaginationState,
  MRT_GlobalFilterTextField,
  MRT_ShowHideColumnsButton,
  MRT_TableContainer,
  MRT_TablePagination,
  MRT_ToggleDensePaddingButton,
  MRT_ToolbarAlertBanner,
  MRT_ToggleFullScreenButton
} from 'material-react-table'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import SearchIcon from '@mui/icons-material/Search'
import { getCourseDoneDashboard, getCourse, getGroup } from 'api/post/post.api'
import { Box, Button, DialogActions, DialogContent, DialogTitle, IconButton, LinearProgress, Skeleton, Tooltip, Typography } from '@mui/material'
// import ModalComponent from '../../../../components/Modal'

import { MRT_Localization_VI } from 'material-react-table/locales/vi'
import { useTranslation } from 'react-i18next'
import { i18n } from 'services/i18n'
import { PacmanLoader } from 'react-spinners'
import { GridSkeletonCell } from '@mui/x-data-grid'
import { set } from 'react-hook-form'
import { Fullscreen } from '@mui/icons-material'

function isVietnamese () {
  return i18n.language === 'vi'
}
interface Course {
  id: string
  name: string
}
interface Groups {
  id: string
  name: string
  description: string
}
/**
 * TableUser component displays a table of users with their completed courses.
 *
 * This component fetches and displays user data, including their completed courses, in a table format.
 * It supports filtering, pagination, and exporting data to CSV. The component also listens for language changes
 * and updates the table accordingly.
 *
 * @author Canh
 * @component
 * @returns {JSX.Element} The rendered TableUser component.
 *
 * @property {MRT_RowSelectionState} rowSelection - The state for row selection in the table.
 * @property {string} globalFilter - The global filter value for the table.
 * @property {DataListUserWithDoneCourse} dataTable - The data to be displayed in the table.
 * @property {MRT_PaginationState} pagination - The pagination state for the table.
 * @property {boolean} isFinding - Indicates if the component is in a finding state.
 * @property {boolean} loading - Indicates if the component is in a loading state.
 * @property {string} currentLanguage - The current language of the application.
 * @property {Course[]} courses - The list of courses.
 * @property {Groups[]} groups - The list of groups.
 * @property {string[]} selectedCourses - The selected course IDs for filtering.
 * @property {string[]} selectedGroups - The selected group IDs for filtering.
 * @property {boolean} isExporting - Indicates if the component is in an exporting state.
 */

interface OptionType {
  value: string
  label: string | undefined
}
const TableUser = () => {
  const { t } = useTranslation()
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({})
  const [globalFilter, setGlobalFilter] = useState('')
  const [dataTable, setDataTable] = useState<DataListUserWithDoneCourse>()
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 25
  })
  const [isFinding, setIsFinding] = useState(false)
  const [loading, setLoading] = useState<boolean>(true)
  const [currentLanguage, setCurrentLanguage] = useState<string>(i18n.language)
  const [courses, setCourses] = useState<Course[]>([])
  const [groups, setGroups] = useState<Groups[]>([])
  const [selectedCourses, setSelectedCourses] = useState<string[]>([])
  const [selectedGroups, setSelectedGroups] = useState<string[]>([])
  const [isExporting, setIsExporting] = useState(false)
  /**
   * Listens for changes in the application's language and updates the current language state.
   *
   * This effect attaches a listener to the i18n instance for language change events and removes the listener when the component unmounts.
   *
   * @author Canh
   */
  useEffect(() => {
    const handleLanguageChange = () => {
      setCurrentLanguage(i18n.language)
    }

    i18n.on('languageChanged', handleLanguageChange)
    return () => {
      i18n.off('languageChanged', handleLanguageChange)
    }
  }, [])

  /**
   * Fetches course data when the component mounts and updates the state.
   *
   * This effect triggers a function to fetch the list of courses and sets the data in the state.
   * If the request fails, an error is logged.
   *
   * @author Canh
   */
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await getCourse()
        const courses = response.data
        setCourses(courses)
      } catch (error) {
        console.error('Failed to fetch courses:', error)
      }
    }
    fetchCourses()
  }, [])

  /**
   * Fetches group data when the component mounts and updates the state.
   *
   * This effect triggers a function to fetch the list of groups and sets the data in the state.
   * If the request fails, an error is logged.
   *
   * @author Canh
   */
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await getGroup()
        const groupsData = Array.isArray(response?.data?.data)
          ? response.data.data
          : Array.isArray(response?.data)
            ? response.data
            : []
        setGroups(groupsData)
      } catch (error) {
        console.error('Failed to fetch groups:', error)
      }
    }
    fetchGroups()
  }, [])
  /**
   * Fetches data for courses completed by users and updates the table.
   *
   * This effect is triggered by changes in pagination and filters. It sends a request to fetch
   * completed course data, sets the data in the table, and handles loading states.
   *
   * @author Canh
   */
  useEffect(() => {
    let isMounted = true

    const fetchCoursesDoneByUsers = async (): Promise<void> => {
      try {
        if (isMounted) {
          setLoading(true)
        }

        const response = await getCourseDoneDashboard({
          params: {
            page: pagination.pageIndex + 1,
            size: pagination.pageSize,
            userSearch: globalFilter || '',
            courseSearch: JSON.stringify(selectedCourses),
            groupSearch: JSON.stringify(selectedGroups)
          }
        })

        if (!isMounted) {
          return
        }

        setDataTable(response.data)
      } catch (e) {
        console.error(e)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    void fetchCoursesDoneByUsers()

    setIsFinding(false)

    return () => {
      isMounted = false
    }
  }, [
    pagination.pageIndex,
    pagination.pageSize,
    isFinding
  ])
  /**
 * Defines table columns for displaying user data and completed courses.
 *
 * - Configures columns such as User ID, Group Name, Full Name, and Completed Courses Count.
 * - Displays detailed list of completed courses with conditional rendering.
 * - Memoized to improve performance by recalculating only when dependencies change.
 *
 * @author Canh
 * @returns {Array<MRT_ColumnDef<UserWithDoneCourse>>} The configuration for the table columns.
 */
  const columns = useMemo<Array<MRT_ColumnDef<UserWithDoneCourse>>>(
    () => [
      {
        accessorKey: 'userId',
        header: t('ID'),
        enableHiding: true,
        enableEditing: false,
        enableColumnActions: false,
        enableSorting: false,
        enableColumnFilter: false,
        grow: true,
        size: 30
      },
      {
        accessorKey: 'email',
        header: t('dashboard.email'),
        enableHiding: true,
        enableEditing: false,
        enableColumnActions: false,
        enableSorting: false,
        enableColumnFilter: false,
        size: 120
      },
      {
        accessorKey: 'name',
        header: t('dashboard.full_name'),
        enableHiding: true,
        enableEditing: false,
        enableColumnActions: false,
        enableSorting: false,
        enableColumnFilter: false,
        size: 100
      },
      {
        accessorKey: 'groupName',
        header: t('dashboard.group_name'),
        enableHiding: true,
        enableEditing: false,
        enableColumnActions: false,
        enableSorting: false,
        enableColumnFilter: false,
        size: 100
      },
      {
        accessorKey: 'coursesCount',
        header: t('dashboard.lengthDone'),
        enableHiding: true,
        enableColumnActions: false,
        enableSorting: false,
        enableColumnFilter: false,
        size: 100,
        Cell: ({ cell }) => cell.row.original.coursesCount > 1 ? `${cell.row.original.coursesCount} ${t('dashboard.many_courses')}` : `${cell.row.original.coursesCount} ${t('dashboard.course')}`
      },
      {
        accessorKey: 'courseDones',
        header: t('dashboard.completedCourses'),
        enableHiding: true,
        enableColumnActions: false,
        enableSorting: false,
        enableColumnFilter: false,
        Cell: ({ cell }) => (
          <>
            {cell.row.original.courseDones.length === 0 ? (
              <div className='text-gray-500 italic'>{t('dashboard.no_courses')}</div>
            ) : (
              <div className='font-bold'>
                {cell.row.original.courseDones.map((course, index, array) => (
                  <span key={course.courseName} style={{ display: 'block' }}>
                    {course.courseName}{index < array.length - 1 ? ',' : ''}
                  </span>
                ))}
              </div>
            )}
          </>
        )
      }
    ],
    [t, currentLanguage, dataTable?.data]
  )
  /**
   * Resets the pagination to the first page and sets the page size to 5.
   * Initiates the search process by updating the isFinding state.
   *
   * @author Canh
   */
  const handleFind = () => {
    setPagination({ pageIndex: 0, pageSize: 5 })
    setIsFinding(true)
  }
  /**
   * Exports selected rows to a CSV file.
   *
   *
   * This function generates a CSV from the provided rows, handles special formatting for certain fields,
   * and triggers a download of the resulting file.
   *
   * @author Canh
   * @param rows - The rows to be exported. Must not be empty.
   */
  async function handleExportRows (rows: any[]) {
    if (rows.length === 0) return
    setIsExporting(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    let csvContent = '\uFEFF'
    const headers = [
      { label: 'userID', value: 'userId' },
      { label: t('dashboard.email') ?? '', value: 'email' },
      { label: t('dashboard.full_name') ?? '', value: 'name' },
      { label: t('dashboard.group_name') ?? '', value: 'groupName' },
      { label: t('dashboard.lengthDone'), value: 'coursesCount' },
      { label: t('dashboard.completedCourses'), value: 'courseDones' }
    ]
    csvContent += headers.map(header => header.label).join(',') + '\n'
    rows.forEach((row: { original: Record<string, any> }) => {
      const values = headers.map(header => {
        let value = row.original[header.value]
        if (header.value === 'courseDones') {
          value = `"${value.map((course: { courseName: any }) => course.courseName).join(', ')}"`
        } else {
          if (typeof value === 'string') {
            if (value.includes(',')) {
              value = `"${value}"`
            }
            if (value.includes('"')) {
              value = `"${value.replace(/"/g, '""')}"`
            }
          }
        }
        return value
      })
      csvContent += values.join(',') + '\n'
    })
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = 'selectedData.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    setIsExporting(false)
  }
  // ALL DATA
  /**
   * Exports all user data to a CSV file.
   *
   * This function retrieves all data from the server in batches,
   * compiles it into CSV format, and triggers a download of the CSV file.
   *
   * @author Canh
   */
  const handleExportAllData = async () => {
    setIsExporting(true)
    console.log('Exporting all data...')
    let csvContent = '\uFEFF'
    let allUsersData: UserWithDoneCourse[] = []
    let pageIndex = 1
    const pageSize = 100

    const fetchPageData = async (pageIndex: number) => {
      try {
        const response = await getCourseDoneDashboard({
          params: {
            page: pageIndex,
            size: pageSize,
            userSearch: globalFilter || '',
            courseSearch: JSON.stringify(selectedCourses),
            groupSearch: JSON.stringify(selectedGroups)
          }
        })
        return response.data
      } catch (e) {
        console.error(e)
        return null
      }
    }
    let pageData = await fetchPageData(pageIndex)
    console.log(pageData, 'pageData')
    while (allUsersData.length < (pageData?.totalRecords ?? 0)) {
      console.log('loop')
      if (pageData && pageData.data && pageData.data.length > 0) {
        allUsersData = allUsersData.concat(pageData.data)
        console.log(allUsersData, 'allUsersDataaaaa')
        pageIndex++
        pageData = await fetchPageData(pageIndex)
      } else {
        break
      }
    }
    if (allUsersData.length > 0) {
      const headers = [
        { label: 'userID', value: 'userId' },
        { label: t('dashboard.email') ?? '', value: 'email' },
        { label: t('dashboard.full_name') ?? '', value: 'name' },
        { label: t('dashboard.group_name') ?? '', value: 'groupName' },
        { label: t('dashboard.lengthDone'), value: 'coursesCount' },
        { label: t('dashboard.completedCourses'), value: 'courseDones' }
      ]
      csvContent += headers.map(header => header.label).join(',') + '\n'

      allUsersData.forEach((user) => {
        const rowValues = Object.keys(user)
        const courseNames = `"${user.courseDones.map((course: { courseName: any }) => course.courseName).join(', ')}"`
        const courseDoneLength = user.coursesCount
        const groupName = user.groupName
        const rowContent = [user.userId, user.email, user.name, groupName, courseDoneLength, courseNames].join(',')
        csvContent += rowContent + '\r\n'
      })
    }
    setTimeout(() => {
      setIsExporting(false)

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'filename.csv'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }, 2000)
  }

  const table = useMaterialReactTable({
    columns,
    data: dataTable?.data ?? [],
    manualFiltering: true,
    enableRowSelection: true,
    // selectRow: true,
    onGlobalFilterChange: setGlobalFilter,
    enableFilterMatchHighlighting: true,
    enableFullScreenToggle: true,
    muiTableBodyRowProps: ({ row }) => ({
      onClick: () => {
        setRowSelection((prev) => ({
          ...prev,
          [row.id]: !prev[row.id]
        }))
      },
      selected: rowSelection[row.id],
      sx: {
        cursor: 'pointer'
      }
    }),
    onRowSelectionChange: (newSelection) => {
      const oldSelection = { ...rowSelection }
      setRowSelection(newSelection)
    },
    onPaginationChange: setPagination,
    paginationDisplayMode: 'pages',
    muiPaginationProps: {
      rowsPerPageOptions: [
        { label: '25', value: 25 },
        { label: '100', value: 100 },
        { label: t('lesson.All'), value: courses.length }
      ],
      showFirstButton: true,
      showLastButton: true,
      showRowsPerPage: true,
      color: 'standard',
      shape: 'rounded',
      variant: 'outlined',
      sx: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        // '.MuiRowsPerPage-select': {
        //   display: 'none',
        //   backgroundColor: 'red'
        // },
        '.MuiPagination-ul': {
          display: 'inline-flex',
          fontSize: 'large',
          listStyle: 'none',
          margin: '10px',
          '@media (max-width: 600px)': {
            margin: '5px'
          }
        },
        '.MuiPaginationItem-root': {
          fontSize: 'large',
          fontWeight: 'bold',
          borderRadius: '4px',
          margin: '2px',
          border: '1px solid #cbd5e0',
          backgroundColor: 'white',
          color: '#718096',
          '&:hover': {
            backgroundColor: '#667eea',
            color: 'white'
          },
          '@media (max-width: 600px)': {
            margin: '0px'
          }
        },
        '.MuiPaginationItem-firstLast': {
          borderRadius: '4px'
        },
        '.MuiPaginationItem-previousNext': {
          borderRadius: '4px',
          margin: '10px',
          '@media (min-width: 600px)': {
            margin: '20px'
          },
          '@media (max-width: 600px)': {
            fontSize: 'medium',
            margin: '0px'
          }
        },
        '.MuiPaginationItem-page.Mui-selected': {
          color: '#667eea',
          fontWeight: 'bold',
          border: '2px solid #667eea',
          '&:hover': {
            backgroundColor: '#667eea',
            color: 'white'
          }
        },
        '.MuiPaginationItem-ellipsis': {
          color: '#a0aec0',
          border: '1px solid #cbd5e0',
          backgroundColor: 'white',
          padding: '2px',
          margin: '0',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center'
        }
      }

    },
    manualPagination: true,
    rowCount: dataTable?.totalRecords,
    initialState: {
      pagination: { pageSize: 25, pageIndex: 0 },
      columnVisibility: { id: false },
      showGlobalFilter: true
    },
    getRowId: (row: UserWithDoneCourse) => row?.userId?.toString() ?? 'unknown-id',
    muiTableHeadRowProps: {
      sx: {
        border: '1px solid rgba(81, 81, 81, .5)',
        backgroundColor: 'rgba(81, 81, 81, .1)',
        fontStyle: 'bold',
        fontWeight: 'bold'
      }
    },
    muiTableHeadCellProps: {
      sx: {
        border: '1px solid rgba(81, 81, 81, .5)',
        fontStyle: 'bold',
        fontWeight: 'bold'
      },
      align: 'center'
    },
    muiTableBodyCellProps: {
      sx: {
        border: '1px solid rgba(81, 81, 81, .5)'
      },
      align: 'center'
    },
    state: {
      showLoadingOverlay: !!loading || !!isExporting,
      showProgressBars: !!loading,
      showSkeletons: !!loading,
      pagination,
      rowSelection
    },
    localization: isVietnamese() ? MRT_Localization_VI : undefined,
    rowNumberDisplayMode: 'original',
    layoutMode: 'grid',
    displayColumnDefOptions: {
      'mrt-row-numbers': {
        enableResizing: true,
        size: 40,
        grow: false
      },
      'mrt-row-drag': {
        enableResizing: true,
        size: 40,
        grow: false
      },
      'mrt-row-select': {
        enableResizing: true,
        size: 40,
        grow: false
      }
    }
  })

  return (
    <>
      <Box sx={{ border: 'gray 2px dashed', padding: '16px', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
        {/* Our Custom External Top Toolbar */}
        <Box
          sx={(theme) => ({
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'inherit',
            borderRadius: '4px',
            flexDirection: 'row',
            gap: '10px',
            justifyContent: 'space-between',
            width: '100%',
            padding: '24px 16px 16px 16px',
            '@media (max-width: 800px)': {
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              padding: '24px 16px 16px 16px',
              margin: '0 auto',
              background: 'rgba(81, 81, 81, .1)'
            }
          })}
        >
          <div className="flex lg:w-1/3 w-4/5 items-center space-x-4 z-20">
            <label htmlFor="courseSelect" className="font-bold">{t('dashboard.courses')}: </label>
            <Select
              id="courseSelect"
              className="w-full ml-3"
              isMulti
              options={courses.map(course => ({ value: course.name, label: course.name }))}
              value={selectedCourses.map(courseName => ({
                value: courseName,
                label: courses.find(course => course.name === courseName)?.name ?? String(t('dashboard.none'))
              }))}
              onChange={(options: MultiValue<OptionType>) => {
                setSelectedCourses(options.map(option => option.value))
              }}
            />
          </div>
          <div className="flex lg:w-1/3 w-4/5 items-center space-x-4 z-10">
            <label htmlFor="groupSelect" className="font-bold">{t('dashboard.group_name')}: </label>
            <Select
              id="groupSelect"
              className="w-full ml-3"
              isMulti
              options={groups.map(group => ({ value: group.name, label: group.name }))}
              value={selectedGroups.map(groupName => ({ value: groupName, label: groupName }))}
              onChange={(options: MultiValue<OptionType>) => {
                setSelectedGroups(options.map(option => option.value))
              }}
            />
          </div>
          <div className='flex lg:w-1/3 w-3/5  items-center justify-center'>
            <MRT_GlobalFilterTextField table={table} placeholder={t('dashboard.name_search') ?? ''} />
          </div>
          <Box>
            <Button
              className='w-full'
              color="primary"
              onClick={() => handleFind()}
              variant="contained"
              size="medium"
              sx={{
                height: '40px',
                minWidth: '40px'
              }}
            >
              <SearchIcon fontSize="small" />
            </Button>
          </Box>
          {/* </form> */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <MRT_ShowHideColumnsButton table={table}/>
            <MRT_ToggleDensePaddingButton table={table}/>
          </Box>
        </Box>
        <Box
          sx={(theme) => ({
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'inherit',
            borderRadius: '4px',
            flexDirection: 'row',
            gap: '16px',
            justifyContent: 'space-between',
            flexGrow: 1,
            padding: '24px 16px 16px 16px',
            '@media (max-width: 800px)': {
              flexDirection: 'column'
            }
          })}
        >
          <Box
            sx={(theme) => ({
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'inherit',
              borderRadius: '4px',
              flexDirection: 'row',
              gap: '16px',
              justifyContent: 'space-between',
              width: '70%',
              '@media (max-width: 800px)': {
                width: '100%'
              }
            })}>
            <Button
              onClick={handleExportAllData}
              disabled={isExporting}
              startIcon={<FileDownloadIcon />}
            >
              {t('dashboard.export_all_data')}
            </Button>
            <Button
              disabled={table.getRowModel().rows.length === 0 || isExporting}
              onClick={async () => await handleExportRows(table.getRowModel().rows)}
              startIcon={<FileDownloadIcon />}
            >
              {t('dashboard.export_page_row')}
            </Button>
            <Button
              disabled={
                table.getSelectedRowModel().rows.length === 0 || isExporting
              }
              onClick={async () => await handleExportRows(table.getSelectedRowModel().rows)}
              startIcon={<FileDownloadIcon />}
            >
              {t('dashboard.export_selected_row')}
            </Button>
          </Box>
        </Box>
        {loading && <LinearProgress />}
        {loading && <LinearProgress />}
        <MRT_TableContainer table={table} />

        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <MRT_TablePagination table={table} />
          </Box>
          <Box sx={{ display: 'grid', width: '100%' }}>
            <MRT_ToolbarAlertBanner stackAlertBanner table={table} />
          </Box>
        </Box>
      </Box>
    </>
  )
}

export default TableUser
