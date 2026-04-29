/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable react/prop-types */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* PAGE: Statistic
========================================================================== */
import { useEffect, useMemo, useState } from 'react'
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
  type MRT_PaginationState
} from 'material-react-table'
import { getUserScores, postSubmitUnsubmittedExamForAdmin } from '../../../../api/post/post.api'
import { MRT_Localization_VI } from 'material-react-table/locales/vi'
import { useTranslation } from 'react-i18next'
import { i18n } from 'services/i18n'
import DetailedExamResultsModal from './DetailedExamResults'
import { toast } from 'react-toastify'
import { Tooltip, Box, Typography, Chip } from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'
import { StatisticExam } from '../../../../api/post/post.interface'
import Pagination from '@mui/material/Pagination'

/**
 * Checks if the current language is Vietnamese.
 *
 * @author Hien
 * @returns {boolean} True if the current language is Vietnamese, false otherwise.
 */
function isVietnamese () {
  return i18n.language === 'vi'
}

interface StatisticProps {
  examId?: number
}

/**
 * Statistic component for displaying exam statistics.
 *
 * @author Hien
 * @component
 * @param {object} props - The component props.
 * @returns {JSX.Element} The rendered Statistic component.
 */
const Statistic: React.FC<StatisticProps> = ({ examId }) => {
  // TODO: Initialize the translation hook
  const { t } = useTranslation()
  // TODO: Initialize state for the current language
  const [currentLanguage, setCurrentLanguage] = useState<string>(i18n.language)
  // TODO: Initialize state for the statistic data
  const [data, setData] = useState<StatisticExam[]>([])
  // TODO: Initialize state for error handling
  const [isError, setIsError] = useState(false)
  // TODO: Initialize state for loading indicator
  const [isTableLoading, setIsTableLoading] = useState(false)
  // TODO: Initialize state for the row count
  const [rowCount, setRowCount] = useState(0)

  // TODO: Initialize state for the global filter
  const [globalFilter, setGlobalFilter] = useState('')
  // TODO: Initialize state for the pagination
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 25
  })
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [selectedAttempt, setSelectedAttempt] = useState<number | null>(null)

  // State for pagination of each detail panel
  const [detailPanelPage, setDetailPanelPage] = useState<Record<string, number>>({})
  const rowsPerDetailPage = 2
  /**
   * Fetches the statistic data from the API.
   *
   * @author Hien
   * @async
   * @returns {Promise<void>}
   */
  const fetchData = async () => {
    setIsTableLoading(true)
    try {
      const response = await getUserScores({
        examId: examId!,
        start: pagination.pageIndex * pagination.pageSize,
        size: pagination.pageSize,
        globalFilter: globalFilter ?? ''
      })
      const json = response.data
      if (json.data && json.meta) {
        setData(json.data)
        setRowCount(json.meta.totalRowCount)
      } else {
        throw new Error('Invalid API response')
      }
    } catch (error) {
      setIsError(true)
      console.error(error)
      return
    }
    setIsError(false)
    setIsTableLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [
    globalFilter,
    pagination.pageIndex,
    pagination.pageSize
  ])

  const handleF5 = async () => {
    setIsTableLoading(true)
    try {
      await postSubmitUnsubmittedExamForAdmin(examId)
      await fetchData()
    } catch (error) {
      console.error('Error submitting unsubmitted exam:', error)
      setIsTableLoading(false)
    }
  }

  /**
     * Handles the language change event.
     *
     * @author Hien
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

  const columns = useMemo<Array<MRT_ColumnDef<StatisticExam>>>(() => [
    {
      accessorKey: 'userInfo.id',
      header: 'ID',
      enableHiding: false,
      enableSorting: false,
      enableColumnFilter: false
    },
    {
      accessorKey: 'userInfo.fullName',
      header: t('exam_admin.statistic.fullName'),
      enableSorting: false,
      enableColumnFilter: false,
      size: 150
    },
    {
      accessorKey: 'userInfo.email',
      header: t('exam_admin.statistic.email'),
      enableSorting: false,
      enableColumnFilter: false,
      size: 150
    },
    {
      accessorKey: 'totalAttempts',
      header: t('exam_admin.statistic.totalAttempts'),
      enableSorting: false,
      enableColumnFilter: false,
      size: 150,
      Cell: ({ row }) => {
        const currentAttempts = row.original.attempts.length
        const maxAttempts = row.original.numberOfAttempt
        return `${currentAttempts}/${maxAttempts}`
      }
    },
    {
      accessorKey: 'totalResults',
      header: t('exam_admin.statistic.status'),
      enableSorting: false,
      enableColumnFilter: false,
      size: 150,
      Cell: ({ row }) => {
        const attempts = row.original.attempts

        // Check if there are any attempts in progress
        const inProgressAttempt = attempts.find(attempt =>
          attempt.enterTime && !attempt.exitTime &&
          (!attempt.expireTime || new Date(attempt.expireTime).getTime() > Date.now())
        )

        if (inProgressAttempt) {
          return (
            <Chip
              label={t('exam_admin.statistic.inProgress')}
              color="info"
              size="small"
            />
          )
        }

        // Check if there are any expired attempts
        const expiredAttempt = attempts.find(attempt =>
          !attempt.exitTime &&
          attempt.expireTime &&
          new Date(attempt.expireTime).getTime() < Date.now()
        )

        if (expiredAttempt) {
          return (
            <Chip
              label={t('exam_admin.statistic.expired')}
              color="warning"
              size="small"
            />
          )
        }

        // Check the results of completed attempts
        const completedAttempts = attempts.filter(attempt => attempt.exitTime && attempt.score !== null)

        // if (completedAttempts.length === 0) {
        //   return <Chip label="Chưa hoàn thành" color="warning" size="small" />
        // }

        const maxScore = Math.max(...completedAttempts.map(attempt => attempt.score || 0))
        const passThreshold = row.original.pointToPass || 0
        const isPassed = maxScore >= passThreshold

        return (
          <Chip
            label={isPassed ? t('exam_admin.statistic.passed') : t('exam_admin.statistic.notPassed')}
            color={isPassed ? 'success' : 'error'}
            size="small"
          />
        )
      }
    },
    {
      accessorKey: 'bestScore',
      header: t('exam_admin.statistic.bestScore'),
      enableSorting: false,
      enableColumnFilter: false,
      size: 120,
      Cell: ({ row }) => {
        const completedAttempts = row.original.attempts.filter(attempt =>
          attempt.exitTime && attempt.score !== null
        )
        if (completedAttempts.length === 0) return '-'

        const maxScore = Math.max(...completedAttempts.map(attempt => attempt.score || 0))
        return <strong>{maxScore}</strong>
      }
    }
  ], [currentLanguage])

  const rowsPerPageOptions = [
    { label: '25', value: 25 },
    { label: '100', value: 100 }
  ]

  if (!rowsPerPageOptions.some((opt) => opt.value === data.length)) {
    rowsPerPageOptions.push({ label: t('exam_admin.statistic.all'), value: data.length })
  }

  const table = useMaterialReactTable({
    columns,
    data,
    initialState: {
      sorting: [{ id: 'userInfo.id', desc: true }],
      columnVisibility: { 'userInfo.id': false }
    },
    manualPagination: true,
    muiToolbarAlertBannerProps: isError
      ? { color: 'error', children: t('exam_admin.exam_error') }
      : undefined,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    rowCount,
    state: {
      globalFilter,
      isLoading: isTableLoading,
      pagination,
      showAlertBanner: isError,
      showProgressBars: isTableLoading
    },
    autoResetPageIndex: false,
    layoutMode: 'grid',
    positionActionsColumn: 'last',
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
    muiSkeletonProps: {
      animation: 'pulse',
      height: 28
    },
    enableRowNumbers: true,
    rowNumberDisplayMode: 'original',
    displayColumnDefOptions: {
      'mrt-row-numbers': {
        Header: t('lesson.no'),
        enableResizing: true,
        size: 40,
        grow: false
      },
      'mrt-row-expand': {
        enableResizing: true,
        size: 40,
        grow: false
      }
    },
    muiPaginationProps: {
      rowsPerPageOptions,
      showFirstButton: true,
      showLastButton: true
    },
    paginationDisplayMode: 'pages',
    localization: isVietnamese() ? MRT_Localization_VI : undefined,
    enableColumnFilters: false,
    enableFilterMatchHighlighting: false,
    muiSearchTextFieldProps: {
      label: t('exam_admin.statistic.searchLable'),
      placeholder: t('exam_admin.statistic.search') ?? ''
    },
    renderTopToolbarCustomActions: ({ table }) => (
      <div className="flex space-x-2 mt-2">
        <Box>
          {/* F5 button */}
          <Tooltip title={t('exam_admin.statistic.refresh')}>
            <button className="btn bg-blue-500 hover:bg-blue-400 p-0.5 rounded-sm" onClick={() => { handleF5() } }>
              <RefreshIcon className="text-white" />
            </button>
          </Tooltip>
        </Box>
      </div>
    ),
    enableExpanding: true,
    renderDetailPanel: ({ row }) => {
      const userId = row.original.userInfo.id.toString()
      const attempts = row.original.attempts
      const page = detailPanelPage[userId] || 0
      const totalPages = Math.ceil(attempts.length / rowsPerDetailPage)
      const paginatedAttempts = attempts.slice(page * rowsPerDetailPage, (page + 1) * rowsPerDetailPage)
      const passThreshold = row.original.pointToPass || 0

      return (
      <Box sx={{ p: 2, ml: 4, borderLeft: '2px solid #ccc', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
        <Typography
          variant="body2"
          sx={{ mb: 2, fontStyle: 'italic', fontSize: '0.875rem', color: '#333' }}
        >
          {t('exam_admin.statistic.titleList')}
        </Typography>
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'left' }}>
          <Box
            component="table"
            sx={{
              width: '65%',
              borderCollapse: 'collapse',
              tableLayout: 'fixed'
            }}
          >
          <Box component="thead" sx={{ backgroundColor: '#f0f0f0' }}>
            <Box component="tr">
              <Box component="th" sx={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left', width: '10%' }}>{t('exam_admin.statistic.attempt')}</Box>
              <Box component="th" sx={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left', width: '5%' }}>{t('exam_admin.statistic.score')}</Box>
              <Box component="th" sx={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left', width: '15%' }}>{t('exam_admin.statistic.enterTime')}</Box>
              <Box component="th" sx={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left', width: '15%' }}>{t('exam_admin.statistic.exitTime')}</Box>
              <Box component="th" sx={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left', width: '10%' }}>{t('exam_admin.statistic.status')}</Box>
              <Box component="th" sx={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left', width: '10%' }}>{t('exam_admin.statistic.action')}</Box>
            </Box>
          </Box>
          <Box component="tbody">
            {paginatedAttempts.map((attempt, idx) => {
              const isExpired = !attempt.exitTime &&
                attempt.expireTime &&
                new Date(attempt.expireTime).getTime() < Date.now()

              const isInProgress = attempt.enterTime && !attempt.exitTime && !isExpired
              const isCompleted = attempt.exitTime && attempt.score !== null
              const isPassed = isCompleted && (attempt.score || 0) >= passThreshold

              return (
                <Box component="tr" key={idx} sx={{
                  backgroundColor: isExpired ? '#ffe6e6' : isInProgress ? '#fff3cd' : 'transparent',
                  '&:hover': {
                    backgroundColor: isExpired ? '#ffcccc' : isInProgress ? '#fff9e6' : '#f0f0f0'
                  }
                }}>
                  <Box component="td" sx={{ border: '1px solid #ddd', padding: '8px' }}>{attempt.attempt}</Box>
                  <Box component="td" sx={{ border: '1px solid #ddd', padding: '8px' }}>
                    {attempt.score !== null ? attempt.score : (isExpired ? '-' : '-')}
                  </Box>
                  <Box component="td" sx={{ border: '1px solid #ddd', padding: '8px' }}>
                    {attempt.enterTime ? new Date(attempt.enterTime).toLocaleString() : '-'}
                  </Box>
                  <Box component="td" sx={{ border: '1px solid #ddd', padding: '8px' }}>
                    {attempt.exitTime ? new Date(attempt.exitTime).toLocaleString() : '-'}
                  </Box>
                  <Box component="td" sx={{ border: '1px solid #ddd', padding: '8px' }}>
                    {isExpired && (
                      <Chip
                        label={t('exam_admin.statistic.expired')}
                        color="warning"
                        size="small"
                      />
                    )}
                    {isInProgress && (
                      <Chip
                        label={t('exam_admin.statistic.inProgress')}
                        color="info"
                        size="small"
                      />
                    )}
                    {isCompleted && (
                      <Chip
                        label={isPassed ? t('exam_admin.statistic.passed') : t('exam_admin.statistic.notPassed')}
                        color={isPassed ? 'success' : 'error'}
                        size="small"
                      />
                    )}
                  </Box>
                  <Box component="td" sx={{ border: '1px solid #ddd', padding: '8px' }}>
                    {isCompleted && (
                      <button
                        className="px-3 py-1 text-blue-500 hover:text-blue-700 border border-blue-500 rounded hover:bg-blue-50"
                        onClick={() => {
                          setSelectedUserId(row.original.userInfo.id.toString())
                          setSelectedAttempt(attempt.attempt)
                          setModalVisible(true)
                        }}
                      >
                        {t('exam_admin.statistic.view_detail')}
                      </button>
                    )}
                  </Box>
                </Box>
              )
            })}
          </Box>
        </Box>
        {/* Pagination controls */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 2, width: '60%' }}>
           <Pagination
            count={totalPages}
            page={page + 1}
            onChange={(event, value) => setDetailPanelPage(prev => ({ ...prev, [userId]: value - 1 }))}
            size="medium"
          />
        </Box>
      </Box>
      </Box>
      )
    }
  })

  return (
    <div className='h-[calc(100vh-50px)] overflow-y-auto px-4 sm:px-6 lg:px-8'>
      {/* <div className="mb-8">
        <h1 className="text-2xl md:text-3xl text-slate-800 font-bold">{t('exam_admin.statistic.title')}</h1>
      </div> */}
      <MaterialReactTable table={table} />
      <DetailedExamResultsModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        userId={selectedUserId || ''}
        examId={examId?.toString() || ''}
        attempt={selectedAttempt || 1}
      />
    </div>
  )
}

export default Statistic
