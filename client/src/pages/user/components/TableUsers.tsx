/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* PAGE: TableUser
========================================================================== */
import React, { useEffect, useState, useMemo } from 'react'
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  useMaterialReactTable,
  MRT_TableOptions,
  type MRT_RowSelectionState
} from 'material-react-table'
import { fetchAllUser, fetchAllRole, updateUser, deleteUser, getGroup, createUser } from 'api/post/post.api'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import { useForm, Controller } from 'react-hook-form'
import { Box, Button, DialogActions, DialogContent, DialogTitle, IconButton, Tooltip, TextField, MenuItem } from '@mui/material'
import ModalComponent from '../../../components/Modal'

import { toast } from 'react-toastify'

import { MRT_Localization_VI } from 'material-react-table/locales/vi'
import { useTranslation } from 'react-i18next'
import { i18n } from 'services/i18n'
import { useSelector } from 'react-redux'
import { selectUserRole, selectAuthTokens } from '../../../redux/auth/authSlice'
import { teal } from '@mui/material/colors'
function isVietnamese () {
  return i18n.language === 'vi'
}

interface User {
  id: number
  email: string
  firstName: string
  lastName: string
  fullName?: string
  roleId: string
  roleDescription: string
  createdAt: string
  updatedAt: string
  groupId?: string
}

interface Role {
  id: string
  name: string
  description: string
}

interface Group {
  id: string
  name: string
  description: string
}
interface CreateUserForm {
  email: string
  firstName: string
  lastName: string
  groupId: string
  roleId: string
}
/**
 * TableUser component displays a table of users with various functionalities.
 *
 * @author Hien
 * @component
 * @returns {JSX.Element} The rendered TableUser component.
 *
 * @property {object} t - The translation function from useTranslation hook.
 * @property {User[]} data - The state for storing user data.
 * @property {Role[]} roles - The state for storing role data.
 * @property {MRT_RowSelectionState} rowSelection - The state for managing row selection.
 * @property {boolean} isModalOpen - The state for managing the first modal's visibility.
 * @property {boolean} isSecondModalOpen - The state for managing the second modal's visibility.
 * @property {number | null} deleteId - The state for storing the ID of the user to be deleted.
 * @property {number | null} editingId - The state for storing the ID of the user being edited.
   * @property {string | null} deleteEmail - The state for storing the email of the user to be deleted.
 * @property {string} currentLanguage - The state for storing the current language.
 */

const TableUser = () => {
  /**
 * State to control create user modal visibility
 */
  const { handleSubmit, control, reset, formState: { errors } } = useForm<CreateUserForm>()
  /**
 * Store user list data
 */
  const { t } = useTranslation()
  const [data, setData] = useState<User[]>([])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [roles, setRoles] = useState<Role[]>([])
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({})
  const [groups, setGroups] = useState<Group[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSecondModalOpen, setIsSecondModalOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [deleteEmail, setDeleteEmail] = useState<string | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [currentLanguage, setCurrentLanguage] = useState<string>(i18n.language)
  const [isLoading, setIsLoading] = useState(false)
  const tokensFromRedux = useSelector(selectAuthTokens)
  const currentUserRoleFromRedux = useSelector(selectUserRole)
  const currentUser = tokensFromRedux?.id ? Number(tokensFromRedux.id) : null
  /**
   * Fetches all user and role data on component mount.
   *
   * @author Hien
   * @async
   * @returns {Promise<void>}
   */
  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true)
      try {
        const rolesResponse = await fetchAllRole()
        setRoles(rolesResponse.data)
        const groupsResponse = await getGroup()
        setGroups(groupsResponse.data)

        const usersResponse = await fetchAllUser()
        const usersWithRoleDescriptions = usersResponse.data.map((user: any) => {
          const role = rolesResponse.data.find((role: any) => role.id === user.roleId)
          const group = groupsResponse.data.find((group: any) => group.id === user.groupId)
          return { ...user, roleDescription: role ? role.description : 'N/A', groupName: group ? group.name : 'N/A' }
        })
        setData(usersWithRoleDescriptions)
      } catch (error) {
        // console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchAllData()
  }, [])

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

  /**
   * Handles the deletion of a specific user by opening the confirmation modal.
   *
   * @author Hien
   * @param {number} id - The ID of the user to delete.
   * @param {string} email - The email of the user to delete.
   * @description
   * - Finds the user to delete from the `data`.
   * - Retrieves the role of the user to delete from the `roles` list.
   * - Converts the role description of the row to lowercase.
   * - Converts the current user's role to lowercase.
   * - Determines the deletion permission based on the role:
   *   - If the current user is 'admin':
   *     - Do not allow deletion if the role of the row is 'admin'.
   *   - If the current user is 'manager':
   *     - Do not allow deletion if the role of the row is 'admin' or 'manager'.
   * - If the conditions for deletion are not met, displays an error message.
   * - If the conditions for deletion are met, opens the confirmation modal.
   */
  const handleDelete = (id: number, email: string) => {
    const userToDelete = data.find(user => user.id === id)
    const role = roles.find(role => role.id === userToDelete?.roleId)
    const rowRoleDescription = role ? role.description.toLowerCase() : ''
    const currentUserRoleLower = typeof currentUserRoleFromRedux === 'string' ? currentUserRoleFromRedux.toLowerCase() : ''

    if (currentUserRoleLower === 'admin' && rowRoleDescription === 'admin') {
      toast.error(t('userpage.toast.cannotDeleteAdmin'))
      return
    } else if (currentUserRoleLower === 'manager' && (rowRoleDescription === 'admin' || rowRoleDescription === 'manager')) {
      toast.error(t('userpage.toast.cannotDeleteManagerOrAdmin'))
      return
    }

    setDeleteId(id)
    setDeleteEmail(email)
    setIsModalOpen(true)
  }
  /**
 * Handle create new user.
 *
 * @author NhanHoang
 * @param {CreateUserForm} formData - Form data input from modal
 * @description
 * - Combine firstName and lastName into username
 * - Call API create user
 * - Handle error from backend (duplicate email, etc.)
 * - Update table realtime
 * @returns {Promise<void>}
 */
  const handleCreateUser = async (formData: CreateUserForm) => {
    try {
      // TODO combine full name
      const username = `${formData.firstName} ${formData.lastName}`.trim()

      // 🔥 FIX: ép kiểu đúng cho backend
      const payload = {
        ...formData,
        username,
        password: '123456',
        roleId: Number(formData.roleId)
      }

      // 🔥 LOG PAYLOAD Ở ĐÂY
      console.log('CREATE USER PAYLOAD:', payload)

      // TODO call API
      const response = await createUser(payload)

      if (response.status === 200) {
        const createdUser = response.data

        // TODO map role
        const role = roles.find(r => r.id === createdUser.roleId)

        const newUser: User = {
          ...createdUser,
          email: formData.email,
          fullName: username,
          roleDescription: role ? role.description : 'N/A'
        }

        // TODO update UI realtime
        setData(prev => [newUser, ...prev])

        toast.success(t('userpage.toast.createSuccessfully'))

        reset()
        setIsCreateModalOpen(false)
      }
    } catch (error: any) {
      // 🔥 LOG FULL ERROR (QUAN TRỌNG)
      console.error('ERROR FULL:', error)
      console.error('ERROR RESPONSE:', error?.response?.data)

      // 🔥 FIX đúng chuẩn Axios
      if (error?.response?.status === 409) {
        const message = error?.response?.data?.message

        if (message === 'Email already exists') {
          toast.error('Email already exists')
        } else {
          toast.error(message)
        }
      } else {
        toast.error(t('userpage.toast.createFailed'))
      }
    }
  }
  /**
   * Confirms the deletion of a single user.
   *
   * @author Hien
   * @async
   * @returns {Promise<void>}
   */
  const handleConfirmDeleteSingle = async () => {
    if (deleteId === null) {
      toast.error(t('userpage.toast.noRowSelected'))
      return
    }
    try {
      await deleteUser(deleteId.toString())
      // TODO Update the data state to remove the deleted row
      setData((prevData) => prevData.filter((row) => row.id !== deleteId))
      // TODO Update row selection
      if (rowSelection[deleteId]) {
        const newRowSelection = Object.keys(rowSelection).reduce((obj: Record<string, boolean>, key) => {
          if (Number(key) !== deleteId) {
            obj[key] = rowSelection[key]
          }
          return obj
        }, {})
        setRowSelection(newRowSelection)
      }
      toast.success(t('userpage.toast.deleteSuccessfully'))
    } catch (error) {
      toast.error(t('userpage.toast.deleteFailed'))
    } finally {
      setDeleteId(null)
      setIsModalOpen(false)
    }
  }

  /**
 * Handles the deletion of selected rows.
 *
 * @author Hien
 * @description
 * - Retrieves the list of selected IDs from `rowSelection`.
 * - Checks if no rows are selected, displays an error message.
 * - Determines invalid rows for deletion based on the current user's role and the role of the row:
 *   - If the current user is 'admin':
 *     - Do not allow deletion of rows with the role 'admin'.
 *   - If the current user is 'manager':
 *     - Do not allow deletion of rows with the role 'admin' or 'manager'.
 * - If there are invalid rows for deletion, displays an error message.
 * - If all rows are valid for deletion, opens the confirmation modal.
 */
  const handleDeleteSelected = () => {
    const selectedIds = Object.keys(rowSelection).map(Number)
    if (selectedIds.length === 0) {
      toast.error(t('userpage.toast.noRowSelected'))
      return
    }

    const invalidDeletions = selectedIds.some(id => {
      const userToDelete = data.find(user => user.id === id)
      const role = roles.find(role => role.id === userToDelete?.roleId)
      const rowRoleDescription = role ? role.description.toLowerCase() : ''
      const currentUserRoleLower = typeof currentUserRoleFromRedux === 'string' ? currentUserRoleFromRedux.toLowerCase() : ''

      if (currentUserRoleLower === 'admin' && rowRoleDescription === 'admin') {
        return true
      } else if (currentUserRoleLower === 'manager' && (rowRoleDescription === 'admin' || rowRoleDescription === 'manager')) {
        return true
      }
      return false
    })

    if (invalidDeletions) {
      toast.error(t('userpage.toast.cannotDeleteSelected'))
      return
    }

    setIsSecondModalOpen(true)
  }

  /**
   * Confirms the deletion of selected users.
   *
   * @author Hien
   * @async
   * @returns {Promise<void>}
   */
  const handleConfirmDelete = async () => {
    const selectedIds = Object.keys(rowSelection).map(Number)
    try {
      await Promise.all(selectedIds.map(async (id) => await deleteUser(id.toString())))
      setData((prevData) => prevData.filter((row) => !selectedIds.includes(row.id)))
      setRowSelection({})
      toast.success(t('userpage.toast.deleteSelectedSuccessfully'))
    } catch (error) {
      toast.error(t('userpage.toast.deleteSelectedFailed'))
    } finally {
      setIsModalOpen(false)
      setIsSecondModalOpen(false)
    }
  }

  /**
   * Formats a date string to a specific format.
   *
   * @author Hien
   * @param {string} dateString - The date string to format.
   * @returns {string} The formatted date string.
   */
  const formatDateForDatetimeLocal = (dateString: string) => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = `${(date.getMonth() + 1) < 10 ? '0' : ''}${date.getMonth() + 1}`
    const day = `${date.getDate() < 10 ? '0' : ''}${date.getDate()}`
    const hours = `${date.getHours() < 10 ? '0' : ''}${date.getHours()}`
    const minutes = `${date.getMinutes() < 10 ? '0' : ''}${date.getMinutes()}`
    const seconds = `${date.getSeconds() < 10 ? '0' : ''}${date.getSeconds()}`
    return `${year}-${month}-${day}, ${hours}:${minutes}:${seconds}`
  }
  // Memoized data with formatted dates
  const dataWithFormattedDates = useMemo(() => {
    return data.map((item) => ({
      ...item,
      fullName: `${item.firstName || ''} ${item.lastName || ''}`.trim(),
      formattedCreatedAt: formatDateForDatetimeLocal(item.createdAt),
      formattedUpdatedAt: formatDateForDatetimeLocal(item.updatedAt)
    }))
  }, [data])
  // Memoized columns configuration
  const columns = useMemo<Array<MRT_ColumnDef<User>>>(
    () => [
      {
        accessorKey: 'id',
        header: t('userpage.id'),
        enableHiding: false
      },
      {
        accessorKey: 'email',
        header: t('userpage.email') || 'Email',
        enableEditing: false
      },
      {
        accessorKey: 'fullName',
        header: t('userpage.fullName') || 'Full Name',
        enableEditing: false
      },
      {
        accessorKey: 'roleId',
        header: t('userpage.role'),
        editVariant: 'select',
        editSelectOptions: roles.map((role) => ({ value: role.id, label: role.description })),
        enableEditing: (row) => {
          const role = roles.find(role => role.id === row.original.roleId)
          const rowRoleDescription = role ? role.description.toLowerCase() : ''
          const currentUserRoleLower = typeof currentUserRoleFromRedux === 'string' ? currentUserRoleFromRedux.toLowerCase() : ''

          if (currentUserRoleLower === 'admin') {
            return rowRoleDescription !== 'admin'
          } else if (currentUserRoleLower === 'manager') {
            return rowRoleDescription !== 'admin' && rowRoleDescription !== 'manager'
          }
          return false
        },
        Cell: ({ cell }) => {
          const roleId = cell.getValue()
          const role = roles.find(role => role.id === roleId)
          return role ? role.description : 'N/A'
        },
        filterVariant: 'select',
        filterSelectOptions: roles.map((role) => ({ value: role.id, label: role.description }))
      },
      {
        accessorKey: 'formattedCreatedAt',
        header: t('userpage.createdAt'),
        enableEditing: false
      },
      {
        accessorKey: 'formattedUpdatedAt',
        header: t('userpage.updatedAt'),
        enableEditing: false
      },
      {
        accessorKey: 'groupId',
        header: t('userpage.group'),
        editVariant: 'select',
        editSelectOptions: groups.map((group) => ({ value: group.id, label: group.name })),
        enableEditing: (row) => {
          const role = roles.find(role => role.id === row.original.roleId)
          const rowRoleDescription = role ? role.description.toLowerCase() : ''
          const currentUserRoleLower = typeof currentUserRoleFromRedux === 'string' ? currentUserRoleFromRedux.toLowerCase() : ''
          if (currentUserRoleLower === 'admin' && row.original.id === currentUser) {
            return true
          } else if (currentUserRoleLower === 'admin') {
            return rowRoleDescription !== 'admin'
          } else if (currentUserRoleLower === 'manager') {
            return rowRoleDescription !== 'admin' && rowRoleDescription !== 'manager'
          }
          return false
        },
        Cell: ({ cell }) => {
          const groupId = cell.getValue()
          const group = groups.find(group => group.id === groupId)
          return group ? group.name : 'N/A'
        },
        filterVariant: 'select',
        filterSelectOptions: groups.map((group) => ({ value: group.id, label: group.name }))
      }
    ],
    [roles, groups, t, currentLanguage]
  )

  /**
   * Handles saving a user after editing.
   *
   * @author Hien
   * @async
   * @param {object} param - The parameters for saving the user.
   * @param {object} param.values - The values of the edited user.
   * @param {object} param.table - The table instance.
   * @returns {Promise<void>}
   */
  const handleSaveUser: MRT_TableOptions<User>['onEditingRowSave'] = async ({
    row,
    values,
    table
  }) => {
    if (row.original.roleId === values.roleId && row.original.groupId === values.groupId) {
      toast.info(t('userpage.toast.noChangesMade'))
      return
    }

    try {
      await updateUser(editingId ?? 0, values)
      table.setEditingRow(null)
      toast.success(t('userpage.toast.updateSuccessfully'))
      const updatedData = await fetchAllUser()
      const updatedDataWithRoleDescriptions = updatedData.data.map((user: any) => {
        const role = roles.find((role) => role.id === user.roleId)
        const group = groups.find((group) => group.id === user.groupId)
        return { ...user, roleDescription: role ? role.description : 'N/A', groupName: group ? group.name : 'N/A' }
      })
      setData(updatedDataWithRoleDescriptions)
    } catch (error: any) {
      toast.error(t('userpage.toast.updateFailed'))
    }
  }

  const table = useMaterialReactTable({
    columns,
    data: dataWithFormattedDates,
    paginationDisplayMode: 'pages',
    // enableRowSelection: true,
    initialState: {
      pagination: { pageSize: 25, pageIndex: 0 },
      sorting: [{ id: 'id', desc: true }],
      columnVisibility: { id: false },
      columnPinning: { right: ['mrt-row-actions'], left: [] }
    },
    positionToolbarAlertBanner: 'top',
    enableFilterMatchHighlighting: false,
    getRowId: (row: User) => row?.id?.toString(),
    onRowSelectionChange: setRowSelection,
    state: { isLoading, rowSelection },
    muiCircularProgressProps: {
      sx: { color: teal[400] },
      thickness: 3,
      size: 50
    },
    muiSkeletonProps: {
      animation: 'pulse',
      height: 28
    },
    editDisplayMode: 'row',
    enableEditing: true,
    autoResetPageIndex: false,
    onEditingRowSave: handleSaveUser,
    positionActionsColumn: 'last',
    muiSearchTextFieldProps: {
      label: t('userpage.searchAllFields')
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
    displayColumnDefOptions: {
      'mrt-row-select': {
        enableResizing: true,
        size: 40,
        grow: false
      }
    },
    muiPaginationProps: {
      rowsPerPageOptions: [
        { label: '25', value: 25 },
        { label: '100', value: 100 },
        { label: t('lesson.All'), value: dataWithFormattedDates.length }
      ],
      showFirstButton: true,
      showLastButton: true
    },

    /**
     * Displays row actions (edit and delete buttons) based on the current user's role.
     *
     * @param {object} param - The parameters for rendering row actions.
     * @param {object} param.row - The row data.
     * @param {object} param.table - The table instance.
     * @returns {JSX.Element} - The rendered row actions.
     *
     * @description
     * - role: Retrieves the role information of the current row.
     * - rowRoleDescription: Converts the role description of the row to lowercase.
     * - currentUserRoleLower: Converts the current user's role to lowercase.
     * - Determines edit and delete permissions based on the role:
     *   - If the current user is 'admin':
     *     - Allows editing if the role of the row is not 'admin' or if the row belongs to the current user.
     *     - Allows deleting if the role of the row is not 'admin'.
     *   - If the current user is 'manager':
     *     - Allows editing and deleting if the role of the row is not 'admin' and not 'manager'.
     *   - Other roles:
     *     - Do not allow editing and deleting.
     */
    renderRowActions: ({ row, table }) => {
      const role = roles.find(role => role.id === row.original.roleId)
      const rowRoleDescription = role ? role.description.toLowerCase() : ''
      const currentUserRoleLower = typeof currentUserRoleFromRedux === 'string' ? currentUserRoleFromRedux.toLowerCase() : ''

      const canEdit = (currentUserRoleLower === 'admin' && (rowRoleDescription !== 'admin' || row.original.id === currentUser)) ||
        (currentUserRoleLower === 'manager' && rowRoleDescription !== 'admin' && rowRoleDescription !== 'manager')

      const canDelete = (currentUserRoleLower === 'admin' && rowRoleDescription !== 'admin') ||
        (currentUserRoleLower === 'manager' && rowRoleDescription !== 'admin' && rowRoleDescription !== 'manager')

      return (
        <div className="flex flex-row items-center justify-center space-x-2">
          <Box>
            <Tooltip title={t('lesson.edit')}>
              <span>
                <button
                  className={`btn p-1.5 rounded-sm ${canEdit ? 'bg-sky-500 hover:bg-sky-400' : 'bg-gray-300 cursor-not-allowed'
                    }`}
                  onClick={() => {
                    setEditingId(row.original.id)
                    table.setEditingRow(row)
                  }}
                  disabled={!canEdit}
                >
                  <svg
                    className="w-4 h-4 fill-current text-white shrink-0"
                    viewBox="0 0 16 16"
                  >
                    <path d="M11.7.3c-.4-.4-1-.4-1.4 0l-10 10c-.2.2-.3.4-.3.7v4c0 .6.4 1 1 1h4c.3 0 .5-.1.7-.3l10-10c.4-.4.4-1 0-1.4l-4-4zM4.6 14H2v-2.6l6-6L10.6 8l-6 6zM12 6.6L9.4 4 11 2.4 13.6 5 12 6.6z" />
                  </svg>
                </button>
              </span>
            </Tooltip>
          </Box>
          <Box>
            <Tooltip title={t('lesson.delete')}>
              <span>
                <button
                  className={`btn p-1.5 rounded-sm ${canDelete ? 'bg-red-500 hover:bg-red-400' : 'bg-gray-300 cursor-not-allowed'
                    }`}
                  onClick={() => handleDelete(row.original.id, row.original.email)}
                  disabled={!canDelete}
                >
                  <svg
                    className="w-4 h-4 fill-current text-white shrink-0"
                    viewBox="0 0 16 16"
                  >
                    <path d="M5 7h2v6H5V7zm4 0h2v6H9V7zm3-6v2h4v2h-1v10c0 .6-.4 1-1 1H2c-.6 0-1-.4-1-1V5H0V3h4V1c0-.6.4-1 1-1h6c.6 0 1 .4 1 1zM6 2v1h4V2H6zm7 3H3v9h10V5z" />
                  </svg>
                </button>
              </span>
            </Tooltip>
          </Box>

        </div>
      )
    },

    renderTopToolbarCustomActions: ({ table }) => (
      <div className="flex space-x-2 mt-2">
        <Box>
          <Tooltip title={t('lesson.click_to_delete_selected_rows')}>
            <span>
              <button className="btn bg-red-500 hover:bg-red-400 p-1.5 rounded-sm" onClick={handleDeleteSelected}>
                <svg className="w-4 h-4 fill-current text-white shrink-0" viewBox="0 0 16 16">
                  <path d="M5 7h2v6H5V7zm4 0h2v6H9V7zm3-6v2h4v2h-1v10c0 .6-.4 1-1 1H2c-.6 0-1-.4-1-1V5H0V3h4V1c0-.6.4-1 1-1h6c.6 0 1 .4 1 1zM6 2v1h4V2H6zm7 3H3v9h10V5z" />
                </svg>
              </button>
            </span>
          </Tooltip>
        </Box>
        {/** Add new user button */}
        <Box>
          <Tooltip title="Add new user">
            <span>
              <button
                className="btn bg-green-500 hover:bg-green-400 p-1.5 rounded-sm"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 16 16">
                  <path d="M7 1h2v14H7zM1 7h14v2H1z" />
                </svg>
              </button>
            </span>
          </Tooltip>
        </Box>
      </div>
    ),
    /**
     * Determines whether a row can be selected based on the current user's role.
     *
     * @param {object} row - The row object containing the row data.
     * @param {object} row.original - The original row data.
     * @param {string} row.original.roleId - The role ID of the row.
     * @returns {boolean} - True if the row can be selected, false otherwise.
     *
     * @description
     * - role: Retrieves the role information of the current row.
     * - rowRoleDescription: Converts the role description of the row to lowercase.
     * - currentUserRoleLower: Converts the current user's role to lowercase.
     * - Determines row selection permission based on the role:
     *   - If the current user is 'admin':
     *     - Allows selecting rows where the role of the row is not 'admin'.
     *   - If the current user is 'manager':
     *     - Allows selecting rows where the role of the row is not 'admin' and not 'manager'.
     *   - Other cases (e.g., 'user'):
     *     - Returns false, not allowing row selection.
     */
    enableRowSelection: (row) => {
      const role = roles.find(role => role.id === row.original.roleId)
      const rowRoleDescription = role ? role.description.toLowerCase() : ''
      const currentUserRoleLower = typeof currentUserRoleFromRedux === 'string' ? currentUserRoleFromRedux.toLowerCase() : ''

      if (currentUserRoleLower === 'admin') {
        return rowRoleDescription !== 'admin'
      } else if (currentUserRoleLower === 'manager') {
        return rowRoleDescription !== 'admin' && rowRoleDescription !== 'manager'
      }
      return false
    },
    localization: isVietnamese() ? MRT_Localization_VI : undefined
  })

  return (
  <>
    <MaterialReactTable table={table} />

    {/* DELETE SINGLE */}
    <ModalComponent
      isOpen={isModalOpen}
      title={t('userpage.confirm_delete') ?? ''}
      imageUrl='/assets/images/permission/delete.png'
      description={t('userpage.confirm_delete_single', { name: deleteEmail }) ?? ''}
      onClose={() => setIsModalOpen(false)}
      onOk={handleConfirmDeleteSingle}
      onCancel={() => setIsModalOpen(false)}
    />

    {/* DELETE MULTIPLE */}
    <ModalComponent
      isOpen={isSecondModalOpen}
      title={t('userpage.confirm_delete') ?? ''}
      imageUrl='/assets/images/permission/delete.png'
      description={t('userpage.confirm_delete_multiple', { count: Object.keys(rowSelection).length }) ?? ''}
      onClose={() => setIsSecondModalOpen(false)}
      onOk={deleteId !== null ? handleConfirmDeleteSingle : handleConfirmDelete}
      onCancel={() => setIsSecondModalOpen(false)}
    />

    {/* CREATE USER */}
    <ModalComponent
      isOpen={isCreateModalOpen}
      title="Add new user"
      onClose={() => setIsCreateModalOpen(false)}
      onCancel={() => setIsCreateModalOpen(false)}
      onOk={handleSubmit(handleCreateUser)}
    >
      <div className="flex flex-col gap-4">

        {/* EMAIL */}
        <Controller
          name="email"
          control={control}
          rules={{ required: 'Email is required' }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Email"
              fullWidth
              error={!!errors.email}
              helperText={errors.email?.message}
            />
          )}
        />

        {/* FIRST NAME */}
        <Controller
          name="firstName"
          control={control}
          rules={{ required: 'First name is required' }}
          render={({ field }) => (
            <TextField
              {...field}
              label="First Name"
              fullWidth
              error={!!errors.firstName}
              helperText={errors.firstName?.message}
            />
          )}
        />

        {/* LAST NAME */}
        <Controller
          name="lastName"
          control={control}
          rules={{ required: 'Last name is required' }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Last Name"
              fullWidth
              error={!!errors.lastName}
              helperText={errors.lastName?.message}
            />
          )}
        />

        {/* GROUP */}
        <Controller
          name="groupId"
          control={control}
          rules={{ required: 'Group is required' }}
          render={({ field }) => (
            <TextField
              {...field}
              select
              label="Group"
              fullWidth
              error={!!errors.groupId}
              helperText={errors.groupId?.message}
            >
              {groups.map(group => (
                <MenuItem key={group.id} value={group.id}>
                  {group.name}
                </MenuItem>
              ))}
            </TextField>
          )}
        />

        {/* ROLE */}
        <Controller
          name="roleId"
          control={control}
          rules={{ required: 'Role is required' }}
          render={({ field }) => (
            <TextField
              {...field}
              select
              label="Role"
              fullWidth
              error={!!errors.roleId}
              helperText={errors.roleId?.message}
            >
              {roles.map(role => (
                <MenuItem key={role.id} value={role.id}>
                  {role.description}
                </MenuItem>
              ))}
            </TextField>
          )}
        />

      </div>
    </ModalComponent>
  </>
  )
}

export default TableUser
