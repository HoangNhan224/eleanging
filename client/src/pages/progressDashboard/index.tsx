/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/no-unnecessary-boolean-literal-compare */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable react/prop-types */
/* eslint-disable @typescript-eslint/member-delimiter-style */
/* PAGE: Progress Dashboard - Thống kê tiến độ học từng user từng khóa học
========================================================================== */
import React, { useEffect, useState, useMemo } from 'react'
import Select, { SingleValue } from 'react-select'
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  useMaterialReactTable
} from 'material-react-table'
import { getAdminLearningProgress, getCourseLessionData, fetchAllGroups } from 'api/post/post.api'
import { Box, LinearProgress, Typography, Chip } from '@mui/material'
import { toast } from 'react-toastify'
import { i18n } from 'services/i18n'
import { MRT_Localization_VI } from 'material-react-table/locales/vi'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { fetchSummaryStats, selectSummary } from '../../redux/progressDashboard/progressDashboardSlice'
import type { AppDispatch } from '../../redux/store'

function isVietnamese () {
  return i18n.language === 'vi'
}

interface LearningProgressRow {
  enrollmentId: number
  userId: number
  userName: string
  userEmail: string
  courseId: number
  courseName: string
  progress: number
  status: boolean
  enrollmentDate: string
  completedDate: string | null
  groupName: string | null
  completedLessons: number
  totalLessons: number
}

interface Course {
  id: string
  name: string
}

interface Group {
  id: string
  name: string
}

const ProgressDashboard = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch<AppDispatch>()
  const summary = useSelector(selectSummary)
  const [currentLanguage, setCurrentLanguage] = useState<string>(i18n.language)
  const [data, setData] = useState<LearningProgressRow[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [totalRecords, setTotalRecords] = useState(0)
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 25 })
  const [globalFilter, setGlobalFilter] = useState('')
  const [selectedCourse, setSelectedCourse] = useState<string>('')
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [selectedGroup, setSelectedGroup] = useState<string>('')
  const [courses, setCourses] = useState<Course[]>([])
  const [groups, setGroups] = useState<Group[]>([])

  useEffect(() => {
    const handleLanguageChange = () => {
      setCurrentLanguage(i18n.language)
    }
    i18n.on('languageChanged', handleLanguageChange)
    return () => {
      i18n.off('languageChanged', handleLanguageChange)
    }
  }, [])

  // Fetch courses for filter dropdown
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await getCourseLessionData()
        const fetchedCourses = response.data.data || []
        setCourses(fetchedCourses)
        if (fetchedCourses.length > 0) {
          setSelectedCourse(fetchedCourses[0].id)
        }
      } catch (error) {
        toast.error(t('progress_dashboard.fetch_error'))
      }
    }
    fetchCourses()
  }, [])

  // Fetch groups for filter dropdown
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetchAllGroups()
        setGroups(response.data.data || response.data)
      } catch (error) {
        console.error('Failed to fetch groups:', error)
      }
    }
    fetchGroups()
  }, [])

  // Fetch summary stats (only when selectedCourse changes)
  useEffect(() => {
    if (!selectedCourse) return
    dispatch(fetchSummaryStats(selectedCourse))
  }, [selectedCourse, dispatch])

  // Fetch learning progress data
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedCourse) {
        setData([])
        setTotalRecords(0)
        return
      }
      setIsLoading(true)
      try {
        const params: any = {
          page: pagination.pageIndex + 1,
          size: pagination.pageSize >= 99999 ? 99999 : pagination.pageSize
        }
        if (globalFilter) {
          params.search = globalFilter
        }
        if (selectedCourse) {
          params.courseId = selectedCourse
        }
        if (selectedStatus) {
          params.status = selectedStatus
        }
        if (selectedGroup) {
          params.groupId = selectedGroup
        }
        const response = await getAdminLearningProgress(params)
        const result = response.data
        setData(result.data)
        setTotalRecords(result.totalRecords)
      } catch (error) {
        toast.error(t('progress_dashboard.fetch_error'))
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [pagination.pageIndex, pagination.pageSize, globalFilter, selectedCourse, selectedStatus, selectedGroup])

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  }

  const columns = useMemo<Array<MRT_ColumnDef<LearningProgressRow>>>(
    () => [
      {
        accessorKey: 'enrollmentId',
        header: 'ID',
        size: 70,
        grow: false
      },
      {
        accessorKey: 'userName',
        header: t('progress_dashboard.user_name'),
        size: 150,
        grow: true
      },
      {
        accessorKey: 'userEmail',
        header: t('progress_dashboard.email'),
        size: 180,
        grow: true
      },
      {
        accessorKey: 'groupName',
        header: t('progress_dashboard.group'),
        size: 120,
        grow: true,
        Cell: ({ cell }) => {
          const value = cell.getValue<string | null>()
          return value || '-'
        }
      },
      {
        accessorKey: 'courseName',
        header: t('progress_dashboard.course_name'),
        size: 180,
        grow: true,
        Cell: ({ cell }) => {
          const value = cell.getValue<string | null>()
          return value || '-'
        }
      },
      {
        accessorKey: 'progress',
        header: t('progress_dashboard.progress'),
        size: 180,
        grow: true,
        Cell: ({ row }) => {
          const progress = Number(row.original.progress) || 0
          const percentage = Math.min(Math.round(progress * 100), 100)
          if (percentage === 0) {
            return (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                {t('progress_dashboard.not_started')}
              </Typography>
            )
          }
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <Box sx={{ width: '100%', mr: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={percentage}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: '#e0e0e0',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 5,
                      backgroundColor: percentage === 100 ? '#4caf50' : '#1976d2'
                    }
                  }}
                />
              </Box>
              <Box sx={{ minWidth: 45 }}>
                <Typography variant="body2" color="text.secondary">
                  {`${percentage}%`}
                </Typography>
              </Box>
            </Box>
          )
        }
      },
      {
        accessorKey: 'completedLessons',
        header: t('progress_dashboard.completed_lessons'),
        size: 130,
        grow: false,
        Cell: ({ row }) => {
          return `${row.original.completedLessons}/${row.original.totalLessons}`
        }
      },
      {
        accessorKey: 'status',
        header: t('progress_dashboard.status'),
        size: 130,
        grow: false,
        Cell: ({ cell, row }) => {
          const status = cell.getValue<boolean>()
          const progress = Number(row.original.progress) || 0
          const percentage = Math.min(Math.round(progress * 100), 100)
          const isNotStarted = percentage === 0
          return (
            <Chip
              label={status ? t('progress_dashboard.completed') : isNotStarted ? t('progress_dashboard.not_started') : t('progress_dashboard.in_progress')}
              color={status ? 'success' : isNotStarted ? 'default' : 'warning'}
              size="small"
              variant="outlined"
            />
          )
        }
      },
      {
        accessorKey: 'enrollmentDate',
        header: t('progress_dashboard.enrollment_date'),
        size: 160,
        grow: true,
        Cell: ({ cell }) => {
          return formatDate(cell.getValue<string>())
        }
      },
      {
        accessorKey: 'completedDate',
        header: t('progress_dashboard.completed_date'),
        size: 160,
        grow: true,
        Cell: ({ cell }) => {
          const value = cell.getValue<string | null>()
          return value ? formatDate(value) : t('progress_dashboard.not_completed')
        }
      }
    ],
    [currentLanguage]
  )

  const table = useMaterialReactTable({
    columns,
    data,
    manualPagination: true,
    manualFiltering: true,
    rowCount: totalRecords,
    paginationDisplayMode: 'pages',
    enableEditing: false,
    enableRowSelection: false,
    state: {
      isLoading,
      pagination,
      globalFilter
    },
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    initialState: {
      columnVisibility: { enrollmentId: false },
      density: 'compact',
      pagination: { pageSize: 25, pageIndex: 0 }
    },
    enableFilterMatchHighlighting: false,
    enableRowNumbers: true,
    layoutMode: 'grid',
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
    displayColumnDefOptions: {
      'mrt-row-numbers': {
        header: 'No',
        enableResizing: true,
        size: 40,
        grow: false
      }
    },
    muiSearchTextFieldProps: {
      placeholder: t('progress_dashboard.search_placeholder') as string
    },
    muiPaginationProps: {
      rowsPerPageOptions: [
        { label: '25', value: 25 },
        { label: '100', value: 100 },
        { label: t('progress_dashboard.all') as string, value: 99999 }
      ],
      showFirstButton: true,
      showLastButton: true
    },
    localization: isVietnamese() ? MRT_Localization_VI : undefined
  })

  return (
    <div className="min-h-screen">
      <div className="py-10 w-full">
        <h1 className="text-2xl font-bold mb-5">{t('progress_dashboard.title')}</h1>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-600 font-medium">{t('progress_dashboard.total_enrollments')}</p>
            <p className="text-2xl font-bold text-blue-800">{summary.completedCount + summary.inProgressCount + summary.notStartedCount}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-600 font-medium">{t('progress_dashboard.completed_courses')}</p>
            <p className="text-2xl font-bold text-green-800">{summary.completedCount}</p>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-sm text-orange-600 font-medium">{t('progress_dashboard.in_progress_courses')}</p>
            <p className="text-2xl font-bold text-orange-800">{summary.inProgressCount}</p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600 font-medium">{t('progress_dashboard.not_started')}</p>
            <p className="text-2xl font-bold text-gray-800">{summary.notStartedCount}</p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-sm text-purple-600 font-medium">{t('progress_dashboard.average_progress')}</p>
            <p className="text-2xl font-bold text-purple-800">{summary.avgProgress}%</p>
          </div>
        </div>

        {/* Filter */}
        <div className="grid gap-5 md:grid-cols-3 mb-5">
          <div className="flex flex-col">
            <label htmlFor="courseFilter" className="mb-2 font-bold">
              {t('progress_dashboard.filter_by_course')}
            </label>
            <Select
              id="courseFilter"
              className="z-20 w-full h-10"
              options={courses.map((course) => ({ value: course.id, label: course.name }))}
              value={
                selectedCourse && courses.find((course) => course.id === selectedCourse)
                  ? {
                      value: selectedCourse,
                      label: courses.find((course) => course.id === selectedCourse)?.name
                    }
                  : null
              }
              onChange={(option: SingleValue<{ value: string, label: string | undefined }>) =>
                setSelectedCourse(option?.value ?? '')
              }
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="statusFilter" className="mb-2 font-bold">
              {t('progress_dashboard.filter_by_status')}
            </label>
            <Select
              id="statusFilter"
              className="z-20 w-full h-10"
              isClearable
              placeholder={t('progress_dashboard.all_statuses')}
              options={[
                { value: 'completed', label: t('progress_dashboard.completed') as string },
                { value: 'in_progress', label: t('progress_dashboard.in_progress') as string },
                { value: 'not_started', label: t('progress_dashboard.not_started') as string }
              ]}
              value={
                selectedStatus
                  ? {
                      value: selectedStatus,
                      label: selectedStatus === 'completed'
                        ? t('progress_dashboard.completed')
                        : selectedStatus === 'in_progress'
                          ? t('progress_dashboard.in_progress')
                          : t('progress_dashboard.not_started')
                    }
                  : null
              }
              onChange={(option: SingleValue<{ value: string, label: string }>) =>
                setSelectedStatus(option?.value ?? '')
              }
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="groupFilter" className="mb-2 font-bold">
              {t('progress_dashboard.filter_by_group')}
            </label>
            <Select
              id="groupFilter"
              className="z-20 w-full h-10"
              isClearable
              placeholder={t('progress_dashboard.all_groups')}
              options={groups.map((group) => ({ value: group.id, label: group.name }))}
              value={
                selectedGroup && groups.find((group) => group.id === selectedGroup)
                  ? {
                      value: selectedGroup,
                      label: groups.find((group) => group.id === selectedGroup)?.name
                    }
                  : null
              }
              onChange={(option: SingleValue<{ value: string, label: string | undefined }>) =>
                setSelectedGroup(option?.value ?? '')
              }
            />
          </div>
        </div>
      </div>
      <>
        <hr />
        <MaterialReactTable table={table} />
      </>
    </div>
  )
}

export default ProgressDashboard
