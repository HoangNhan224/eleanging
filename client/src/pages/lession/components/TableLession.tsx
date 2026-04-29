/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable react/prop-types */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* PAGE: TableUser
========================================================================== */

import React, { useEffect, useState, useMemo } from 'react'
import Select, { SingleValue } from 'react-select'
import { useLocation, useNavigate } from 'react-router-dom'

import {
  MaterialReactTable,
  type MRT_ColumnDef,
  useMaterialReactTable,
  type MRT_RowSelectionState,
  type MRT_Row
} from 'material-react-table'
import { getCourseLession, getCategoryLessionsByCourseId, getLessionsByCategoryLessionId, deleteLessions, updateLessionOrder } from 'api/post/post.api'
import { Box, Tooltip, Modal, Backdrop, Fade } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { toast } from 'react-toastify'
import YouTube from 'react-youtube'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { pdfjs, Document, Page } from 'react-pdf'
import 'react-pdf/dist/esm/Page/TextLayer.css'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import { useMediaQuery } from 'react-responsive'

import ModalComponent from '../../../components/Modal'

import { MRT_Localization_VI } from 'material-react-table/locales/vi'
import { useTranslation } from 'react-i18next'
import { i18n } from 'services/i18n'

function isVietnamese () {
  return i18n.language === 'vi'
}

interface OptionType {
  value: string
  label: string | undefined
}

interface Lession {
  id: number
  name: string
  type: string
  order: number
  locationPath: string
  uploadedBy: string
}

interface Course {
  id: string
  name: string
}

interface CategoryLesson {
  id: string
  name: string
}

/**
 * Example component displays a table of lessons with various functionalities.
 *
 * @author Hien
 * @component
 * @returns {JSX.Element} The rendered Example component.
 *
 * @property {object} t - The translation function from useTranslation hook.
 * @property {Course[]} courses - The state for storing course data.
 * @property {string} selectedCourse - The state for storing the selected course ID.
 * @property {CategoryLesson[]} categoryLessons - The state for storing category lesson data.
 * @property {string} initialSelectedCategoryLesson - The state for storing the initially selected category lesson ID.
 * @property {string} selectedCategoryLesson - The state for storing the selected category lesson ID.
 * @property {Lession[]} lessons - The state for storing lesson data.
 * @property {boolean} loading - The state for managing loading state.
 * @property {boolean} loadingDelete - The state for managing delete loading state.
 * @property {boolean} loadingDelete2 - The state for managing second delete loading state.
 * @property {number | null} deleteId - The state for storing the ID of the lesson to be deleted.
 * @property {string | null} deleteName - The state for storing the name of the lesson to be deleted.
 * @property {boolean} isModalOpen - The state for managing the first modal's visibility.
 * @property {boolean} isSecondModalOpen - The state for managing the second modal's visibility.
 * @property {MRT_RowSelectionState} rowSelection - The state for managing row selection.
 * @property {boolean} isVideoModalOpen - The state for managing the video modal's visibility.
 * @property {string} videoUrl - The state for storing the video URL.
 * @property {string | null} pdfFileName - The state for storing the PDF file name.
 * @property {boolean} isPdfModalOpen - The state for managing the PDF modal's visibility.
 * @property {number} numPages - The state for storing the number of pages in the PDF.
 * @property {boolean} isSmallScreen - The state for managing screen size.
 * @property {string} currentLanguage - The state for storing the current language.
 */
const Example: React.FC = (props) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { selectedCourse: initialSelectedCourse, selectedCategoryLesson: initialSelectedCategoryLessonFromLocation } = location.state || {}
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState<string>(initialSelectedCourse || '')
  const [categoryLessons, setCategoryLessons] = useState<CategoryLesson[]>([])
  const [initialSelectedCategoryLesson, setInitialSelectedCategoryLesson] = useState<string>(initialSelectedCategoryLessonFromLocation || '')
  const [selectedCategoryLesson, setSelectedCategoryLesson] = useState<string>(initialSelectedCategoryLessonFromLocation || '')
  const [lessons, setLessons] = useState<Lession[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [loadingDelete, setLoadingDelete] = useState<boolean>(false)
  const [loadingDelete2, setLoadingDelete2] = useState<boolean>(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  // const [editingId, setEditingId] = useState<number | null>(null)
  const [deleteName, setDeleteName] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSecondModalOpen, setIsSecondModalOpen] = useState(false)
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({})
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)
  const [videoUrl, setVideoUrl] = useState<string>('')
  const [pdfFileName, setPdfFileName] = useState<string | null>(null)
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false)
  const [numPages, setNumPages] = useState<number>(1)
  const isSmallScreen = useMediaQuery({ maxWidth: 767 })

  const [currentLanguage, setCurrentLanguage] = useState<string>(i18n.language)

  // States for reorder confirmation modal
  const [isReorderModalOpen, setIsReorderModalOpen] = useState(false)
  const [pendingReorder, setPendingReorder] = useState<{ hoveredRow: MRT_Row<Lession>, draggingRow: MRT_Row<Lession> } | null>(null)
  const [loadingReorder, setLoadingReorder] = useState<boolean>(false)

  /**
   * Returns the file path for a given PDF file name.
   *
   * @author Hien
   * @param {string} fileName - The name of the PDF file.
   * @returns {string | null} The file path or null if not found.
   */
  const getPdfFilePath = (fileName: string) => {
    try {
      return `${process.env.REACT_APP_API}/uploads/lessions/${fileName}`
    } catch (error) {
      // toast.error(t('lesson.toast.failed_to_fetch_pdf'))
      return null
    }
  }

  /**
   * Handles the successful loading of a PDF document.
   *
   * @author Hien
   * @param {object} param - The parameters for the document load success.
   * @param {number | null} param.numPages - The number of pages in the document.
   */
  function onDocumentLoadSuccess ({ numPages }: { numPages: number | null }) {
    setNumPages(numPages ?? 0)
  }

  // Updates the current language state when the language changes.
  useEffect(() => {
    const handleLanguageChange = () => {
      setCurrentLanguage(i18n.language)
    }

    i18n.on('languageChanged', handleLanguageChange)
    return () => {
      i18n.off('languageChanged', handleLanguageChange)
    }
  }, [])

  // Fetches all courses on component mount.
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await getCourseLession()
        const courses = response.data
        setCourses(courses)
        if (courses.length > 0 && !initialSelectedCourse) {
          const maxCourseId = courses.reduce((max: string, course: Course) => (course.id > max ? course.id : max), courses[0].id)
          setSelectedCourse(maxCourseId)
        }
      } catch (error) {
        // toast.error(t('lesson.toast.failed_to_fetch_courses'))
      }
    }
    fetchCourses()
  }, [])

  // Fetches category lessons when the selected course changes.
  useEffect(() => {
    if (selectedCourse !== '') {
      const fetchCategoryLessons = async () => {
        try {
          const response = await getCategoryLessionsByCourseId({ courseId: selectedCourse })
          const categoryLessons = response.data
          setCategoryLessons(categoryLessons)
          if (categoryLessons.length > 0 && !initialSelectedCategoryLesson) {
            const minCategoryLessonId = categoryLessons.reduce((min: string, categoryLesson: CategoryLesson) => (categoryLesson.id < min ? categoryLesson.id : min), categoryLessons[0].id)
            setSelectedCategoryLesson(minCategoryLessonId)
            void fetchLessons(minCategoryLessonId)
          }
        } catch (error) {
          // toast.error(t('lesson.toast.failed_to_fetch_category_lessons'))
        }
      }
      fetchCategoryLessons()
    }
  }, [selectedCourse])

  // Fetches lessons when the selected category lesson changes.
  useEffect(() => {
    if (selectedCategoryLesson !== '') {
      fetchLessons(selectedCategoryLesson)
    }
  }, [selectedCategoryLesson])

  // Resets the initial selected category lesson when the selected course changes.
  useEffect(() => {
    setInitialSelectedCategoryLesson('')
  }, [selectedCourse])

  /**
   * Fetches lessons for a given category lesson ID.
   *
   * @author Hien
   * @async
   * @param {string} categoryLessonId - The ID of the category lesson.
   */
  const fetchLessons = async (categoryLessonId: string) => {
    try {
      setLoading(true)
      const response = await getLessionsByCategoryLessionId({ categoryLesionId: categoryLessonId })
      if (response.data.length === 0) {
        console.warn('No lessons found')
      }
      const sortedLessons = response.data.sort((a: Lession, b: Lession) => a.order - b.order)
      setLessons(sortedLessons)
    } catch (error) {
      // toast.error(t('lesson.toast.failed_to_fetch_lessons'))
      setLessons([])
    } finally {
      setLoading(false)
    }
  }

  /**
   * Handles the deletion of a specific lesson by opening the confirmation modal.
   *
   * @author Hien
   * @param {number} id - The ID of the lesson to delete.
   * @param {string} name - The name of the lesson to delete.
   */
  const handleDelete = (id: number, name: string) => {
    setDeleteId(id)
    setDeleteName(name)
    setIsModalOpen(true)
  }

  /**
   * Confirms the deletion of a single lesson.
   *
   * @author Hien
   * @async
   * @returns {Promise<void>}
   */
  const handleConfirmDeleteSingle = async () => {
    if (deleteId === null) {
      toast.error(t('lesson.toast.no_row_selected_to_delete'))
      return
    }
    try {
      setLoadingDelete(true)
      await deleteLessions([deleteId.toString()])
      setLessons((prevData) => prevData.filter((row) => row.id !== deleteId))
      if (rowSelection[deleteId]) {
        const newRowSelection = Object.keys(rowSelection).reduce((obj: Record<string, boolean>, key) => {
          if (Number(key) !== deleteId) {
            obj[key] = rowSelection[key]
          }
          return obj
        }, {})
        setRowSelection(newRowSelection)
      }
      toast.success(t('lesson.toast.delete_successfully'))
    } catch (error) {
      toast.error(t('lesson.toast.delete_failed'))
    } finally {
      setDeleteId(null)
      setIsModalOpen(false)
      setLoadingDelete(false)
    }
  }

  // Handles the deletion of selected lessons by opening the confirmation modal.
  const handleDeleteSelected = () => {
    const selectedIds = Object.keys(rowSelection).map(Number)
    if (selectedIds.length === 0) {
      toast.error(t('lesson.toast.no_row_selected_to_delete'))
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
      toast.error(t('lesson.toast.no_row_selected_to_delete'))
      return
    }
    try {
      setLoadingDelete2(true)
      await deleteLessions(selectedIds.map(id => id.toString()))
      setLessons((prevData) => prevData.filter((row) => !selectedIds.includes(row.id)))
      setRowSelection({})
      toast.success(t('lesson.toast.delete_selected_successfully'))
    } catch (error) {
      toast.error(t('lesson.toast.delete_selected_failed'))
    } finally {
      setIsModalOpen(false)
      setIsSecondModalOpen(false)
      setLoadingDelete2(false)
    }
  }

  /**
   * Handles updating the order of lessons.
   *
   * author Hien
   * @async
   * @param {MRT_Row<Lession>} hoveredRow - The row being hovered over.
   * @param {MRT_Row<Lession>} draggingRow - The row being dragged.
   * @returns {Promise<void>}
   */
  const handleRowOrderChange = async (hoveredRow: MRT_Row<Lession>, draggingRow: MRT_Row<Lession>) => {
    const updatedLessons = [...lessons]
    const draggedLesson = updatedLessons.find(lesson => lesson.id === parseInt(draggingRow.id))
    const targetLesson = updatedLessons.find(lesson => lesson.id === parseInt(hoveredRow.id))

    if (!draggedLesson || !targetLesson) {
      toast.error(t('lesson.toast.failed_to_update_order'))
      return
    }

    const tempOrder = draggedLesson.order
    draggedLesson.order = targetLesson.order
    targetLesson.order = tempOrder

    updatedLessons.sort((a, b) => a.order - b.order)

    try {
      setLoadingReorder(true)
      await updateLessionOrder({
        updatedLessons: updatedLessons.map(lesson => ({ id: lesson.id, order: lesson.order })),
        draggingRowId: draggingRow.id,
        hoveredRowId: hoveredRow.id,
        courseId: selectedCourse,
        categoryLessonId: selectedCategoryLesson
      })
      setLessons(updatedLessons)
      toast.success(t('lesson.toast.order_updated_successfully'))
    } catch (error) {
      toast.error(t('lesson.toast.failed_to_update_order'))
    } finally {
      setLoadingReorder(false)
      setIsReorderModalOpen(false)
      setPendingReorder(null)
    }
  }

  /**
   * Confirms the reorder action and executes it.
   *
   * @author Khanh
   * @async
   * @returns {Promise<void>}
   */
  const handleConfirmReorder = async () => {
    if (pendingReorder) {
      await handleRowOrderChange(pendingReorder.hoveredRow, pendingReorder.draggingRow)
    }
  }

  /**
   * Cancels the reorder action.
   *
   * @author Khanh
   * @returns {void}
   */
  const handleCancelReorder = () => {
    setIsReorderModalOpen(false)
    setPendingReorder(null)
    // Refresh lessons to restore original order
    if (selectedCategoryLesson !== '') {
      fetchLessons(selectedCategoryLesson)
    }
  }

  /**
   * Handles editing a lesson.
   *
   * @author Hien
   * @param {number} id - The ID of the lesson to edit.
   * @param {string} name - The name of the lesson to edit.
   * @param {Lession} lession - The lesson data.
   */
  const handleEdit = (id: number, name: string, lession: Lession) => {
    navigate(`/lesson/edit/${id}`, { state: { mode: 'edit', id, lession, selectedCourse, selectedCategoryLesson } })
  }

  // Memoized columns configuration
  const columns = useMemo<Array<MRT_ColumnDef<Lession>>>(
    () => [
      {
        accessorKey: 'id',
        header: t('lesson.id'),
        enableHiding: false
      },
      {
        accessorKey: 'name',
        header: t('lesson.name'),
        muiTableBodyCellProps: {
          align: 'left'
        },
        Cell: ({ cell }) => {
          const nameLession = cell.getValue<string>()
          return (
            <Tooltip title={nameLession}>
              <div className="truncate w-full sm:w-auto">
                {nameLession}
              </div>
            </Tooltip>
          )
        }
      },
      {
        accessorKey: 'type',
        header: t('lesson.type'),
        enableGlobalFilter: false,
        muiTableBodyCellProps: {
          align: 'left'
        }
      },
      {
        accessorKey: 'locationPath',
        header: t('lesson.location_path'),
        enableGlobalFilter: false,
        muiTableBodyCellProps: {
          align: 'left'
        },
        size: 400,
        Cell: ({ row, cell }) => {
          const locationPath = cell.getValue<string>()
          return (
            <Tooltip title={locationPath}>
              <div className="truncate w-full sm:w-auto">
                <a
                  href="#"
                  className="text-blue-500 italic"
                  onClick={(e) => {
                    e.preventDefault()
                    if (row.original.type === 'MP4') {
                      setVideoUrl(locationPath)
                      setIsVideoModalOpen(true)
                    } else if (row.original.type === 'PDF') {
                      setPdfFileName(locationPath)
                      setIsPdfModalOpen(true)
                    } else {
                      toast.error(t('lesson.toast.only_MP4_and_PDF_type_lessons_can_be_viewed'))
                    }
                  }}
                >
                  {locationPath}
                </a>
              </div>
            </Tooltip>
          )
        }
      }
    ],
    [currentLanguage]
  )

  // Initialize the table with configurations
  const table = useMaterialReactTable({
    columns,
    data: lessons,
    enableSorting: false,
    enableColumnFilters: false,
    paginationDisplayMode: 'pages',
    initialState: {
      pagination: { pageSize: 25, pageIndex: 0 },
      sorting: [{ id: 'id', desc: true }],
      columnVisibility: { id: false },
      columnPinning: { right: ['mrt-row-actions'], left: [] } // This section will display sticky edit and delete buttons
    },
    enableRowSelection: true,
    positionToolbarAlertBanner: 'top',
    enableFilterMatchHighlighting: true,
    getRowId: (row: Lession) => row.id.toString(),
    onRowSelectionChange: setRowSelection,
    state: {
      rowSelection,
      showLoadingOverlay: !!loading,
      showProgressBars: !!loading
    },
    editDisplayMode: 'row',
    enableEditing: true,
    autoResetPageIndex: false,
    positionActionsColumn: 'last',
    muiSearchTextFieldProps: {
      label: t('lesson.search')
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
    enableRowActions: true,
    renderRowActions: ({ row, table }) => (
      <div className="flex flex-row items-center justify-center space-x-2 ">
        <Box>
          <Tooltip title= {t('lesson.edit')}>
            <button className="btn bg-sky-500 hover:bg-sky-400  p-1.5 rounded-sm" onClick={() => handleEdit(row.original.id, row.original.name, row.original)}>
              <svg className="w-4 h-4 fill-current text-white shrink-0" viewBox="0 0 16 16">
                <path d="M11.7.3c-.4-.4-1-.4-1.4 0l-10 10c-.2.2-.3.4-.3.7v4c0 .6.4 1 1 1h4c.3 0 .5-.1.7-.3l10-10c.4-.4.4-1 0-1.4l-4-4zM4.6 14H2v-2.6l6-6L10.6 8l-6 6zM12 6.6L9.4 4 11 2.4 13.6 5 12 6.6z" />
              </svg>
            </button>
          </Tooltip>
        </Box>
        <Box>
          <Tooltip title= {t('lesson.delete')}>
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
          <Tooltip title= {t('lesson.click_to_delete_selected_rows')}>
            <button className="btn bg-red-500 hover:bg-red-400 p-1.5 rounded-sm" onClick={handleDeleteSelected}>
              <svg className="w-4 h-4 fill-current text-white shrink-0" viewBox="0 0 16 16">
                <path d="M5 7h2v6H5V7zm4 0h2v6H9V7zm3-6v2h4v2h-1v10c0 .6-.4 1-1 1H2c-.6 0-1-.4-1-1V5H0V3h4V1c0-.6.4-1 1-1h6c.6 0 1 .4 1 1zM6 2v1h4V2H6zm7 3H3v9h10V5z" />
              </svg>
            </button>
          </Tooltip>
        </Box>
        <Box>
          <Tooltip title= {t('lesson.click_to_create_new')}>
            <button
              className="btn bg-green-500 hover:bg-green-400 p-1.5 rounded-sm"
              onClick={() => navigate('/lesson/add', { state: { mode: 'add', selectedCourse, selectedCategoryLesson } })}
            >
              <svg className="w-4 h-4 fill-current text-white shrink-0" viewBox="0 0 16 16">
                <path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1z" />
              </svg>
            </button>
          </Tooltip>
        </Box>
      </div>
    ),
    enableRowOrdering: true,
    muiRowDragHandleProps: ({ table }) => ({
      onDragEnd: () => {
        const { draggingRow, hoveredRow } = table.getState()
        if (hoveredRow && draggingRow) {
          lessons.splice(
            (hoveredRow as MRT_Row<Lession>).index,
            0,
            lessons.splice(draggingRow.index, 1)[0]
          )
        }
        if (hoveredRow?.index !== undefined && draggingRow) {
          // Show confirmation modal before reordering
          setPendingReorder({
            hoveredRow: hoveredRow as MRT_Row<Lession>,
            draggingRow
          })
          setIsReorderModalOpen(true)
        }
      }
    }),
    enableRowNumbers: true,
    rowNumberDisplayMode: 'original',
    layoutMode: 'grid',
    muiPaginationProps: {
      rowsPerPageOptions: [
        { label: '25', value: 25 },
        { label: '100', value: 100 },
        { label: t('lesson.All'), value: lessons.length }
      ],
      showFirstButton: true,
      showLastButton: true
    },
    displayColumnDefOptions: {
      'mrt-row-numbers': {
        Header: t('lesson.no'),
        enableResizing: true,
        size: 40,
        grow: false
      },
      'mrt-row-drag': {
        enableResizing: true,
        size: 80,
        grow: false
      },
      'mrt-row-select': {
        enableResizing: true,
        size: 40,
        grow: false
      }
    },
    localization: isVietnamese() ? MRT_Localization_VI : undefined
  })

  return (
    <div>
      <div className='py-10 px-5 w-full'>
        <div className='grid gap-5 md:grid-cols-2'>
          <div className="flex flex-col">
            <label htmlFor="courseSelect" className="mb-2 font-bold text-black">{t('lesson.course')}</label>
            <Select
              id="courseSelect"
              className="z-20 w-full h-10"
              options={courses.map(course => ({ value: course.id, label: course.name }))}
              value={courses.find(course => course.id === selectedCourse) ? { value: selectedCourse, label: courses.find(course => course.id === selectedCourse)?.name } : null}
              onChange={(option: SingleValue<OptionType>) => {
                if (option?.value === selectedCourse) return
                setLessons([])
                setCategoryLessons([])
                setSelectedCategoryLesson('')
                setRowSelection({})
                setSelectedCourse(option?.value ?? '')
              }}
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="categoryLessonSelect" className="mb-2 font-bold">{t('lesson.category_lesson')}</label>
            <Select
              id="categoryLessonSelect"
              className="z-10 w-full h-10"
              options={categoryLessons.map(categoryLesson => ({ value: categoryLesson.id, label: categoryLesson.name }))}
              value={categoryLessons.find(categoryLesson => categoryLesson.id === selectedCategoryLesson) ? { value: selectedCategoryLesson, label: categoryLessons.find(categoryLesson => categoryLesson.id === selectedCategoryLesson)?.name } : null}
              onChange={(option: SingleValue<OptionType>) => {
                if (option?.value === selectedCategoryLesson) return
                setLessons([])
                setRowSelection({})
                setSelectedCategoryLesson(option?.value ?? '')
              }}
            />
          </div>
        </div>
      </div>
      <MaterialReactTable table={table} />
      <ModalComponent
        isOpen={isModalOpen}
        title={t('lesson.confirm_delete') ?? ''}
        description={t('lesson.confirm_delete_single', { name: deleteName }) ?? ''}
        imageUrl='/assets/images/permission/delete.png'
        onClose={() => {
          setIsModalOpen(false)
        }}
        onOk={handleConfirmDeleteSingle}
        onCancel={() => {
          setIsModalOpen(false)
        }}
        loading={loadingDelete}
      />
      <ModalComponent
        isOpen={isSecondModalOpen}
        title={t('lesson.confirm_delete') ?? ''}
        imageUrl='/assets/images/permission/delete.png'
        description={t('lesson.confirm_delete_multiple', { count: Object.keys(rowSelection).length }) ?? ''}
        onClose={() => {
          setIsSecondModalOpen(false)
        }}
        onOk={deleteId !== null ? handleConfirmDeleteSingle : handleConfirmDelete}
        onCancel={() => {
          setIsSecondModalOpen(false)
        }}
        loading={loadingDelete2}
      />
      <Modal
        open={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500
        }}
      >
        <Fade in={isVideoModalOpen}>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl bg-white shadow-xl" style={{ maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
        <div className="flex justify-end p-2 border-b border-gray-200 flex-shrink-0">
            <button
              className="hover:bg-gray-100 rounded-full p-1"
              onClick={() => setIsVideoModalOpen(false)}
            >
              <CloseIcon />
            </button>
        </div>
        <div className="flex-1 p-4 flex items-center justify-center">
          <div className="w-full h-full">
            <YouTube
              videoId={videoUrl}
              opts={{
                width: '100%',
                height: isSmallScreen ? '250' : '400',
                playerVars: { autoplay: 1 }
              }}
              className="w-full h-full"
            />
          </div>
        </div>
          </div>
        </Fade>
      </Modal>
      <Modal
        open={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500
        }}
      >
        <Fade in={isPdfModalOpen}>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl bg-white shadow-xl" style={{ maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
          <div className="flex justify-end p-2 border-b border-gray-200 flex-shrink-0">
            <button
              className="hover:bg-gray-100 rounded-full p-1"
              onClick={() => setIsPdfModalOpen(false)}
            >
              <CloseIcon />
            </button>
          </div>
          <div className="flex-1 overflow-auto p-4">
            <div className='flex items-center justify-center w-full h-auto'>
              {pdfFileName && (
                <Document
                  file={getPdfFilePath(pdfFileName)}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={console.error}
                >
                  {Array.from(new Array(numPages), (el, index) => (
                    <React.Fragment key={`page_${index + 1}`}>
                      <Page
                        pageNumber={index + 1}
                        width={isSmallScreen ? 400 : 800}
                        className="pdf-page"
                        renderMode="canvas"
                      />
                      {index < numPages - 1 && <div className="border-t border-gray-200 my-2" />}
                    </React.Fragment>
                  ))}
                </Document>
              )}
            </div>
            </div>
          </div>
        </Fade>
      </Modal>
      <ModalComponent
        isOpen={isReorderModalOpen}
        title={t('lesson.confirm_reorder') ?? ''}
        imageUrl='/assets/images/permission/delete.png'
        description={t('lesson.confirm_reorder_message') ?? ''}
        onClose={handleCancelReorder}
        onOk={handleConfirmReorder}
        onCancel={handleCancelReorder}
        loading={loadingReorder}
      />
    </div>
  )
}

export default Example
