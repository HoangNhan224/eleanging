/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable react/prop-types */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* PAGE: tableUser
========================================================================== */
import React, { useEffect, useState, useMemo } from 'react'
import Select, { SingleValue } from 'react-select'
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  useMaterialReactTable,
  type MRT_RowSelectionState
} from 'material-react-table'
import { getCoursesData, getdeleteCourse, getCategoryCourseData } from 'api/post/post.api'// fetchAllCategorycourse, updateCategoryCourse, createCategoryCourse, deleteCategoryCourse
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Box, Button, DialogActions, DialogContent, DialogTitle, IconButton, Tooltip } from '@mui/material'
import ModalComponent from '../../../src/components/Modal/index'
import { toast } from 'react-toastify'

import { useNavigate } from 'react-router-dom'
import { i18n } from 'services/i18n'
import { MRT_Localization_VI } from 'material-react-table/locales/vi'
import { useTranslation } from 'react-i18next'

function isVietnamese () {
  return i18n.language === 'vi'
}
// import { Link } from 'react-router-dom'
interface categorycourse {
  assignBy: number
  categoryCoursename: string
  id: string
  categoryCourseId: number
  name: string
  summary: string
  assignedBy: number
  durationInMinute: number
  startDate: string
  endDate: string
  description: string
  locationPath: string
  prepare: string
  price: number
}
interface Course {
  id: string
  name: string
}
interface OptionType {
  value: string
  label: string | undefined
}
const categoryCourse = () => {
  const navigate = useNavigate()

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [data, setData] = useState<categorycourse[]>([])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({})
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSecondModalOpen, setIsSecondModalOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [selectedCourse, setSelectedCourse] = useState<string>('')
  const [courses, setCourses] = useState<Course[]>([])
  const [currentLanguage, setCurrentLanguage] = useState<string>(i18n.language)
  const { t } = useTranslation()

  const handleDelete = (id: number) => {
    setDeleteId(id)
    setIsModalOpen(true)
  }
  useEffect(() => {
    const handleLanguageChange = () => {
      setCurrentLanguage(i18n.language)
    }

    i18n.on('languageChanged', handleLanguageChange)
    return () => {
      i18n.off('languageChanged', handleLanguageChange)
    }
  }, [])
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await getCategoryCourseData()
        const coursesData = response.data
        setCourses(coursesData)
        if (coursesData.length > 0) {
          const maxCourseId = coursesData.reduce((max: string, course: Course) => (course.id > max ? course.id : max), coursesData[0].id)
          setSelectedCourse(maxCourseId)
        }
      } catch (error) {
        toast.error(t('course_admin.failed_to_fetch_courses'))
      }
    }
    fetchCourses()
  }, [])

  useEffect(() => {
    const fetchCoursesByCategory = async () => {
      if (selectedCourse) {
        try {
          const response = await getCoursesData({ categorycourseid: selectedCourse })
          setData(response.data.data)
        } catch (error) {
          toast.error(t('course_admin.failed_to_fetch_course_for_categories'))
        }
      }
    }
    fetchCoursesByCategory()
  }, [selectedCourse])
  const handleConfirmDeleteSingle = async () => {
    try {
      // Check if deleteId is null, indicating no ID is available for deletion
      if (deleteId === null) {
        console.log('No id to delete')
        return
      }

      // Call API to delete the course with the given deleteId
      await getdeleteCourse(deleteId.toString())

      // Update the data state by filtering out the deleted row
      setData((prevData) => prevData.filter((row) => Number(row.id) !== deleteId))

      // If the row is selected (exists in rowSelection), remove it from the selection
      if (rowSelection[deleteId]) {
        // Create a new row selection object without the deleted row
        const newRowSelection = Object.keys(rowSelection).reduce((obj: Record<string, boolean>, key) => {
          if (Number(key) !== deleteId) {
            obj[key] = rowSelection[key]
          }
          return obj
        }, {})
        // Update the rowSelection state with the new selection
        setRowSelection(newRowSelection)
      }

      // Log the deleted ID for debugging purposes
      console.log('Deleted ID:', deleteId)

      // Reset deleteId and close the modal
      setDeleteId(null)
      setIsModalOpen(false)

      // Display a success message using a toast notification
      toast.success(t('course_admin.delete_successfully'))
    } catch (error: any) {
      // Handle specific error case when the course cannot be deleted due to existing references
      if (error.response && error.response.data === 'Cannot delete course due to existing references') {
        toast.error(t('course_admin.delete_failed'))
      } else {
        // Log any other errors and display a general error toast notification
        console.error('Error deleting course:', error)
        toast.error(t('course_admin.delete_failed'))
      }

      // If the deletion failed, ensure the row is removed from rowSelection
      if (deleteId !== null && rowSelection[deleteId]) {
        // Create a new row selection object excluding the failed deleteId
        const newRowSelection = Object.keys(rowSelection).reduce((obj: Record<string, boolean>, key) => {
          if (Number(key) !== deleteId) {
            obj[key] = rowSelection[key]
          }
          return obj
        }, {})
        // Update the rowSelection state with the modified selection
        setRowSelection(newRowSelection)
      }

      // Reset deleteId and close the modal even if an error occurred
      setDeleteId(null)
      setIsModalOpen(false)
    }
  }

  const handleDeleteSelected = () => {
    const selectedIds = Object.keys(rowSelection).map(Number)
    if (selectedIds.length === 0) {
      toast.error(t('course_admin.no_row_selected_to_delete'))
      return
    }
    setIsSecondModalOpen(true)
  }
  const handleCourse = (courseId: string) => {
    const courseUrl = `/courses/${courseId}`
    navigator.clipboard.writeText(window.location.origin + courseUrl).then(() => {
      toast.success(t('course_admin.course_url_copy_successfully'))
    }).catch((err) => {
      console.error('Failed to copy URL: ', err)
      toast.error(t('course_admin.failed_to_copy_course_url'))
    })
  }
  //  * Handles the deletion of selected courses by their IDs, with success and failure tracking.
  //  * @author Quoc
  //  * The function attempts to delete all selected courses. If successful, the courses are removed from the data state. If any deletions fail, the failed courses are logged and displayed in an error message.
  const handleConfirmDelete = async () => {
    // Get the list of selected IDs from the row selection state and convert them to numbers
    const selectedIds = Object.keys(rowSelection).map(Number)

    // Arrays to track the IDs of successfully and unsuccessfully deleted courses
    const successfullyDeletedIds: number[] = []
    const unsuccessfullyDeletedIds: Array<{ id: number, name: string }> = []

    // Attempt to delete each selected course asynchronously
    await Promise.all(
      selectedIds.map(async (id) => {
        try {
          // Try to delete the course by ID
          await getdeleteCourse(id.toString())

          // If successful, add the ID to the list of successfully deleted IDs
          successfullyDeletedIds.push(id)
        } catch (error: any) {
          // If deletion fails, check if a category name is returned in the error response
          const categoryName = error.response?.data?.categoryCourseName

          // Add the failed course to the list of unsuccessfully deleted courses with its name or 'Unknown'
          if (categoryName) {
            unsuccessfullyDeletedIds.push({ id, name: categoryName })
          } else {
            unsuccessfullyDeletedIds.push({ id, name: t('course_admin.unknown') })
          }
        }
      })
    )

    // Update the data state to remove the successfully deleted courses
    setData((prevData) => prevData.filter((row) => !successfullyDeletedIds.includes(Number(row.id))))

    // Clear the row selection state after deletion
    setRowSelection({})

    // Close both the deletion confirmation modal and secondary modal
    setIsModalOpen(false)
    setIsSecondModalOpen(false)

    // Get the count of successfully and unsuccessfully deleted courses
    const successfullyDeletedCount = successfullyDeletedIds.length
    const unsuccessfullyDeletedCount = unsuccessfullyDeletedIds.length

    // Show a success message if any courses were successfully deleted
    if (successfullyDeletedCount > 0) {
      toast.success(`${t('course_admin.delete')} ${successfullyDeletedCount} ${t('course_admin.successfully')}`)
    }

    // Show an error message for any courses that failed to delete, listing their names and IDs
    if (unsuccessfullyDeletedCount > 0) {
      const errorMessage = unsuccessfullyDeletedIds
        .map((item) => `Name: ${item.name} (ID: ${item.id})`)
        .join('\n')
      toast.error(`${t('course_admin.failed_to_delete_the_following_categories_course')} :\n${errorMessage}`)
    }
  }
  const columns = useMemo<Array<MRT_ColumnDef<categorycourse>>>(
    () => [
      {
        accessorKey: 'locationPath',
        header: t('course_admin.image'),
        grow: true,
        size: 120,
        enableGlobalFilter: false, // Disable search for image column
        Cell: ({ cell }) => {
          const locationPath = cell.getValue<string>()
          return (
            <div className="w-35 h-20 flex justify-center items-center">
              <img
                className="object-contain max-w-full max-h-full transition-transform duration-700 hover:scale-110"
                src={locationPath ? `${process.env.REACT_APP_API}/uploads/courses/${locationPath}` : 'https://picsum.photos/200/300'}
                alt="CourseImage"
              />
            </div>
          )
        }
      },
      {
        accessorKey: 'name',
        header: t('course_admin.course_name'),
        grow: true,
        size: 120,
        enableGlobalFilter: true, // Enable search for name column
        Cell: ({ cell }) => {
          const assignBy = cell.getValue<string>()
          return (
            <Tooltip title={assignBy}>
              <div className="truncate w-full sm:w-auto">
                {assignBy}
              </div>
            </Tooltip>
          )
        }
      },
      {
        accessorKey: 'categoryCoursename',
        header: t('course_admin.category_name'),
        grow: true,
        size: 120,
        enableGlobalFilter: false, // Disable search for category name column
        Cell: ({ cell }) => {
          const assignBy = cell.getValue<string>()
          return (
            <Tooltip title={assignBy}>
              <div className="truncate w-full sm:w-auto">
                {assignBy}
              </div>
            </Tooltip>
          )
        }
      },
      {
        accessorKey: 'description', // The key that accesses the 'description' field in your data
        header: t('course_admin.description'),
        grow: true, // Allow the column to grow dynamically
        size: 190, // Define the column width
        enableGlobalFilter: true, // Enable global filtering to search by description
        Cell: ({ cell }) => {
          // Get the original description value from the cell
          let description = cell.getValue<string>()

          // Remove all periods (.) and replace ';;' with '. '
          description = description.replace(/\./g, '').replace(/;;/g, '. ')

          const maxLength = 80 // Set the maximum length for displaying the description

          return (
            <div>
              {/* Check if the description exceeds the maximum length */}
              {description.length > maxLength
              // If it does, display a tooltip with the full description and show a truncated version
                ? (
                <Tooltip title={description}>
                  <span>{`${description.substring(0, maxLength)}...`}</span>
                </Tooltip>
                  )
                : (
                  // If the description is within the limit, show the full description without truncation
                    description
                  )}
            </div>
          )
        }
      },
      {
        accessorKey: 'assignBy',
        header: t('course_admin.assigned_by'),
        grow: true,
        size: 120,
        enableGlobalFilter: false, // Disable search for assignBy column
        Cell: ({ cell }) => {
          const assignBy = cell.getValue<string>()
          return (
            <Tooltip title={assignBy}>
              <div className="truncate w-full sm:w-auto">
                {assignBy}
              </div>
            </Tooltip>
          )
        }
      }
      // ,
      // {
      //   accessorKey: 'price',
      //   header: 'Price (USD)',
      //   grow: true,
      //   size: 120,
      //   Cell: ({ cell }) => {
      //     const assignBy = cell.getValue<string>()
      //     return (
      //       <Tooltip title={assignBy}>
      //         <div className="truncate w-full sm:w-auto">
      //           {assignBy}
      //         </div>
      //       </Tooltip>
      //     )
      //   }
      // }
    ],
    [currentLanguage]
  )
  const table = useMaterialReactTable({
    columns,
    data,
    paginationDisplayMode: 'pages',
    enableRowSelection: true,
    globalFilterFn: 'contains', // Use 'contains' filter for exact text matching in search
    initialState: {
      columnPinning: { right: ['mrt-row-actions'], left: [] },
      expanded: true,
      pagination: { pageSize: 25, pageIndex: 0 },
      columnSizing: { // Optionally, add this to control sizing
        'mrt-row-actions': 150 // Adjust initial size of specific columns
      }
    },
    positionToolbarAlertBanner: 'top',
    enableFilterMatchHighlighting: false,
    getRowId: (row: categorycourse) => row.id.toString(),
    onRowSelectionChange: setRowSelection,
    state: { rowSelection },
    editDisplayMode: 'row',
    enableEditing: true,
    autoResetPageIndex: false,
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
    displayColumnDefOptions: {
      'mrt-row-actions': {
        size: 80, // Adjust the size of the 'mrt-row-actions' column
        enableResizing: true // Allow resizing of this column
      }
    },
    // enableRowNumbers: true,
    layoutMode: 'grid',
    muiPaginationProps: {
      rowsPerPageOptions: [
        { label: '25', value: 25 },
        { label: '100', value: 100 },
        { label: t('lesson.All'), value: courses.length }
      ],
      showFirstButton: true,
      showLastButton: true
    },
    localization: isVietnamese() ? MRT_Localization_VI : undefined,

    renderRowActions: ({ row, table }) => (
      <div className="flex flex-row items-center justify-center space-x-2">
      {/* <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 items-center justify-center"> */}
        <Box>
          <Tooltip title={t('course_admin.edit')}>
            <button className="btn bg-sky-500 hover:bg-sky-300 p-1.5 rounded-sm" onClick={() => handleEditCourse(row.original.id)}>
              <svg className="w-4 h-4 fill-current text-white shrink-0" viewBox="0 0 16 16">
                <path d="M11.7.3c-.4-.4-1-.4-1.4 0l-10 10c-.2.2-.3.4-.3.7v4c0 .6.4 1 1 1h4c.3 0 .5-.1.7-.3l10-10c.4-.4.4-1 0-1.4l-4-4zM4.6 14H2v-2.6l6-6L10.6 8l-6 6zM12 6.6L9.4 4 11 2.4 13.6 5 12 6.6z" />
              </svg>
            </button>
          </Tooltip>
        </Box>
        <Box>
          <Tooltip title={t('course_admin.delete')}>
            <button className="btn bg-red-500 hover:bg-red-400 p-1.5 rounded-sm" onClick={() => handleDelete(Number(row.original.id))}>
              <svg className="w-4 h-4 fill-current text-white shrink-0" viewBox="0 0 16 16">
                <path d="M5 7h2v6H5V7zm4 0h2v6H9V7zm3-6v2h4v2h-1v10c0 .6-.4 1-1 1H2c-.6 0-1-.4-1-1V5H0V3h4V1c0-.6.4-1 1-1h6c.6 0 1 .4 1 1zM6 2v1h4V2H6zm7 3H3v9h10V5z" />
              </svg>
            </button>
          </Tooltip>
        </Box>
        <Box>
          <Tooltip title={t('course_admin.copy_url')}>
            <button className="btn bg-yellow-400 hover:bg-yellow-300 p-1.5 rounded-sm" onClick={() => handleCourse(row.original.id)}>
              <svg className="w-4 h-4 fill-current text-black shrink-0" viewBox="0 0 50 50">
                <path d="M 4 4 L 4 44 A 2.0002 2.0002 0 0 0 6 46 L 44 46 A 2.0002 2.0002 0 0 0 46 44 L 46 32 L 42 32 L 42 42 L 8 42 L 8 4 L 4 4 z M 35.978516 4.9804688 A 2.0002 2.0002 0 0 0 34.585938 8.4140625 L 37.171875 11 L 36.048828 11 C 25.976906 10.74934 19.618605 12.315463 15.953125 16.726562 C 12.287645 21.137662 11.831327 27.512697 12 36.039062 A 2.0003814 2.0003814 0 1 0 16 35.960938 C 15.835673 27.654299 16.533777 22.2844 19.029297 19.28125 C 21.524817 16.2781 26.334094 14.76066 35.951172 15 L 35.974609 15 L 37.171875 15 L 34.585938 17.585938 A 2.0002 2.0002 0 1 0 37.414062 20.414062 L 43.236328 14.591797 A 2.0002 2.0002 0 0 0 43.619141 14.208984 L 44.828125 13 L 43.619141 11.791016 A 2.0002 2.0002 0 0 0 43.228516 11.400391 L 37.414062 5.5859375 A 2.0002 2.0002 0 0 0 35.978516 4.9804688 z"></path>
              </svg>
            </button>
          </Tooltip>
        </Box>
        <Box>
          <Tooltip title={t('course_admin.reload_page')}>
            <button className="btn bg-sky-500 hover:bg-sky-400 p-1.5 rounded-sm">
              <svg className="w-4 h-4 fill-current text-white shrink-0" viewBox="0 0 45 45">
                <path d="M 15.5 6 C 10.253 6 6 10.253 6 15.5 L 6 32.859375 C 6 34.196375 6.66825 35.4455 7.78125 36.1875 L 9 37 L 9 15.5 C 9 11.91 11.91 9 15.5 9 L 37 9 L 36.1875 7.78125 C 35.4465 6.66825 34.197375 6 32.859375 6 L 15.5 6 z M 16.5 11 C 13.480226 11 11 13.480226 11 16.5 L 11 36.5 C 11 39.519774 13.480226 42 16.5 42 L 36.5 42 C 39.519774 42 42 39.519774 42 36.5 L 42 16.5 C 42 13.480226 39.519774 11 36.5 11 L 16.5 11 z M 16.5 14 L 36.5 14 C 37.898226 14 39 15.101774 39 16.5 L 39 36.5 C 39 37.898226 37.898226 39 36.5 39 L 16.5 39 C 15.101774 39 14 37.898226 14 36.5 L 14 16.5 C 14 15.101774 15.101774 14 16.5 14 z"></path>
              </svg>
            </button>
          </Tooltip>
        </Box>
      </div>
    ),
    renderTopToolbarCustomActions: ({ table }) => (
      <div className="flex space-x-2 mt-2">
        <Box>
          <Tooltip title={t('course_admin.click_to_delete_selected_rows')}>
            <button className="btn bg-red-500 hover:bg-red-400 p-1.5 rounded-sm" onClick={handleDeleteSelected}>
              <svg className="w-4 h-4 fill-current text-white shrink-0" viewBox="0 0 16 16">
                <path d="M5 7h2v6H5V7zm4 0h2v6H9V7zm3-6v2h4v2h-1v10c0 .6-.4 1-1 1H2c-.6 0-1-.4-1-1V5H0V3h4V1c0-.6.4-1 1-1h6c.6 0 1 .4 1 1zM6 2v1h4V2H6zm7 3H3v9h10V5z" />
              </svg>
            </button>
          </Tooltip>
        </Box>
        <Box>
          <Tooltip title={t('course_admin.click_to_create_new_course')}>
            <button
              className="btn bg-green-500 hover:bg-green-400 p-1.5 rounded-sm"
              onClick={handleCreateCourse}
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
  const handleEditCourse = (courseId: string) => {
    // window.location.href = `/course/editcourse/${courseId}`
    navigate(`/course/editcourse/${courseId}`)
  }
  const handleCreateCourse = () => {
    // window.location.href = '/course/addcourse'
    navigate('/course/addcourse')
  }
  return (
    <div>
    <div className='py-10 w-full'>
      <div className='grid gap-5 md:grid-cols-2'>
        <div className="flex flex-col">
          <label htmlFor="courseSelect" className="mb-2 font-bold">{t('course_admin.course_category')}</label>
          <Select
            id="courseSelect"
            className="z-20 w-full h-10"
            options={courses.map(course => ({ value: course.id, label: course.name }))}
            value={courses.find(course => course.id === selectedCourse) ? { value: selectedCourse, label: courses.find(course => course.id === selectedCourse)?.name } : null}
            onChange={(option: SingleValue<OptionType>) => { setSelectedCourse(option?.value ?? '') }}
          />
        </div>
      </div>

      {/* Render the courses table or list based on the selected category */}
      {/* <div className="mt-5">
        {data.map(course => (
          <div key={course.id} className="p-2 border rounded mb-2">
            <h3 className="font-bold">{course.name}</h3>
            <p>{course.summary}</p>
          </div>
        ))}
      </div> */}
    </div>
      <>
      <hr className="my-4" />
        <MaterialReactTable table={table} />
        <ModalComponent
          isOpen={isModalOpen}
          title={t('course_admin.confirm_delete') as string}
          imageUrl='/assets/images/categoryCourse/category-course1.png'
          description={t('course_admin.are_you_sure_you_want_to_delete_this_courseResponse') as string}
          onClose={() => {
            setIsModalOpen(false)
          }}
          onOk={handleConfirmDeleteSingle}
          onCancel={() => {
            setIsModalOpen(false)
          }}
        />
        <ModalComponent
          isOpen={isSecondModalOpen}
          title={t('course_admin.confirm_delete') as string}
          imageUrl='/assets/images/categoryCourse/category-course1.png'
          description={`${t('course_admin.are_you_sure_you_want_to_delete')} ${Object.keys(rowSelection).length} ${t('course_admin.select_course')}?`}
          onClose={() => {
            setIsSecondModalOpen(false)
          }}
          onOk={deleteId !== null ? handleConfirmDeleteSingle : handleConfirmDelete}
          onCancel={() => {
            setIsSecondModalOpen(false)
          }}
        />
      </>
    </div>
  )
}

export default categoryCourse
