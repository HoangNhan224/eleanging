/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* PAGE: TableExam
========================================================================== */
import { useEffect, useMemo, useState } from 'react'
import Select, { SingleValue } from 'react-select'
import ROUTES from 'routes/constant'
import { useNavigate } from 'react-router-dom'
import {
  MaterialReactTable,
  MRT_Cell,
  useMaterialReactTable,
  type MRT_RowSelectionState,
  type MRT_ColumnDef,
  type MRT_ColumnFiltersState,
  type MRT_PaginationState,
  type MRT_SortingState
} from 'material-react-table'
import { Tooltip, Box } from '@mui/material'
import { getExams } from '../../../api/post/post.api'
import { Exam } from '../../../api/post/post.interface'
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import SignalCellularAltOutlinedIcon from '@mui/icons-material/SignalCellularAltOutlined'
import { toast } from 'react-toastify'
import { deleteExams } from 'api/post/post.api'
import ModalComponent from '../../../components/Modal'
import { MRT_Localization_VI } from 'material-react-table/locales/vi'
import { useTranslation } from 'react-i18next'
import { i18n } from 'services/i18n'

/**
 * Checks if the current language is Vietnamese.
 *
 * @author Hien
 * @returns {boolean} True if the current language is Vietnamese, false otherwise.
 */
function isVietnamese () {
  return i18n.language === 'vi'
}

type FilterOption = 'COURSE' | 'GROUP'

interface OptionType {
  value: FilterOption
  label: string
}
const options: OptionType[] = [
  { value: 'COURSE', label: 'Dành cho khóa học' },
  { value: 'GROUP', label: 'Dành cho nghiệp vụ' }
]
/**
 * TableExam component for displaying and managing exams in a table.
 *
 * @author Hien
 * @component
 * @returns {JSX.Element} The rendered TableExam component.
 */
const TableExam = () => {
  // TODO: Initialize the translation hook
  const { t } = useTranslation()
  // TODO: Initialize state for the current language
  const [currentLanguage, setCurrentLanguage] = useState<string>(i18n.language)
  // TODO: Initialize state for the exam data
  const [data, setData] = useState<Exam[]>([])
  // TODO: Initialize state for error handling
  const [isError, setIsError] = useState(false)
  // TODO: Initialize state for loading indicator
  const [isLoading, setIsLoading] = useState(false)
  // TODO: Initialize state for refetching indicator
  const [isRefetching, setIsRefetching] = useState(false)
  // TODO: Initialize state for the row count
  const [rowCount, setRowCount] = useState(0)
  // TODO: Initialize state for the filter option
  const [filterOption, setFilterOption] = useState<FilterOption>('COURSE')
  // TODO: Initialize state for the column filters
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>([])
  // TODO: Initialize state for the global filter
  const [globalFilter, setGlobalFilter] = useState('')
  // TODO: Initialize state for the sorting
  const [sorting, setSorting] = useState<MRT_SortingState>([])
  // TODO: Initialize state for the pagination
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 25
  })
  // TODO: Initialize the navigate hook
  const navigate = useNavigate()

  // TODO: Fetch exam data on mount and when filters, pagination, or sorting change
  useEffect(() => {
    /**
     * Fetches the exam data from the API.
     *
     * @author Hien
     * @async
     * @returns {Promise<void>}
     */
    const fetchData = async () => {
      if (!data.length) {
        setIsLoading(true)
      } else {
        setIsRefetching(true)
      }
      try {
        const response = await getExams({
          start: pagination.pageIndex * pagination.pageSize,
          size: pagination.pageSize,
          filters: JSON.stringify(columnFilters ?? []),
          globalFilter: globalFilter ?? '',
          sorting: JSON.stringify(sorting ?? []),
          filterOption
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
      setIsLoading(false)
      setIsRefetching(false)
    }

    fetchData()
  }, [
    columnFilters,
    globalFilter,
    pagination.pageIndex,
    pagination.pageSize,
    sorting,
    filterOption
  ])

  // TODO: Initialize state for the delete ID and name
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleteName, setDeleteName] = useState<string | null>(null)
  // TODO: Initialize state for the modal open state
  const [isModalOpen, setIsModalOpen] = useState(false)
  // TODO: Initialize state for the delete loading state
  const [loadingDelete, setLoadingDelete] = useState<boolean>(false)
  // TODO: Initialize state for the second delete loading state
  const [loadingDelete2, setLoadingDelete2] = useState<boolean>(false)
  // TODO: Initialize state for the row selection
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({})
  // TODO: Initialize state for the second modal open state
  const [isSecondModalOpen, setIsSecondModalOpen] = useState(false)

  /**
   * Handles the deletion of a specific exam by opening the confirmation modal.
   *
   * @author Hien
   * @param {number} id - The ID of the exam to delete.
   * @param {string} name - The name of the exam to delete.
   */
  const handleDelete = (id: number, name: string) => {
    setDeleteId(id)
    setDeleteName(name)
    setIsModalOpen(true)
  }

  /**
   * Confirms the deletion of a single exam.
   *
   * @author Hien
   * @async
   * @returns {Promise<void>}
   */
  const handleConfirmDeleteSingle = async () => {
    if (deleteId === null) {
      toast.error(t('exam_admin.toast.no_exam_delete_selected'))
      return
    }
    try {
      setLoadingDelete(true)
      await deleteExams([deleteId.toString()])
      setData((prevData) => prevData.filter((row) => row.id !== deleteId))
      if (rowSelection[deleteId]) {
        const newRowSelection = Object.keys(rowSelection).reduce((obj: Record<string, boolean>, key) => {
          if (Number(key) !== deleteId) {
            obj[key] = rowSelection[key]
          }
          return obj
        }, {})
        setRowSelection(newRowSelection)
      }
      toast.success(t('exam_admin.toast.exam_delete_success'))
    } catch (error: any) {
      if (error.message === 'Cannot delete question because it is referenced in other records.') {
        toast.error(t('exam_admin.toast.exam_cannot_delete'))
      } else {
        toast.error(t('exam_admin.toast.exam_delete_error'))
      }
    } finally {
      setDeleteId(null)
      setIsModalOpen(false)
      setLoadingDelete(false)
    }
  }

  /**
   * Handles the deletion of selected exams.
   *
   * @author Hien
   */
  const handleDeleteSelected = () => {
    const selectedIds = Object.keys(rowSelection).map(Number)
    if (selectedIds.length === 0) {
      toast.error(t('exam_admin.toast.no_exam_delete_selected'))
      return
    }
    setIsSecondModalOpen(true)
  }

  /**
   * Confirms the deletion of selected lessons.
   *
   * @author Hien
   * @async
   * @returns {Promise<void>}
   */
  const handleConfirmDelete = async () => {
    const selectedIds = Object.keys(rowSelection).map(Number)
    if (selectedIds.length === 0) {
      toast.error(t('exam_admin.toast.no_exam_delete_selected'))
      return
    }
    try {
      setLoadingDelete2(true)
      await deleteExams(selectedIds.map(id => id.toString()))
      setData((prevData) => prevData.filter((row) => !selectedIds.includes(row.id)))
      setRowSelection({})
      toast.success(t('exam_admin.toast.exam_select_delete_success'))
    } catch (error: any) {
      if (error.message === 'Cannot delete question because it is referenced in other records.') {
        toast.error(t('exam_admin.toast.exam_cannot_delete'))
      } else {
        toast.error(t('exam_admin.toast.exam_select_delete_error'))
      }
    } finally {
      setIsModalOpen(false)
      setIsSecondModalOpen(false)
      setLoadingDelete2(false)
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

  // TODO: Define the columns for the table
  const columns = useMemo<Array<MRT_ColumnDef<Exam>>>(() => {
    const baseColumns: Array<MRT_ColumnDef<Exam>> = [
      {
        accessorKey: 'id',
        header: 'ID',
        enableHiding: false
      },
      {
        accessorKey: 'image',
        header: t('exam_admin.exam_image'),
        size: 120,
        enableSorting: false,
        enableColumnFilter: false,
        enableGlobalFilter: false,
        Cell: ({ cell }: { cell: MRT_Cell<Exam> }) => {
          const image = cell.getValue<string>()
          return (
            <div className="w-35 h-20 flex justify-center items-center">
              <img
                className="object-contain max-w-full max-h-full transition-transform duration-700 hover:scale-110"
                src={
                  image
                    ? `${process.env.REACT_APP_API}/uploads/exams/${image}`
                    : 'https://res.cloudinary.com/djlegzpte/image/upload/v1753953155/pngwing.com_n1p7ho.png'
                }
                alt="CourseImage"
              />
            </div>
          )
        }
      },
      { accessorKey: 'name', header: t('exam_admin.exam_name') },
      {
        accessorKey: 'creatorName',
        header: t('exam_admin.creater_name'),
        enableSorting: false,
        enableColumnFilter: false,
        enableGlobalFilter: false
      }
    ]

    // TODO: Add the course or group name column based on the filter option
    if (filterOption === 'COURSE') {
      baseColumns.push({
        accessorKey: 'courseName',
        header: t('exam_admin.exam_course')
      })
    } else {
      baseColumns.push({
        accessorKey: 'groupName',
        header: t('exam_admin.exam_group')
      })
    }

    return baseColumns
  }, [filterOption, currentLanguage])

  // TODO: Define the rows per page options
  const rowsPerPageOptions = [
    { label: '25', value: 25 },
    { label: '100', value: 100 }
  ]

  if (!rowsPerPageOptions.some((opt) => opt.value === data.length)) {
    rowsPerPageOptions.push({ label: t('exam_admin.exam_all'), value: data.length })
  }

  // TODO: Initialize the Material React Table
  const table = useMaterialReactTable({
    columns,
    data,
    enableRowSelection: true,
    getRowId: (row: Exam) => row?.id?.toString(),
    onRowSelectionChange: setRowSelection,
    initialState: {
      sorting: [{ id: 'id', desc: true }],
      columnVisibility: { id: false },
      columnPinning: { right: ['mrt-row-actions'], left: [] }
    },
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
    muiToolbarAlertBannerProps: isError
      ? { color: 'error', children: t('exam_admin.exam_error') }
      : undefined,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    rowCount,
    state: {
      rowSelection,
      columnFilters,
      globalFilter,
      isLoading,
      pagination,
      showAlertBanner: isError,
      showProgressBars: isLoading || isRefetching,
      sorting,
      showLoadingOverlay: isLoading || isRefetching
    },
    editDisplayMode: 'row',
    enableEditing: true,
    autoResetPageIndex: false,
    layoutMode: 'grid',
    positionActionsColumn: 'last',
    enableRowNumbers: true,
    rowNumberDisplayMode: 'original',
    displayColumnDefOptions: {
      'mrt-row-numbers': {
        Header: t('exam_admin.exam_no'),
        enableResizing: true,
        size: 40,
        grow: false
      },
      'mrt-row-actions': {
        muiTableHeadCellProps: {
          align: 'center'
        },
        size: 120
      },
      'mrt-row-select': {
        enableResizing: true,
        size: 40,
        grow: false
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

    muiSkeletonProps: {
      animation: 'pulse',
      height: 28
    },
    muiPaginationProps: {
      rowsPerPageOptions,
      showFirstButton: true,
      showLastButton: true
    },
    paginationDisplayMode: 'pages',
    enableRowActions: true,
    localization: isVietnamese() ? MRT_Localization_VI : undefined,
    enableFilterMatchHighlighting: false,
    muiSearchTextFieldProps: {
      label: t('exam_admin.exam_search_by'),
      placeholder: t('exam_admin.exam_search') ?? ''
    },
    renderRowActions: ({ row }) => (
      <div className="flex flex-row items-center justify-center space-x-2 ">
        <Box>
          {/* Edit button */}
          <Tooltip title= {t('exam_admin.exam_edit')}>
            <button
              className="btn bg-sky-500 hover:bg-sky-400 p-1.5 rounded-sm"
              onClick={() =>
                navigate(ROUTES.examEdit.replace(':id', row.original.id.toString()), { state: { activeTab: 'basic' } })
              }
            >
              <svg className="w-4 h-4 fill-current text-white shrink-0" viewBox="0 0 16 16">
                <path d="M11.7.3c-.4-.4-1-.4-1.4 0l-10 10c-.2.2-.3.4-.3.7v4c0 .6.4 1 1 1h4c.3 0 .5-.1.7-.3l10-10c.4-.4.4-1 0-1.4l-4-4zM4.6 14H2v-2.6l6-6L10.6 8l-6 6zM12 6.6L9.4 4 11 2.4 13.6 5 12 6.6z" />
              </svg>
            </button>
          </Tooltip>
        </Box>
        <Box>
          {/* Question button */}
          <Tooltip title= {t('exam_admin.exam_question')}>
            <button
              className="btn bg-orange-500 hover:bg-orange-400 p-1 rounded-sm"
              onClick={() =>
                navigate(ROUTES.examEdit.replace(':id', row.original.id.toString()), { state: { activeTab: 'compose' } })
              }
            >
            <QuizOutlinedIcon sx={{ fontSize: 18, color: 'white' }} />
            </button>
          </Tooltip>
        </Box>
        <Box>
          {/* Setting button */}
          <Tooltip title={t('exam_admin.exam_setting')}>
            <button
              className="btn bg-teal-500 hover:bg-teal-400 p-1 rounded-sm"
              onClick={() =>
                navigate(ROUTES.examEdit.replace(':id', row.original.id.toString()), { state: { activeTab: 'advanced' } })
              }
            >
            <SettingsOutlinedIcon sx={{ fontSize: 18, color: 'white' }} />
            </button>
          </Tooltip>
        </Box>
        <Box>
          {/* Statistic button */}
          <Tooltip title={t('exam_admin.exam_statistic')}>
            <button
              className="btn bg-fuchsia-500 hover:bg-fuchsia-400 p-1 rounded-sm"
              onClick={() =>
                navigate(ROUTES.examEdit.replace(':id', row.original.id.toString()), { state: { activeTab: 'statistics' } })
              }
            >
            <SignalCellularAltOutlinedIcon sx={{ fontSize: 18, color: 'white' }} />
            </button>
          </Tooltip>
        </Box>
        <Box>
          {/* Delete button */}
          <Tooltip title={t('exam_admin.exam_delete')}>
            <button className="btn bg-red-500 hover:bg-red-400 p-1.5 rounded-sm" onClick={() => handleDelete(row.original.id, row.original.name)}>
              <svg className="w-4 h-4 fill-current text-white shrink-0" viewBox="0 0 16 16">
                <path d="M5 7h2v6H5V7zm4 0h2v6H9V7zm3-6v2h4v2h-1v10c0 .6-.4 1-1 1H2c-.6 0-1-.4-1-1V5H0V3h4V1c0-.6.4-1 1-1h6c.6 0 1 .4 1 1zM6 2v1h4V2H6zm7 3H3v9h10V5z" />
              </svg>
            </button>
          </Tooltip>
        </Box>
      </div>
    ),
    renderTopToolbarCustomActions: ({ table }) => (
      <div className="flex space-x-2 mt-2">
        <Box>
          {/* Delete selected button */}
          <Tooltip title={t('exam_admin.exam_delete_selected')}>
            <button className="btn bg-red-500 hover:bg-red-400 p-1.5 rounded-sm" onClick={handleDeleteSelected}>
              <svg className="w-4 h-4 fill-current text-white shrink-0" viewBox="0 0 16 16">
                <path d="M5 7h2v6H5V7zm4 0h2v6H9V7zm3-6v2h4v2h-1v10c0 .6-.4 1-1 1H2c-.6 0-1-.4-1-1V5H0V3h4V1c0-.6.4-1 1-1h6c.6 0 1 .4 1 1zM6 2v1h4V2H6zm7 3H3v9h10V5z" />
              </svg>
            </button>
          </Tooltip>
        </Box>
        <Box>
          {/* Add button */}
          <Tooltip title={t('exam_admin.exam_add')}>
            <button
              className="btn bg-green-500 hover:bg-green-400 p-1.5 rounded-sm"
              onClick={() => navigate('/exam-management/add')}
            >
              <svg className="w-4 h-4 fill-current text-white shrink-0" viewBox="0 0 16 16">
                <path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1z" />
              </svg>
            </button>
          </Tooltip>
        </Box>
      </div>
    )
  })

  return (
    <div className="bg-white shadow-lg rounded-sm border border-slate-200 relative w-full">
      {/* Filter select */}
      <div className="py-10 px-5 w-1/3 flex flex-col">
        <label className="font-semibold mb-2">{t('exam_admin.exam_type')}</label>
        <Select
          className="z-20 w-full h-10"
          options={options}
          value={options.find((opt) => opt.value === filterOption)}
          onChange={(selectedOption: SingleValue<OptionType>) => {
            setFilterOption(selectedOption?.value || 'COURSE')
            setGlobalFilter('')
            setColumnFilters([])
            setSorting([])
            setPagination((prev) => ({ ...prev, pageIndex: 0 }))
          }}
          formatOptionLabel={(option: OptionType) =>
            t(`exam_admin.basic_info.${option.value === 'COURSE' ? 'course_exam' : 'group_exam'}`)
          }
        />
      </div>
      {/* Material React Table */}
      <MaterialReactTable table={table} />
      {/* Delete confirmation modal */}
      <ModalComponent
        isOpen={isModalOpen}
        title={t('exam_admin.exam_confirm_delete') ?? ''}
        imageUrl='/assets/images/permission/delete.png'
        description={t('exam_admin.exam_confirm_delete_single', { name: deleteName }) ?? ''}
        onClose={() => {
          setIsModalOpen(false)
        }}
        onOk={handleConfirmDeleteSingle}
        onCancel={() => {
          setIsModalOpen(false)
        }}
        loading={loadingDelete}
      />
      {/* Delete selected confirmation modal */}
      <ModalComponent
        isOpen={isSecondModalOpen}
        title={t('exam_admin.exam_confirm_delete') ?? ''}
        imageUrl='/assets/images/permission/delete.png'
        description={t('exam_admin.exam_confirm_delete_selected', { count: Object.keys(rowSelection).length }) ?? ''}
        onClose={() => {
          setIsSecondModalOpen(false)
        }}
        onOk={deleteId !== null ? handleConfirmDeleteSingle : handleConfirmDelete}
        onCancel={() => {
          setIsSecondModalOpen(false)
        }}
        loading={loadingDelete2}
      />
    </div>
  )
}

export default TableExam
