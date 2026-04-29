/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* PAGE: tableUser
========================================================================== */
import React, { useEffect, useState, useMemo } from 'react'
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  useMaterialReactTable,
  MRT_TableOptions,
  type MRT_RowSelectionState,
  MRT_Cell
} from 'material-react-table'
import { fetchAllCategorycourse, updateCategoryCourse, createCategoryCourse, deleteCategoryCourse } from 'api/post/post.api'// updateCategoryCourse
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Box, Button, DialogActions, DialogContent, DialogTitle, IconButton, Tooltip } from '@mui/material'
import ModalComponent from '../../components/Modal/index'
import { toast } from 'react-toastify'
import { useForm } from 'react-hook-form' // Import useForm
import AddCategoryModal from 'components/AddCategoryCourseModal'
import { i18n } from 'services/i18n'
import { MRT_Localization_VI } from 'material-react-table/locales/vi'
import { useTranslation } from 'react-i18next'
function isVietnamese () {
  return i18n.language === 'vi'
}
interface categorycourse {
  id: number
  name: string
  description: string
  createdAt: string
  updatedAt: string
}
interface FormInput {
  name: string
  description: string
}
const categoryCourse = () => {
  const [currentLanguage, setCurrentLanguage] = useState<string>(i18n.language)
  const { t } = useTranslation()
  const [data, setData] = useState<categorycourse[]>([])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({})
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSecondModalOpen, setIsSecondModalOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [nameError, setNameError] = useState<string>('')
  const [descriptionError, setDescriptionError] = useState<string>('')
  const [duplicateNameError, setDuplicateNameError] = useState(false)
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false)
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
    const fetchAllData = async () => {
      const categoryCourseResponse = await fetchAllCategorycourse()
      setData(categoryCourseResponse.data.data)
    }
    fetchAllData()
  }, [])

  const handleDelete = (id: number) => {
    setDeleteId(id)
    setIsModalOpen(true)
  }
  const { register, handleSubmit, reset } = useForm<FormInput>()

  // Function to handle the deletion of a single category course
  const handleConfirmDeleteSingle = async () => {
    try {
      if (deleteId === null) {
        console.log('No id to delete')
        return
      }

      await deleteCategoryCourse(deleteId.toString())

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

      toast.success(t('category_course_admin.messages.success.delete'))
    } catch (error: any) {
      if (error.response && error.response.data === 'Cannot delete category_course because it is referenced by other tables') {
        toast.error(t('category_course_admin.messages.error.delete_reference'))
      } else {
        console.error('Error deleting category_course:', error)
        toast.error(t('category_course_admin.messages.error.delete_course'))
      }
    } finally {
      setDeleteId(null)
      setIsModalOpen(false)
    }
  }

  // Function to handle the deletion of selected rows
  const handleDeleteSelected = () => {
    const selectedIds = Object.keys(rowSelection).map(Number)

    if (selectedIds.length === 0) {
      console.log(t('category_course_admin.messages.error.no_selection'))
      toast.error(t('category_course_admin.messages.error.no_selection'))
      return
    }

    setIsSecondModalOpen(true)
  }

  // Function to handle the confirmation of deleting multiple selected category courses
  const handleConfirmDelete = async () => {
    const selectedIds = Object.keys(rowSelection).map(Number)
    const successfullyDeletedIds: number[] = []
    const unsuccessfullyDeletedIds: Array<{ id: number, name: string }> = []

    await Promise.all(
      selectedIds.map(async (id) => {
        try {
          await deleteCategoryCourse(id.toString())
          successfullyDeletedIds.push(id)
        } catch (error: any) {
          const categoryName = error.response?.data?.categoryCourseName || t('category_course_admin.messages.error.unknown')
          unsuccessfullyDeletedIds.push({ id, name: categoryName })
        }
      })
    )

    setData((prevData) => prevData.filter((row) => !successfullyDeletedIds.includes(row.id)))
    setRowSelection({})
    setIsModalOpen(false)
    setIsSecondModalOpen(false)

    const successfullyDeletedCount = successfullyDeletedIds.length
    const unsuccessfullyDeletedCount = unsuccessfullyDeletedIds.length

    if (successfullyDeletedCount > 0) {
      toast.success(t('category_course_admin.messages.success.delete_count', { successfullyDeletedCount }))
    }

    if (unsuccessfullyDeletedCount > 0) {
      const errorMessage = unsuccessfullyDeletedIds
        .map((item) => `${t('category_course_admin.category_course_name')}: ${item.name} (ID: ${item.id})`)
        .join('\n')

      toast.error(t('category_course_admin.messages.error.delete_failed', { errorMessage }))
    }
  }

  // Function to format a date string into a 'YYYY-MM-DD HH:mm' format for datetime-local input fields
  const formatDateForDatetimeLocal = (dateString: string) => {
  // Convert the input date string into a Date object
    const date = new Date(dateString)
    // Extract the year, ensuring it is always four digits
    const year = date.getFullYear()
    // Extract the month, adding a leading zero if needed (months are 0-indexed, so add 1)
    const month = `${(date.getMonth() + 1) < 10 ? '0' : ''}${date.getMonth() + 1}`
    // Extract the day, adding a leading zero if needed
    const day = `${date.getDate() < 10 ? '0' : ''}${date.getDate()}`
    // Extract the hours, adding a leading zero if needed
    const hours = `${date.getHours() < 10 ? '0' : ''}${date.getHours()}`
    // Extract the minutes, adding a leading zero if needed
    const minutes = `${date.getMinutes() < 10 ? '0' : ''}${date.getMinutes()}`
    // Return the formatted date string in the 'YYYY-MM-DD HH:mm' format
    return `${year}-${month}-${day} ${hours}:${minutes}`
  }
  const columns = useMemo<Array<MRT_ColumnDef<categorycourse>>>(
    () => [
      // hiển thị dữ liệu và kích thước của từng cột
      {
        accessorKey: 'id',
        header: 'ID',
        grow: true,
        size: 100,
        enableGlobalFilter: false // Disable search for ID column
      },
      {
        accessorKey: 'name',
        header: t('category_course_admin.category_course_name'),
        enableEditing: true,
        grow: true,
        size: 120,
        enableGlobalFilter: true, // Enable search for name column
        Cell: ({ cell }: { cell: MRT_Cell<categorycourse> }) => {
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
        accessorKey: 'description', // Accessor key to map this column to the 'description' field in the data
        header: t('category_course_admin.description'), // Header label for the column
        enableEditing: true,
        grow: true,
        size: 200, // Set the initial size of the column to 200 pixels
        enableGlobalFilter: true, // Enable global filter to search by description
        Cell: ({ cell }: { cell: MRT_Cell<categorycourse> }) => {
          const description = cell.getValue<string>() // Get the description value from the cell
          const maxLength = 100 // Set the maximum length for display before truncating
          return (
            <div>
              {description.length > maxLength // Check if the description exceeds the max length
                ? (
                <Tooltip title={description}>
                  <span>{`${description.substring(0, maxLength)}...`}</span>
                </Tooltip>
                  )
                : (
                    description
                  )}
            </div>
          )
        }
      },
      {
        accessorKey: 'formattedCreatedAt',
        header: t('category_course_admin.create_at'),
        enableEditing: false,
        enableGlobalFilter: false, // Disable search for date column
        grow: true,
        size: 120
      },
      {
        accessorKey: 'formattedUpdatedAt',
        header: t('category_course_admin.update_at'),
        enableEditing: false,
        enableGlobalFilter: false, // Disable search for date column
        grow: true,
        size: 120
      }
    ],
    [currentLanguage]
  )
  const dataWithFormattedDates = useMemo(() => {
    return data.map((item) => ({
      ...item,
      // hàm chuyển thời gian cho 2 cột create với update
      formattedCreatedAt: formatDateForDatetimeLocal(item.createdAt),
      formattedUpdatedAt: formatDateForDatetimeLocal(item.updatedAt)
    }))
  }, [data])

  const handleSavecategoryCourseResponse: MRT_TableOptions<categorycourse>['onEditingRowSave'] = async ({
    values,
    table
  }) => {
    const { id, name, description } = values

    if (!name.trim()) {
      toast.error(t('category_course_admin.messages.error.empty_name'))
      return
    }

    if (!description.trim()) {
      toast.error(t('category_course_admin.messages.error.empty_description'))
      return
    }

    try {
      const existingCategory = data.find((category) => category.name === name && category.id !== id)
      if (existingCategory) {
        toast.error(t('category_course_admin.messages.error.duplicate_category'))
        return
      }

      await updateCategoryCourse(id.toString(), name, description)
      table.setEditingRow(null)

      const updatedData = await fetchAllCategorycourse()
      setData(updatedData.data.data)

      toast.success(t('category_course_admin.messages.success.update_category'))
    } catch (error) {
      console.error('Error:', error)
      throw new Error(String(t('category_course_admin.messages.error.update_failed')))
    }
  }

  const table = useMaterialReactTable({
    columns,
    data: dataWithFormattedDates, // Use the data with formatted dates
    paginationDisplayMode: 'pages', // Display pagination by pages
    enableRowSelection: true, // Enable row selection feature
    globalFilterFn: 'contains', // Use 'contains' filter for exact text matching in search
    initialState: {
      pagination: { pageSize: 25, pageIndex: 0 }, // Default settings for pagination: 5 rows per page and start at page 1
      sorting: [{ id: 'id', desc: true }], // Set the default sorting to descending by 'id'
      columnVisibility: { id: false } // Hide the 'id' column by default when the data is first loaded
    },
    positionToolbarAlertBanner: 'top', // Place the alert banner at the top
    enableFilterMatchHighlighting: false, // Disable the highlight feature when filtering
    getRowId: (row: categorycourse) => row.id.toString(), // Assign a unique ID to each row using the 'id' field as a string
    onRowSelectionChange: setRowSelection, // Update the row selection state when row selection changes
    state: { rowSelection }, // Pass our managed row selection state to the table to use
    editDisplayMode: 'row', // Enable editing mode at the row level
    enableEditing: true, // Allow editing of the table rows
    autoResetPageIndex: false, // Prevent the page from resetting to the first page when certain changes happen (e.g., data updates or filters change)
    onEditingRowSave: handleSavecategoryCourseResponse, // Function to handle row save event for editing
    positionActionsColumn: 'last', // Position the action column (e.g., edit, delete buttons) as the last column
    localization: isVietnamese() ? MRT_Localization_VI : undefined,
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
        enableResizing: true, // allow the row numbers column to be resized
        size: 40,
        grow: false // new in v2.8 - do not fill remaining space using this column
      }
    },
    // enableRowNumbers: true,
    layoutMode: 'grid',
    muiPaginationProps: {
      rowsPerPageOptions: [
        { label: '25', value: 25 },
        { label: '100', value: 100 },
        { label: t('lesson.All'), value: data.length }
      ],
      showFirstButton: true,
      showLastButton: true
    },
    renderRowActions: ({ row, table }) => (
      <div className="flex flex-row items-center justify-center space-x-2">
        <Box>
          <Tooltip title={t('category_course_admin.delete')}>
            <button className="btn bg-red-500 hover:bg-red-400 p-1.5 rounded-sm" onClick={() => handleDelete(row.original.id)}>
              <svg className="w-4 h-4 fill-current text-white shrink-0" viewBox="0 0 16 16">
                <path d="M5 7h2v6H5V7zm4 0h2v6H9V7zm3-6v2h4v2h-1v10c0 .6-.4 1-1 1H2c-.6 0-1-.4-1-1V5H0V3h4V1c0-.6.4-1 1-1h6c.6 0 1 .4 1 1zM6 2v1h4V2H6zm7 3H3v9h10V5z" />
              </svg>
            </button>
          </Tooltip>
        </Box>
        <Box>
          <Tooltip title={t('category_course_admin.edit')}>
            <button className="btn bg-sky-500 hover:bg-sky-300 p-1.5 rounded-sm" onClick={() => table.setEditingRow(row)}>
              <svg className="w-4 h-4 fill-current text-white shrink-0" viewBox="0 0 16 16">
                <path d="M11.7.3c-.4-.4-1-.4-1.4 0l-10 10c-.2.2-.3.4-.3.7v4c0 .6.4 1 1 1h4c.3 0 .5-.1.7-.3l10-10c.4-.4.4-1 0-1.4l-4-4zM4.6 14H2v-2.6l6-6L10.6 8l-6 6zM12 6.6L9.4 4 11 2.4 13.6 5 12 6.6z" />
              </svg>
            </button>
            </Tooltip>
        </Box>
      </div>
    ),
    renderTopToolbarCustomActions: ({ table }) => (
      <div className="flex space-x-4">
        <Box>
          <Tooltip title={t('category_course_admin.click_to_delete_selected_rows')}>
            <button className="btn bg-red-500 hover:bg-red-400 p-1.5 rounded-sm" onClick={handleDeleteSelected}>
              <svg className="w-4 h-4 fill-current text-white shrink-0" viewBox="0 0 16 16">
                <path d="M5 7h2v6H5V7zm4 0h2v6H9V7zm3-6v2h4v2h-1v10c0 .6-.4 1-1 1H2c-.6 0-1-.4-1-1V5H0V3h4V1c0-.6.4-1 1-1h6c.6 0 1 .4 1 1zM6 2v1h4V2H6zm7 3H3v9h10V5z" />
              </svg>
            </button>
          </Tooltip>
        </Box>
        <div className="flex justify-end mr-5">
          <Tooltip title={t('category_course_admin.add_category')}>
            <button
              className="btn bg-green-500 hover:bg-green-400 p-1.5 rounded-sm"
              // onClick={handleCreateCourse}
              onClick={() => {
                setIsAddCategoryModalOpen(true)
              }}
            >
              <svg className="w-4 h-4 fill-current text-white shrink-0" viewBox="0 0 16 16">
                <path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1z" />
              </svg>
            </button>
          </Tooltip>
        </div>
      </div>
    )
  })
  const handleInputChange = (e: any) => {
    // Destructure the 'name' and 'value' from the event target
    const { name, value } = e.target
    // If the input field's name is 'name' and the value is not just whitespace:
    if (name === 'name' && value.trim()) {
      setNameError('') // Clear any error related to the 'name' field.
      setDuplicateNameError(false) // Set duplicate name error to false if the 'name' is valid.
    }
    // If the input field's name is 'description' and the value is not just whitespace:
    if (name === 'description' && value.trim()) {
      setDescriptionError('') // Clear any error related to the 'description' field.
    }
  }
  const handleAddCategory = async (name: string, description: string) => {
    try {
      // Validate that the name is not empty
      if (!name.trim()) {
        toast.error(t('category_course_admin.messages.error.empty_name')) // Show error message for empty name
        setNameError('Name cannot be empty') // Set state for name error
        return // Exit the function if name is invalid
      }
      // Validate that the description is not empty
      if (!description.trim()) {
        toast.error(t('category_course_admin.messages.error.empty_description')) // Show error message for empty description
        setDescriptionError('Description cannot be empty') // Set state for description error
        return // Exit the function if description is invalid
      }
      await createCategoryCourse(name, description) // Call the function to create the category course
      const createData = await fetchAllCategorycourse() // Fetch all category courses to update the state with new data
      setData(createData.data.data) // Update state with the new category data
      toast.success(t('category_course_admin.messages.success.create_category')) // Show success message
      setIsAddCategoryModalOpen(false) // Close the modal after successful creation
    } catch (error: any) {
      if (error.message === 'A course category with this name already exists.') {
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
            <label>Name</label>
            <input
              {...register('name')}
              placeholder="Name is required"
              className={`shadow appearance-none border rounded w-full h-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline pl-10 ${
                nameError || duplicateNameError ? 'border-red-500' : ''
              }`}
              onChange={handleInputChange}
            />
          </div>
          <div className="md:w-1/2 mr-5 ml-5 flex flex-col space-y-2 mt-5 h-full">
            <label>Description</label>
            <textarea
              {...register('description')}
              placeholder="Description is required"
              rows={3} // Set default number of rows to 3
              className={`shadow appearance-none border rounded w-full h-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline pl-10 ${
                descriptionError ? 'border-red-500' : ''
              }`}
              onChange={handleInputChange}
            />
          </div>
        </div> */}

      {/* </form> */}
      <hr className="my-4" />
      <div className="overflow-x-auto">
        <MaterialReactTable table={table} />
      </div>
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
      <AddCategoryModal
        modalOpen={isAddCategoryModalOpen}
        onClose={() => setIsAddCategoryModalOpen(false)}
        onOk={handleAddCategory}
      />
<ModalComponent
  isOpen={isSecondModalOpen}
   title={t('category_course_admin.messages.confirmation.delete_title') as string}
  imageUrl="/assets/images/categoryCourse/category-course1.png"
  description={t('category_course_admin.messages.confirmation.delete_description', { count: Object.keys(rowSelection).length }) as string}
  onClose={() => setIsSecondModalOpen(false)}
  onOk={handleConfirmDelete}
  onCancel={() => setIsSecondModalOpen(false)}
/>

    </div>
  )
}

export default categoryCourse
