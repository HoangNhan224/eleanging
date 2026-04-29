/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable no-trailing-spaces */
/* eslint-disable @typescript-eslint/no-unused-vars */
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
  MRT_TableOptions,
  useMaterialReactTable,
  type MRT_RowSelectionState
} from 'material-react-table'
import { getCategoryLessionData, getCourseLessionData, getdeleteLesion, createCategoryLession, updateCategoryLesion } from 'api/post/post.api'// getdeleteCourse
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Box, Button, DialogActions, DialogContent, DialogTitle, IconButton, Tooltip } from '@mui/material'
import ModalComponent from '../../../src/components/Modal/index'
import { toast } from 'react-toastify'
import { useForm } from 'react-hook-form' // Import useForm
import AddCategoryLessonModal from 'components/AddCategoryLessonModal'
import { i18n } from 'services/i18n'
import { MRT_Localization_VI } from 'material-react-table/locales/vi'
import { useTranslation } from 'react-i18next'
function isVietnamese () {
  return i18n.language === 'vi'
}
// import { Link } from 'react-router-dom'
interface categorycourse {
  id: number
  courseId: number
  order: number
  name: string
}
interface Course {
  id: string
  name: string
}
interface FormInput {
  name: string
  courseId: number
}
const categoryCourse = () => {
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false)
  const [currentLanguage, setCurrentLanguage] = useState<string>(i18n.language)
  const { t } = useTranslation()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [data, setData] = useState<categorycourse[]>([])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({})
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSecondModalOpen, setIsSecondModalOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [selectedCourse, setSelectedCourse] = useState<string>('')
  const [courses, setCourses] = useState<Course[]>([])
  const [coursesData, setCoursesData] = useState<Course[]>([])
  const [descriptionError, setDescriptionError] = useState<string>('')
  const [nameError, setNameError] = useState<string>('')
  const [duplicateNameError, setDuplicateNameError] = useState(false)
  useEffect(() => {
    const handleLanguageChange = () => {
      setCurrentLanguage(i18n.language)
    }
  
    i18n.on('languageChanged', handleLanguageChange)
    return () => {
      i18n.off('languageChanged', handleLanguageChange)
    }
  }, [])
  const handleDelete = (id: number) => {
    setDeleteId(id)
    setIsModalOpen(true)
  }
  // useEffect to fetch initial courses data when the component mounts
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // Fetch courses and lessons data
        const response = await getCourseLessionData()
        const coursesData = response.data.data

        // Set courses data to state
        setCourses(coursesData)

        // Automatically select the first course if there are courses available
        if (coursesData.length > 0) {
          const firstCourseId = coursesData[0].id
          setSelectedCourse(firstCourseId)
        }
      } catch (error) {
        // Show error notification if fetching courses fails
        toast.error(t('category_lesson_admin.failed_to_fetch_courses'))
      }
    }
    fetchCourses()
  }, [])

  // useEffect to fetch and set courses data (duplicate of the previous useEffect)
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // Fetch courses and lessons data
        const response = await getCourseLessionData()
        const coursesData: Course[] = response.data.data

        // Set courses data to state
        setCoursesData(coursesData)
      } catch (error) {
        // Show error notification if fetching courses fails
        toast.error(t('category_lesson_admin.failed_to_fetch_courses'))
      }
    }
    fetchCourses()
  }, [])

  // useEffect to fetch courses based on the selected category whenever `selectedCourse` changes
  useEffect(() => {
    const fetchCoursesByCategory = async () => {
      // Ensure a course is selected before fetching
      if (selectedCourse) {
        try {
          // Fetch data for the selected category
          const response = await getCategoryLessionData({ categorycourseid: selectedCourse })
          // console.log('Response data:11111111111111111111111111111', response.data.data)

          // Set the fetched category data to state
          setData(response.data.data)
        } catch (error) {
          // Show error notification if fetching category courses fails
          toast.error(t('category_lesson_admin.failed_to_fetch_course_for_categories'))
        }
      }
    }
    fetchCoursesByCategory()
  }, [selectedCourse]) // Re-run this effect whenever `selectedCourse` changes

  const { register, handleSubmit, reset, setValue } = useForm<FormInput>()

  const handleConfirmDeleteSingle = async () => {
    try {
      // Check if deleteId is null, indicating no ID is available for deletion
      if (deleteId === null) {
        console.log('Delete ID:', deleteId) // Log deleteId for debugging
        console.log('No id to delete')
        return
      }

      // Call API to delete the course with the given deleteId
      await getdeleteLesion(deleteId.toString())

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

      // Call the API to fetch the updated data after deletion
      const createData = await getCategoryLessionData({ categorycourseid: selectedCourse })
      setData(createData.data.data) // Update the state with the new data

      // Reset deleteId and close the modal
      setDeleteId(null)
      setIsModalOpen(false)

      // Display a success message using a toast notification
      toast.success(t('category_lesson_admin.delete_successfully'))
    } catch (error: any) {
      // Handle specific error case when the course cannot be deleted due to existing references
      if (error.response && error.response.data === 'Cannot delete because this category lession is linked to other records.') {
        toast.error(t('category_lesson_admin.delete_failed')) // Show error message for linked records
      } else {
        // Log any other errors and display a general error toast notification
        console.error('Error deleting categoryLession:', error)
        toast.error(t('category_lesson_admin.delete_failed')) // Show error message for linked records
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
  // Function to handle deleting selected rows
  const handleDeleteSelected = () => {
  // Get an array of selected row IDs by converting the keys of rowSelection object to numbers
    const selectedIds = Object.keys(rowSelection).map(Number)

    // Check if any rows are selected
    if (selectedIds.length === 0) {
      // Show an error notification if no rows are selected
      toast.error(t('category_lesson_admin.no_row_selected_to_delete'))
      return
    }

    // Open the confirmation modal if there are selected rows
    setIsSecondModalOpen(true)
  }

  // Function to format a date string into 'YYYY-MM-DD HH:MM:SS' format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)

    // Extract the year, month, day, hours, minutes, and seconds from the date
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0') // Month is 0-indexed, so add 1
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')

    // Return the formatted date string
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  }

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
          await getdeleteLesion(id.toString())

          // If successful, add the ID to the list of successfully deleted IDs
          successfullyDeletedIds.push(id)
        } catch (error: any) {
          // If deletion fails, check if a category name is returned in the error response
          const categoryName = error.response?.data?.courseId

          // Add the failed course to the list of unsuccessfully deleted courses with its name or 'Unknown'
          if (categoryName) {
            unsuccessfullyDeletedIds.push({ id, name: categoryName })
          } else {
            unsuccessfullyDeletedIds.push({ id, name: 'Unknown' })
          }
        }
      })
    )

    // Update the data state to remove the successfully deleted courses
    setData((prevData) => prevData.filter((row) => !successfullyDeletedIds.includes(Number(row.id))))

    // Clear the row selection state after deletionf
    setRowSelection({})

    // Close both the deletion confirmation modal and secondary modal
    setIsModalOpen(false)
    setIsSecondModalOpen(false)

    // Get the count of successfully and unsuccessfully deleted courses
    const successfullyDeletedCount = successfullyDeletedIds.length
    const unsuccessfullyDeletedCount = unsuccessfullyDeletedIds.length

    // Show a success message if any courses were successfully deleted
    if (successfullyDeletedCount > 0) {
      toast.success(`${t('category_lesson_admin.delete')} ${successfullyDeletedCount} ${t('category_lesson_admin.successfully')}`) // Show success message for deleted courses
    }

    // Show an error message for any courses that failed to delete, listing their names and IDs
    if (unsuccessfullyDeletedCount > 0) {
      const errorMessage = unsuccessfullyDeletedIds
        .map((item) => `Name: ${item.name} (ID: ${item.id})`)
        .join('\n')
      toast.error(`${t('category_lesson_admin.failed_to_delete_the_following_categories_course')}:\n${errorMessage}`)
    }

    // Fetch the updated data after deletion and update the state
    try {
      const createData = await getCategoryLessionData({ categorycourseid: selectedCourse })
      setData(createData.data.data) // Update the state with the new data
    } catch (fetchError: any) {
      console.error('Error fetching updated:', fetchError)
      toast.error(t('category_lesson_admin.failed_to_refresh_category_lesson')) // Show error message if fetching updated data fails
    }
  }
  const handleSavecategoryCourseResponse: MRT_TableOptions<categorycourse>['onEditingRowSave'] = async ({
    row,
    values,
    table
  }) => {
    // Retrieve the `id` from the original row data
    const id = row.original.id

    // Log information for debugging
    console.log('Values before edit:', values) // Log the entire values object
    console.log('Course ID:', values.courseId) // Log the courseId from the values
    console.log('ID from row.original:', id) // Log the id from the original row data

    // Destructure the relevant values received from the editing row
    const { name, courseId } = values // Change 'name' to 'courseName' if needed

    // Validate the name field to ensure it is not empty
    if (!name.trim()) {
      toast.error(t('category_lesson_admin.name_can_not_empty')) // Show error for duplicate names
      return // Exit the function if validation fails
    }

    try {
      // Check if there’s already a category with the same name, excluding the current one
      const existingCategory = data.find(
        (category) => category.name === name && category.id !== id
      )
      if (existingCategory) {
        toast.error(t('category_lesson_admin.category_with_the_same_name_already_exists')) // Show error for duplicate names
        return // Exit if a duplicate category name is found
      }

      // Proceed with updating the category if `id` is defined
      if (id !== undefined && id !== null) {
        // Call API to update the category based on the id
        await updateCategoryLesion(id.toString(), name, courseId)
      } else {
        console.error('ID is undefined or null.') // Log an error if id is missing
      }

      // Exit the editing mode for the current row in the table
      table.setEditingRow(null)

      // Show a success notification for the successful update
      toast.success(t('category_lesson_admin.successfully_updated_category_lesson')) // Show success message for updated category

      // Fetch the updated data after a successful update to reflect changes in the UI
      const updateData = await getCategoryLessionData({ categorycourseid: selectedCourse })
      console.log('Updated data after edit:', updateData.data.data) // Log the updated data
      setData(updateData.data.data) // Update the state with the new data
    } catch (error) {
      console.error('Error:', error) // Log any errors encountered
      toast.error(t('category_lesson_admin.failed_to_update_category_lesson')) // Show success message for updated category
    }
  }

  const columns = useMemo<Array<MRT_ColumnDef<categorycourse>>>(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        grow: false,
        size: 100,
        muiTableBodyCellProps: {
          align: 'left'
        }
      },
      // {
      //   accessorKey: 'order',
      //   header: 'No',
      //   grow: true,
      //   enableEditing: false,
      //   size: 40
      // },
      {
        accessorKey: 'name',
        header: t('category_lesson_admin.lesson_name'),
        grow: true,
        size: 120
      },
      // {
      //   accessorKey: 'courseId',
      //   header: 'Course',
      //   grow: true,
      //   size: 120,
      //   editVariant: 'select',

      //   // Options for the select dropdown when editing
      //   editSelectOptions: coursesData.length
      //     ? coursesData.map((course) => ({
      //       value: course.id, // Send the course ID instead of the name
      //       label: course.name // Display the course name in the dropdown
      //     }))
      //     : [],

      //   // Display the course name instead of the course ID in the table cell
      //   Cell: ({ cell }) => {
      //     const courseId = cell.getValue()
      //     const course = coursesData.length > 0 ? coursesData.find(course => course.id === courseId) : null
      //     return course ? course.name : 'N/A' // Display the course name in the cell
      //   },

      //   // Filtering functionality with a select dropdown
      //   filterVariant: 'select',
      //   filterSelectOptions: coursesData.map((course) => ({
      //     value: course.id, // Filter by the course ID
      //     label: course.name // Display the course name in the filter
      //   }))
      // },
      {
        accessorKey: 'createdAt',
        header: t('category_lesson_admin.create_at'),
        enableEditing: false,
        grow: true,
        size: 70,
        Cell: ({ cell }) => {
          const createdAt = cell.getValue<string>()
          return formatDate(createdAt)
        }
      },
      {
        accessorKey: 'updatedAt',
        header: t('category_lesson_admin.update_at'),
        enableEditing: false,
        grow: true,
        size: 70,
        Cell: ({ cell }) => {
          const updatedAt = cell.getValue<string>()
          return formatDate(updatedAt)
        }
      }
    ],
    [coursesData, currentLanguage]
  )

  const table = useMaterialReactTable({
    columns,
    data,
    paginationDisplayMode: 'pages',
    enableRowSelection: true,
    initialState: {
      sorting: [{ id: 'order', desc: false }],
      columnVisibility: { id: false },
      columnPinning: { right: ['mrt-row-actions'], left: [] },
      expanded: true,
      pagination: { pageSize: 25, pageIndex: 0 },
      columnSizing: {
        'mrt-row-actions': 70
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
    onEditingRowSave: handleSavecategoryCourseResponse, // Function to handle row save event for editing
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
    enableRowNumbers: true,
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
        <Box>
          <Tooltip title={t('category_lesson_admin.edit')}>
            <button className="btn bg-sky-500 hover:bg-sky-300 p-1.5 rounded-sm" onClick={() => table.setEditingRow(row)}>
              <svg className="w-4 h-4 fill-current text-white shrink-0" viewBox="0 0 16 16">
                <path d="M11.7.3c-.4-.4-1-.4-1.4 0l-10 10c-.2.2-.3.4-.3.7v4c0 .6.4 1 1 1h4c.3 0 .5-.1.7-.3l10-10c.4-.4.4-1 0-1.4l-4-4zM4.6 14H2v-2.6l6-6L10.6 8l-6 6zM12 6.6L9.4 4 11 2.4 13.6 5 12 6.6z" />
              </svg>
            </button>
          </Tooltip>
        </Box>
        <Box>
          <Tooltip title={t('category_lesson_admin.delete')}>
            <button className="btn bg-red-500 hover:bg-red-400 p-1.5 rounded-sm" onClick={() => handleDelete(Number(row.original.id))}>
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
          <Tooltip title={t('category_lesson_admin.click_to_delete_selected_rows')}>
            <button className="btn bg-red-500 hover:bg-red-400 p-1.5 rounded-sm" onClick={handleDeleteSelected}>
              <svg className="w-4 h-4 fill-current text-white shrink-0" viewBox="0 0 16 16">
                <path d="M5 7h2v6H5V7zm4 0h2v6H9V7zm3-6v2h4v2h-1v10c0 .6-.4 1-1 1H2c-.6 0-1-.4-1-1V5H0V3h4V1c0-.6.4-1 1-1h6c.6 0 1 .4 1 1zM6 2v1h4V2H6zm7 3H3v9h10V5z" />
              </svg>
            </button>
          </Tooltip>
          </Box>
          <div className="flex justify-end mr-5">
          <button
            type="submit"
            className="btn bg-green-500 hover:bg-green-400 p-1.5 rounded-sm"
            onClick={() => setIsAddCategoryModalOpen(true)}
          >
            <svg className="w-4 h-4 fill-current text-white shrink-0" viewBox="0 0 16 16">
              <path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1z" />
            </svg>
          </button>
        </div>
        
      </div>
    )
  })
  // Function to handle changes in input fields
  const handleInputChange = (e: any) => {
    const { name, value } = e.target

    // If the 'name' field is being edited and has a non-empty value
    if (name === 'name' && value.trim()) {
      setNameError('') // Clear any errors related to the 'name' field
      setDuplicateNameError(false) // Clear duplicate name error if the name is valid
    }

    // If the 'courseId' field is being edited and has a non-empty value
    if (name === 'courseId' && value.trim()) {
      setDescriptionError('') // Clear any errors related to the 'courseId' field
    }
  }

  // Function to handle changes in a select dropdown
  const handleSelectChange = (option: any) => {
  // Update the value of 'courseId' based on the selected option
    setDescriptionError(option?.value ?? '') // Clear error related to 'courseId' if a valid option is selected
    setValue('courseId', option?.value ?? '') // Update 'courseId' with the selected option's value
  }
  const handleAddCategory = async (name: string, courseId: number) => {
    try {
      // Validate that the name is not empty
      if (!name.trim()) {
        toast.error(t('category_lesson_admin.name_can_not_empty')) // Show error message for empty name
        setNameError('Name cannot be empty') // Set state for name error
        return // Exit the function if name is invalid
      }

      // Use the provided courseId or default to 1 if empty
      const numericCourseId = courseId ? Number(courseId) : 1 // Default to 1 if courseId is not provided

      // Validate that the courseId is a valid number
      if (isNaN(numericCourseId) || numericCourseId <= 0) {
        toast.error(t('category_lesson_admin.course_id_must_be_valid_number')) // Show error message for invalid courseId
        setDescriptionError('courseId must be a valid number') // Set state for courseId error
        return // Exit the function if courseId is invalid
      }

      // Call the function to create the category course with the provided name and courseId
      await createCategoryLession(name, numericCourseId)

      // Reset the form inputs after successful creation
      reset()

      // Fetch all category courses to update the state with new data
      const createData = await getCategoryLessionData({ categorycourseid: selectedCourse })
      setData(createData.data.data) // Update state with the new category data

      // Show a success message for the created permission
      toast.success(t('category_lesson_admin.successfully_created_category_lesson')) // Show success message for created category

      // Clear any previous error messages
      setNameError('')
      setDescriptionError('')
    } catch (error: any) {
      // Handle any errors that occur during the creation process
      console.error('Error creating permission:', error) // Log the error
      if (error.message === 'A categoryLession with this name already exists.') {
        setDuplicateNameError(true) // Set state for duplicate name error
      }
      toast.error(error.message) // Show the error message to the user
    }
  }
  return (
    <div className='min-h-screen'>
      {/* <form onSubmit={handleSubmit(handleCreatePermission)}> */}
        {/* <div className="lg:flex md:flex">
          <div className="md:w-1/2 mr-5 ml-5 flex flex-col space-y-2 m-5 h-20">
            <label className="font-bold">Name</label>
            <input
              {...register('name')}
              placeholder="Name is required"
              className={`shadow appearance-none border rounded z-20 w-full h-10 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline pl-10 ${
                nameError || duplicateNameError ? 'border-red-500' : ''
              }`}
              onChange={handleInputChange}
            />
          </div>
          <div className="md:w-1/2 mr-5 ml-5 flex flex-col space-y-2 mt-5 h-full">
            <div className="flex flex-col">
              <label htmlFor="courseId" className="mb-2 font-bold">{'Course'}</label>

              <Select
                id="courseId"
                className="z-20 w-full h-10"

                // Map courses to create options for the select component
                options={courses.map(course => ({ value: course.id, label: course.name }))}

                // Set the selected value in the dropdown based on the `descriptionError` or default to the first course if available
                value={
                  descriptionError && courses.find(course => course.id === descriptionError)
                    ? { value: descriptionError, label: courses.find(course => course.id === descriptionError)?.name }
                    : courses.length > 0 // Check if there’s at least one course
                      ? { value: courses[0].id, label: courses[0].name } // Default to the first course in the list
                      : null // Set to null if no courses are available
                }

                // Update selected course on change
                onChange={handleSelectChange}
              />
            </div>
          </div>

        </div> */}
      {/* </form> */}
    <div className='py-10 w-full'>
    <div className='grid gap-5 md:grid-cols-2'>
        <div className="flex flex-col">
        <label htmlFor="courseSelect" className="mb-2 font-bold">{t('category_lesson_admin.course')}</label>
        <Select
          id="courseSelect"
          className="z-20 w-full h-10"
          options={courses.map(course => ({ value: course.id, label: course.name }))}
          value={
            courses.find(course => course.id === selectedCourse)
              ? { value: selectedCourse, label: courses.find(course => course.id === selectedCourse)?.name }
              : null
          }
          onChange={(option: SingleValue<{ value: string, label: string | undefined }>, actionMeta: any) => setSelectedCourse(option?.value ?? '')}
        />
      </div>
    </div>
    </div>
      <>
      <hr className="" />
        <MaterialReactTable table={table} />
        <AddCategoryLessonModal
          modalOpen={isAddCategoryModalOpen}
          onClose={() => setIsAddCategoryModalOpen(false)}
          onOk={handleAddCategory}
          courses={courses}
        />
        <ModalComponent
          isOpen={isModalOpen}
          title={t('category_lesson_admin.confirm_delete') as string}
          imageUrl='/assets/images/categoryCourse/category-course1.png'
          description={t('category_lesson_admin.are_you_sure_you_want_to_delete_this_courseResponse') as string}
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
          title={t('category_lesson_admin.confirm_delete') as string}
          imageUrl='/assets/images/categoryCourse/category-course1.png'
          description={`${t('category_lesson_admin.are_you_sure_you_want_to_delete')} ${Object.keys(rowSelection).length} ${t('category_lesson_admin.select_course')}?`}
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
