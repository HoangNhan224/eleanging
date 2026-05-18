/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */

import React, { useEffect, useMemo, useState } from 'react'

import {
  MaterialReactTable,
  MRT_Cell,
  MRT_ColumnDef,
  MRT_RowSelectionState,
  MRT_TableOptions,
  useMaterialReactTable
} from 'material-react-table'

import { Box, Tooltip } from '@mui/material'

import {
  getGroup,
  createGroup,
  updateGroup,
  deleteGroup,
  deleteGroups
} from 'api/post/post.api'

import ModalComponent from '../../components/Modal/index'
import AddGroupModal from 'components/AddGroupModal'

import { toast } from 'react-toastify'
import { MRT_Localization_VI } from 'material-react-table/locales/vi'
import { i18n } from 'services/i18n'
import { useTranslation } from 'react-i18next'

/**
 * Returns true if the current application language is Vietnamese.
 *
 * @author nhan
 * @returns {boolean} True if the current language is Vietnamese.
 */
function isVietnamese () {
  return i18n.language === 'vi'
}

interface Group {
  id: number
  name: string
  description: string
  createdAt: string
  updatedAt: string
}

/**
 * GroupManagement component handles CRUD operations for groups.
 *
 * @author nhan
 * @component
 * @returns {JSX.Element} The rendered GroupManagement component.
 *
 * @property {string} currentLanguage - The current application language, used to localize the table.
 * @property {Group[]} data - The list of groups fetched from the API.
 * @property {MRT_RowSelectionState} rowSelection - Tracks which rows are currently selected in the table.
 * @property {boolean} isDeleteModalOpen - Controls visibility of the single-delete confirmation modal.
 * @property {boolean} isBulkDeleteModalOpen - Controls visibility of the bulk-delete confirmation modal.
 * @property {boolean} isCreateModalOpen - Controls visibility of the create-group modal.
 * @property {number | null} deleteId - The ID of the group selected for deletion.
 * @property {string} deleteGroupName - The name of the group selected for deletion.
 */
const GroupManagement = () => {
  const { t } = useTranslation()

  // Track the current language to re-render table columns when the language changes
  const [currentLanguage, setCurrentLanguage] = useState<string>(i18n.language)

  // Store the list of groups fetched from the API
  const [data, setData] = useState<Group[]>([])

  // Track which rows are currently selected in the table
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({})

  // Control visibility of the single-delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  // Control visibility of the bulk-delete confirmation modal
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false)

  // Control visibility of the create-group modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  // Store the ID of the group selected for single deletion
  const [deleteId, setDeleteId] = useState<number | null>(null)

  // Store the name of the group selected for deletion (shown in the confirmation message)
  const [deleteGroupName, setDeleteGroupName] = useState<string>('')

  // Store the duplicate-name error to display inside AddGroupModal
  const [duplicateError, setDuplicateError] = useState<string>('')

  /**
   * Registers a language-change listener from i18n and syncs the currentLanguage state.
   * Removes the listener on unmount to prevent memory leaks.
   *
   * @author nhan
   */
  useEffect(() => {
    const handleLanguageChange = () => {
      // TODO Sync local language state whenever i18n fires a language-changed event
      setCurrentLanguage(i18n.language)
    }
    i18n.on('languageChanged', handleLanguageChange)

    return () => {
      i18n.off('languageChanged', handleLanguageChange)
    }
  }, [])

  /**
   * Fetches the initial group data when the component mounts.
   *
   * @author nhan
   */
  useEffect(() => {
    // TODO Load group data on first render
    fetchGroups()
  }, [])

  /**
   * Fetches the full list of groups from the API and updates the data state.
   *
   * @author nhan
   * @async
   * @returns {Promise<void>}
   */
  const fetchGroups = async () => {
    try {
      // TODO Call the API to retrieve all groups
      const response = await getGroup()

      // TODO Update table data; fall back to empty array if the response contains no data
      setData(response.data || [])
    } catch (error: any) {
      console.error('Fetch groups failed:', error)
      toast.error(t('group_management.fetch_failed'))
    }
  }

  /**
   * Stores the target group's info in state and opens the single-delete confirmation modal.
   *
   * @author nhan
   * @param {number} id - The ID of the group to delete.
   * @param {string} name - The name of the group to delete (shown in the confirmation message).
   */
  const handleDelete = (id: number, name: string) => {
    // TODO Save the target group's id and name, then open the delete confirmation modal
    setDeleteId(id)
    setDeleteGroupName(name)
    setIsDeleteModalOpen(true)
  }

  /**
   * Confirms and performs deletion of the selected group.
   * Updates the table data and row-selection state after a successful deletion.
   *
   * @author nhan
   * @async
   * @returns {Promise<void>}
   */
  const handleConfirmDelete = async () => {
    try {
      // TODO Guard against an invalid deleteId before proceeding
      if (deleteId === null) {
        toast.error(t('group_management.invalid_id'))
        return
      }

      await deleteGroup(deleteId.toString())

      // TODO Remove the deleted group from the table data
      setData((prevData) =>
        prevData.filter((row) => row.id !== deleteId)
      )

      // TODO If the deleted row was selected, remove it from the row-selection state
      if (rowSelection[deleteId]) {
        // TODO Rebuild rowSelection without the deleted id
        const newRowSelection = Object.keys(rowSelection).reduce(
          (obj: Record<string, boolean>, key) => {
            if (Number(key) !== deleteId) {
              obj[key] = rowSelection[key]
            }
            return obj
          },
          {}
        )
        setRowSelection(newRowSelection)
      }

      toast.success(t('group_management.delete_success'))
    } catch (error: any) {
      console.error('Delete group failed:', error)
      toast.error(error?.response?.data?.message || t('group_management.delete_failed'))
    } finally {
      // TODO Reset deletion state and close the modal regardless of success or failure
      setDeleteId(null)
      setIsDeleteModalOpen(false)
    }
  }

  /**
   * Validates that at least one row is selected, then opens the bulk-delete confirmation modal.
   *
   * @author nhan
   */
  const handleDeleteSelected = () => {
    // TODO Collect the IDs of all currently selected rows from rowSelection state
    const selectedIds = Object.keys(rowSelection).map(Number)

    // TODO Abort if no rows are selected
    if (selectedIds.length === 0) {
      toast.error(t('group_management.select_one')) as string
      return
    }

    setIsBulkDeleteModalOpen(true)
  }

  /**
   * Confirms and performs bulk deletion of all currently selected groups.
   * Removes the deleted groups from the table and resets the row-selection state.
   *
   * @author nhan
   * @async
   * @returns {Promise<void>}
   */
  const handleConfirmBulkDelete = async () => {
    try {
      // TODO Collect the IDs of all selected groups to delete
      const selectedIds = Object.keys(rowSelection).map(Number)

      await deleteGroups(selectedIds)

      // TODO Re-fetch the latest group list from the server so the table stays in sync
      const refreshedData = await getGroup()
      setData(refreshedData.data || [])

      // TODO Reset row-selection state so no stale selections remain after bulk delete
      setRowSelection({})
      toast.success(t('group_management.delete_success'))
    } catch (error: any) {
      console.error('Delete groups failed:', error)
      toast.error(error?.response?.data?.message || t('group_management.delete_failed'))
    } finally {
      // TODO Close the bulk-delete modal regardless of success or failure
      setIsBulkDeleteModalOpen(false)
    }
  }

  /**
   * Converts an ISO date string to a human-readable "YYYY-MM-DD HH:mm" format.
   * Pads month, day, hour, and minute with a leading zero when they are single digits.
   *
   * @author nhan
   * @param {string} dateString - The raw ISO date string to format.
   * @returns {string} The formatted datetime string in "YYYY-MM-DD HH:mm" format.
   */
  const formatDateForDatetimeLocal = (dateString: string) => {
    const date = new Date(dateString)

    // TODO Extract each date part and pad with a leading zero if it is a single digit
    const year = date.getFullYear()
    const month = `${(date.getMonth() + 1) < 10 ? '0' : ''}${date.getMonth() + 1}`
    const day = `${date.getDate() < 10 ? '0' : ''}${date.getDate()}`
    const hours = `${date.getHours() < 10 ? '0' : ''}${date.getHours()}`
    const minutes = `${date.getMinutes() < 10 ? '0' : ''}${date.getMinutes()}`

    return `${year}-${month}-${day} ${hours}:${minutes}`
  }

  /**
   * Builds the column definitions for the group management table.
   * Memoized on currentLanguage so column headers re-render when the language changes.
   *
   * @author nhan
   * @returns {Array<MRT_ColumnDef<Group>>} Array of column definition objects for the table.
   */
  const columns = useMemo<Array<MRT_ColumnDef<Group>>>(
    () => [
      {
        accessorKey: 'id',
        header: t('group_management.id'),
        grow: true,
        size: 100,
        enableGlobalFilter: false
      },
      {
        accessorKey: 'name',
        header: t('group_management.name'),
        enableEditing: true,
        grow: true,
        size: 150,
        enableGlobalFilter: true,
        // TODO Wrap long group names in a tooltip so the full text is accessible when truncated
        Cell: ({ cell }: { cell: MRT_Cell<Group> }) => {
          const groupName = cell.getValue<string>()
          return (
            <Tooltip title={groupName}>
              <div className='truncate w-full sm:w-auto'>
                {groupName}
              </div>
            </Tooltip>
          )
        }
      },
      {
        accessorKey: 'description',
        header: t('group_management.description'),
        enableEditing: true,
        grow: true,
        size: 200,
        enableGlobalFilter: true,
        // TODO Truncate descriptions longer than maxLength characters and show the full text in a tooltip
        Cell: ({ cell }: { cell: MRT_Cell<Group> }) => {
          const description = cell.getValue<string>()
          const maxLength = 100
          return (
            <div>
              {description?.length > maxLength
                ? (
                <Tooltip title={description}>
                  <span>{`${description.substring(0, maxLength)}...`}</span>
                </Tooltip>
                  )
                : description}
            </div>
          )
        }
      },
      {
        accessorKey: 'formattedCreatedAt',
        header: t('group_management.created_at'),
        enableEditing: false,
        enableGlobalFilter: false,
        grow: true,
        size: 150
      },
      {
        accessorKey: 'formattedUpdatedAt',
        header: t('group_management.updated_at'),
        enableEditing: false,
        enableGlobalFilter: false,
        grow: true,
        size: 150
      }
    ],
    [currentLanguage]
  )

  /**
   * Produces a formatted-date version of the data for display in the table.
   * Memoized on data so date formatting only reruns when the group list changes.
   *
   * @author nhan
   * @returns {Array<Group & { formattedCreatedAt: string; formattedUpdatedAt: string }>}
   *   Group records augmented with pre-formatted createdAt and updatedAt strings.
   */
  const dataWithFormattedDates = useMemo(() => {
    // TODO Map over each group and attach formatted date strings for table display
    return (data || []).map((item) => ({
      ...item,
      formattedCreatedAt: formatDateForDatetimeLocal(item.createdAt),
      formattedUpdatedAt: formatDateForDatetimeLocal(item.updatedAt)
    }))
  }, [data])

  /**
   * Handles saving an edited row.
   * Validates that data has changed, name is non-empty, meets minimum length,
   * and is not a duplicate before calling the update API.
   *
   * @author nhan
   * @async
   * @param {object} params - Parameters provided by the MaterialReactTable onEditingRowSave callback.
   * @param {Record<string, string>} params.values - Current form values of the row being edited.
   * @param {MRT_Row<Group>} params.row - The row being edited (provides original values).
   * @param {MRT_TableInstance<Group>} params.table - The table instance (used to exit edit mode).
   * @returns {Promise<void>}
   */
  const handleSaveGroup: MRT_TableOptions<Group>['onEditingRowSave'] =
    async ({ values, row, table }) => {
      const id = row.original.id
      const { name, description } = values

      // TODO Skip the update if neither name nor description has changed
      if (
        row.original.name === name &&
        row.original.description === description
      ) {
        toast.info(t('group_management.no_changes_detected'))
        return
      }

      // TODO Reject an empty group name before proceeding
      if (!name.trim()) {
        toast.error(t('group_management.name_required')) as string
        return
      }

      // TODO Enforce the minimum name length of 1 character
      if (name.length < 1) {
        toast.error(t('group_management.groupMinLength')) as string
        return
      }

      try {
        // TODO Check for a duplicate name, excluding the group currently being edited
        const existingGroup = data.find(
          (group) => group.name === name && group.id !== id
        )

        if (existingGroup) {
          toast.error(t('group_management.name_exists')) as string
          return
        }

        await updateGroup(id.toString(), { name, description })

        // TODO Exit row edit mode after a successful update
        table.setEditingRow(null)

        // TODO Re-fetch the latest data so the table stays in sync with the server
        const updatedData = await getGroup()
        setData(updatedData.data || [])

        toast.success(t('group_management.update_success'))
      } catch (error: any) {
        console.error('Update group failed:', error)
        toast.error(error?.response?.data?.message || t('group_management.update_failed')) as string
      }
    }

  /**
   * Creates a new group after validating the name and checking for duplicates.
   * Refreshes the table data and closes the create modal on success.
   *
   * @author nhan
   * @async
   * @param {string} name - The name of the new group.
   * @param {string} description - The description of the new group.
   * @returns {Promise<boolean>} True if the group was created successfully, false otherwise.
   */
  const handleCreateGroup = async (
    name: string,
    description: string
  ): Promise<boolean> => {
    try {
      // TODO Reject an empty group name before proceeding
      if (!name.trim()) {
        toast.error(t('group_management.validation.name_required')) as string
        return false
      }

      // TODO Enforce the minimum name length of 1 character
      if (name.trim().length < 1) {
        toast.error(t('group_management.groupMinLength')) as string
        return false
      }

      // TODO Check whether a group with the same name (case-insensitive) already exists
      const existingGroup = data.find(
        (group) =>
          group.name.trim().toLowerCase() ===
          name.trim().toLowerCase()
      )

      if (existingGroup) {
        // TODO Surface the duplicate-name error inside AddGroupModal
        setDuplicateError(
          t('group_management.name_exists').toString()
        )

        return false
      }

      // TODO Clear any previous duplicate error before submitting
      setDuplicateError('')

      // TODO Call the API to create the new group
      await createGroup({ name, description })

      // TODO Re-fetch the group list to reflect the newly created group
      const createdData = await getGroup()

      setData(createdData.data || [])

      toast.success(t('group_management.create_success'))

      return true
    } catch (error: any) {
      console.error('Create group failed:', error)

      toast.error(
        error?.response?.data?.message ||
        t('group_management.create_failed')
      )

      return false
    }
  }

  /**
   * Initializes and configures the MaterialReactTable instance for group management.
   * Enables row selection, inline row editing, custom action buttons, and Vietnamese localization.
   *
   * @author nhan
   * @returns {MRT_TableInstance<Group>} The configured table instance passed to MaterialReactTable.
   */
  const table = useMaterialReactTable({
    columns,
    data: dataWithFormattedDates,
    paginationDisplayMode: 'pages',
    enableRowSelection: true,
    globalFilterFn: 'contains',
    initialState: {
      pagination: { pageSize: 25, pageIndex: 0 },
      // TODO Sort by id descending so the newest group appears at the top
      sorting: [{ id: 'id', desc: true }],
      // TODO Hide the raw id column; show the custom row-number column instead
      columnVisibility: { id: false, rowNumber: true }
    },
    positionToolbarAlertBanner: 'top',
    enableFilterMatchHighlighting: false,
    // TODO Use row.id as the unique key for row-selection and edit tracking
    getRowId: (row: Group) => row.id.toString(),
    onRowSelectionChange: setRowSelection,
    state: { rowSelection },
    editDisplayMode: 'row',
    enableEditing: true,
    // TODO Prevent the table from jumping back to page 1 after editing a row
    autoResetPageIndex: false,
    onEditingRowSave: handleSaveGroup,
    positionActionsColumn: 'last',
    // TODO Apply Vietnamese localization when the current language is 'vi'
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
        Header: t('group_management.stt'),
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
        // TODO Provide an "All" option to display every record on a single page
        { label: t('group_management.all'), value: data.length }
      ],
      showFirstButton: true,
      showLastButton: true
    },
    // TODO Render per-row action buttons: delete (red) and edit (blue) for each group
    renderRowActions: ({ row, table }) => (
      <div className='flex flex-row items-center justify-center space-x-2'>
        <Box>
          <Tooltip title={t('group_management.edit')}>
            <button
              className='btn bg-sky-500 hover:bg-sky-300 p-1.5 rounded-sm'
              onClick={() => table.setEditingRow(row)}
            >
              <svg className='w-4 h-4 fill-current text-white shrink-0' viewBox='0 0 16 16'>
                <path d='M11.7.3c-.4-.4-1-.4-1.4 0l-10 10c-.2.2-.3.4-.3.7v4c0 .6.4 1 1 1h4c.3 0 .5-.1.7-.3l10-10c.4-.4.4-1 0-1.4l-4-4zM4.6 14H2v-2.6l6-6L10.6 8l-6 6zM12 6.6L9.4 4 11 2.4 13.6 5 12 6.6z' />
              </svg>
            </button>
          </Tooltip>
        </Box>
        <Box>
          <Tooltip title={t('group_management.delete')}>
            <button
              className='btn bg-red-500 hover:bg-red-400 p-1.5 rounded-sm'
              onClick={() => handleDelete(row.original.id, row.original.name)}
            >
              <svg className='w-4 h-4 fill-current text-white shrink-0' viewBox='0 0 16 16'>
                <path d='M5 7h2v6H5V7zm4 0h2v6H9V7zm3-6v2h4v2h-1v10c0 .6-.4 1-1 1H2c-.6 0-1-.4-1-1V5H0V3h4V1c0-.6.4-1 1-1h6c.6 0 1 .4 1 1zM6 2v1h4V2H6zm7 3H3v9h10V5z' />
              </svg>
            </button>
          </Tooltip>
        </Box>
      </div>
    ),
    // TODO Render toolbar action buttons: bulk delete (red) and add group (green)
    // Pass `table` down to the bulk-delete modal so the selected count is always fresh
    renderTopToolbarCustomActions: ({ table }) => (
      <div className='flex space-x-4'>
        <Box>
          <Tooltip title={t('group_management.delete_selected')}>
            <button
              className='btn bg-red-500 hover:bg-red-400 p-1.5 rounded-sm'
              onClick={handleDeleteSelected}
            >
              <svg className='w-4 h-4 fill-current text-white shrink-0' viewBox='0 0 16 16'>
                <path d='M5 7h2v6H5V7zm4 0h2v6H9V7zm3-6v2h4v2h-1v10c0 .6-.4 1-1 1H2c-.6 0-1-.4-1-1V5H0V3h4V1c0-.6.4-1 1-1h6c.6 0 1 .4 1 1zM6 2v1h4V2H6zm7 3H3v9h10V5z' />
              </svg>
            </button>
          </Tooltip>
        </Box>
        <div className='flex justify-end mr-5'>
          <Tooltip title={t('group_management.add_group')}>
            <button
              className='btn bg-green-500 hover:bg-green-400 p-1.5 rounded-sm'
              onClick={() => setIsCreateModalOpen(true)}
            >
              <svg className='w-4 h-4 fill-current text-white shrink-0' viewBox='0 0 16 16'>
                <path d='M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1z' />
              </svg>
            </button>
          </Tooltip>
        </div>
      </div>
    )
  })

  return (
    <div className='min-h-screen'>
      <hr className='my-4' />
      <div className='overflow-x-auto'>
        {/* Use currentLanguage as the key to force a table re-render on language change */}
        <MaterialReactTable table={table} key={currentLanguage}/>
      </div>

      {/* Single-delete confirmation modal */}
      <ModalComponent
        isOpen={isDeleteModalOpen}
        title={t('group_management.confirm_delete') as string}
        imageUrl='/assets/images/categoryCourse/category-course1.png'
        description={t('group_management.confirm_delete_desc', { name: deleteGroupName }) as string}
        onClose={() => setIsDeleteModalOpen(false)}
        onOk={handleConfirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
      />

      {/* Create-group modal */}
      <AddGroupModal
        modalOpen={isCreateModalOpen}
        onClose={() => {
          setDuplicateError('')
          setIsCreateModalOpen(false)
        }}
        onOk={handleCreateGroup}
        duplicateError={duplicateError}
        setDuplicateError={setDuplicateError}
      />

      {/* Bulk-delete confirmation modal */}
      <ModalComponent
        isOpen={isBulkDeleteModalOpen}
        title={t('group_management.confirm_bulk_delete') as string}
        imageUrl='/assets/images/categoryCourse/category-course1.png'
        description={t('group_management.confirm_bulk_delete_desc', { count: table.getSelectedRowModel().rows.length }) as string}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        onOk={handleConfirmBulkDelete}
        onCancel={() => setIsBulkDeleteModalOpen(false)}
      />
    </div>
  )
}

export default GroupManagement
