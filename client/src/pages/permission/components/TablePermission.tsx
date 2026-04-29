/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* PAGE: TablePermission
========================================================================== */
import React, { useEffect, useState, useMemo, useRef } from 'react'
import ModalComponent from 'components/Modal'
import {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  MRT_EditActionButtons,
  MaterialReactTable,
  type MRT_ColumnDef,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  type MRT_Row,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  type MRT_TableOptions,
  useMaterialReactTable,
  type MRT_RowSelectionState
} from 'material-react-table'
import { Box, Tooltip } from '@mui/material'
import { fetchAllPermission, deletePermission, createPermission, updatePermission, fetchAllRoute } from 'api/post/post.api'
import { toast } from 'react-toastify'
import { useForm } from 'react-hook-form'
import { teal } from '@mui/material/colors'
import { MRT_Localization_VI } from 'material-react-table/locales/vi'
import { useTranslation } from 'react-i18next'
import { i18n } from 'services/i18n'

function isVietnamese () {
  return i18n.language === 'vi'
}

interface FormInput {
  name: string
  description: string
  url: string
  method: string
}

interface Permisson {
  id: number
  name: string
  description: string
  url: string
  method: string
  createdAt: string
  updatedAt: string
}
interface CustomCellProps {
  cell: {
    getValue: () => unknown
  }
}

interface Route {
  url: string
  method: string
}

interface TablePermissionProps {
  onPermissionsChange: (updatedPermissions: any[]) => void
}

/**
 * Returns the appropriate background color class based on the HTTP method.
 *
 * @author Hien
 * @param {string} method - The HTTP method.
 * @returns {string} The corresponding background color class.
 */

const getMethodColor = (method: string) => {
  switch (method) {
    case 'GET':
      return 'bg-green-600'
    case 'POST':
      return 'bg-blue-600'
    case 'PUT':
      return 'bg-yellow-600'
    case 'DELETE':
      return 'bg-red-600'
    case 'ANY':
      return 'bg-purple-600'
    default:
      return 'bg-gray-600'
  }
}

/**
 * TablePermission component displays a table of permissions with various functionalities.
 *
 * @author Hien
 * @component
 * @param {TablePermissionProps} props - The props for the component.
 * @returns {JSX.Element} The rendered TablePermission component.
 *
 * @property {object} t - The translation function from useTranslation hook.
 * @property {Permisson[]} data - The state for storing permission data.
 * @property {MRT_RowSelectionState} rowSelection - The state for managing row selection.
 * @property {boolean} isModalOpen - The state for managing the first modal's visibility.
 * @property {boolean} isSecondModalOpen - The state for managing the second modal's visibility.
 * @property {Permisson | null} editingPermission - The state for storing the permission being edited.
 * @property {Route[]} route - The state for storing route data.
 * @property {number | null} deleteId - The state for storing the ID of the permission to be deleted.
 * @property {string | null} deleteName - The state for storing the name of the permission to be deleted.
 * @property {string} currentLanguage - The state for storing the current language.
 */

const TablePermission: React.FC<TablePermissionProps> = ({ onPermissionsChange }) => {
  const { t } = useTranslation()
  const nameInputRef = React.useRef<HTMLInputElement>(null)
  const descriptionTextRef = React.useRef<HTMLTextAreaElement>(null)
  const routeSelectRef = React.useRef<HTMLSelectElement>(null)
  const [errorField, setErrorField] = useState<string>('')

  const [data, setData] = useState<Permisson[]>([])

  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({})

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSecondModalOpen, setIsSecondModalOpen] = useState(false)

  const [editingPermission, setEditingPermission] = useState<Permisson | null>(null)
  const [route, setRoute] = useState<Route[]>([])

  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleteName, setDeleteName] = useState<string | null>(null)
  const [currentLanguage, setCurrentLanguage] = useState<string>(i18n.language)
  const [isLoading, setIsLoading] = useState(false)
  const isFirstRender = useRef(true)
  // Update permissions data on change
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    onPermissionsChange(data)
  }, [data, onPermissionsChange])

  // Update current language state on language change
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
   * Handles the deletion of a specific permission by opening the confirmation modal.
   *
   * @author Hien
   * @param {number} id - The ID of the permission to delete.
   * @param {string} name - The name of the permission to delete.
   */
  const handleDelete = (id: number, name: string) => {
    setErrorField('')
    reset()
    setDeleteId(id)
    setDeleteName(name)
    setIsModalOpen(true)
  }

  /**
   * Confirms the deletion of a single permission.
   *
   * @author Hien
   * @async
   * @returns {Promise<void>}
   */
  const handleConfirmDeleteSingle = async () => {
    if (deleteId === null) {
      toast.error(t('permissionpage.toast.noRowSelectedDelete'))
      return
    }
    await deletePermission(deleteId.toString())
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
    setDeleteId(null)
    setIsModalOpen(false)
    toast.success(t('permissionpage.toast.deleteSuccessfully'))
    reset() // reset form after delete
  }

  useEffect(() => {
    let isMounted = true

    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [permissionsResponse, routesResponse] = await Promise.all([
          fetchAllPermission(),
          fetchAllRoute()
        ])
        if (isMounted) {
          setData(permissionsResponse.data)
          setRoute(routesResponse.data)
        }
      } catch (error: any) {
        // Xử lý lỗi
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      isMounted = false
    }
  }, [])

  const { register, handleSubmit, reset, setValue } = useForm<FormInput>()

  /**
   * Handles creating a new permission.
   *
   * @author Hien
   * @async
   * @param {FormInput} data - The form input data.
   * @returns {Promise<void>}
   */
  const handleCreatePermission = async (data: FormInput) => {
    try {
      const [method, url] = data.method.split(' ')
      const response = await createPermission({ ...data, method, url })
      setData(prevData => [...prevData, response.data])
      reset()
      toast.success(t('permissionpage.toast.createPermissionSuccessfully'))
    } catch (error: any) {
      if (error.field) {
        setErrorField(error.field)
        if (error.field === 'name') {
          if (error.errorCode === 'NAME_ALREADY_EXISTS') {
            toast.error(t('permissionpage.toast.permissionNameAlreadyExists'))
          } else if (error.errorCode === 'NAME_CANNOT_BE_NUMBER') {
            toast.error(t('permissionpage.toast.permissionNameCannotBeNumber'))
          } else {
            toast.error(t('permissionpage.toast.permissonNameRequired'))
          }
          nameInputRef.current?.focus()
        } else if (error.field === 'description') {
          if (error.errorCode === 'DESCRIPTION_ALREADY_EXISTS') {
            toast.error(t('permissionpage.toast.permissionDescriptionAlreadyExists'))
          } else if (error.errorCode === 'DESCRIPTION_CANNOT_BE_NUMBER') {
            toast.error(t('permissionpage.toast.permissionDescriptionCannotBeNumber'))
          } else {
            toast.error(t('permissionpage.toast.permissionDescriptionRequired'))
          }
          descriptionTextRef.current?.focus()
        } else if (error.field === 'route') {
          if (error.errorCode === 'URL_METHOD_ALREADY_EXISTS') {
            toast.error(t('permissionpage.toast.routeMethodAlreadyExists'))
          } else if (error.errorCode === 'URL_METHOD_ANY_EXISTS') {
            toast.error(t('permissionpage.toast.routeMethodAnyExists'))
          } else {
            toast.error(t('permissionpage.toast.routeMethodRequired'))
          }
          routeSelectRef.current?.focus()
        }
      }
    }
  }

  /**
   * Handles editing an existing permission.
   *
   * @author Hien
   * @param {Permisson} permission - The permission to edit.
   */
  const handleEditPermission = (permission: Permisson) => {
    setErrorField('')
    reset()
    setEditingPermission(permission)
    setValue('name', permission.name)
    setValue('description', permission.description)
    setValue('method', `${permission.method} ${permission.url}`)
  }
  const handleCancelEdit = () => {
    setEditingPermission(null)
    setErrorField('')
    reset()
  }
  /**
   * Handles updating an existing permission.
   *
   * @author Hien
   * @async
   * @param {FormInput} data - The form input data.
   * @returns {Promise<void>}
   */
  const handleUpdatePermission = async (data: FormInput) => {
    if (!editingPermission) return
    // Check if any field has changed
    const [method, url] = data.method.split(' ')
    const hasChanged =
      data.name !== editingPermission.name ||
      data.description !== editingPermission.description ||
      url !== editingPermission.url ||
      method !== editingPermission.method

    if (!hasChanged) {
      toast.info(t('permissionpage.toast.noChangesMade'))
      return
    }

    try {
      const response = await updatePermission(editingPermission.id.toString(), { ...data, method, url })
      const updatedPermission = response.data
      setData((prevData) =>
        prevData.map((row) => (row.id === editingPermission.id ? updatedPermission : row))
      )
      setEditingPermission(null)
      reset()
      toast.success(t('permissionpage.toast.updatePermissionSuccessfully'))
    } catch (error: any) {
      if (error.field) {
        setErrorField(error.field)
        if (error.field === 'name') {
          if (error.errorCode === 'NAME_REQUIRED_NUMBER') {
            toast.error(t('permissionpage.toast.permissionNameCannotBeNumber'))
          } else {
            toast.error(t('permissionpage.toast.permissionNameAlreadyExists'))
          }
          nameInputRef.current?.focus()
        } else if (error.field === 'description') {
          if (error.errorCode === 'DESCRIPTION_REQUIRED_NUMBER') {
            toast.error(t('permissionpage.toast.permissionDescriptionCannotBeNumber'))
          } else {
            toast.error(t('permissionpage.toast.permissionDescriptionAlreadyExists'))
          }
          descriptionTextRef.current?.focus()
        } else if (error.field === 'route') {
          if (error.errorCode === 'URL_METHOD_ALREADY_EXISTS') {
            toast.error(t('permissionpage.toast.routeMethodAlreadyExists'))
          } else if (error.errorCode === 'URL_METHOD_ANY_EXISTS') {
            toast.error(t('permissionpage.toast.routeMethodAnyExistsUpdate'))
          } else {
            toast.error(t('permissionpage.toast.routeMethodRequired'))
          }
          routeSelectRef.current?.focus()
        }
      }
    }
  }

  // Handles the deletion of selected permissions by opening the confirmation modal.
  const handleDeleteSelected = () => {
    const selectedIds = Object.keys(rowSelection).map(Number)
    if (selectedIds.length === 0) {
      toast.error(t('permissionpage.toast.noRowSelected'))
      return
    }
    setIsSecondModalOpen(true)
  }

  /**
   * Confirms the deletion of selected permissions.
   *
   * @author Hien
   * @async
   * @returns {Promise<void>}
   */
  const handleConfirmDelete = async () => {
    const selectedIds = Object.keys(rowSelection).map(Number)
    await Promise.all(selectedIds.map(async (id) => await deletePermission(id.toString())))
    setData((prevData) => prevData.filter((row) => !selectedIds.includes(row.id)))
    setRowSelection({})
    setIsModalOpen(false)
    setIsSecondModalOpen(false)
    toast.success(t('permissionpage.toast.deleteSelectedSuccessfully'))
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
      formattedCreatedAt: formatDateForDatetimeLocal(item.createdAt),
      formattedUpdatedAt: formatDateForDatetimeLocal(item.updatedAt)
    }))
  }, [data])

  // Memoized columns configuration
  const columns = useMemo<Array<MRT_ColumnDef<Permisson>>>(
    () => [
      {
        accessorKey: 'id',
        header: t('permissionpage.id'),
        enableColumnActions: false,
        enableColumnDragging: false,
        enableColumnFilter: false,
        enableColumnOrdering: false,
        enableEditing: false,
        enableGlobalFilter: false,
        enableGrouping: false,
        enableHiding: false,
        enableResizing: false
      },
      {
        accessorKey: 'name',
        header: t('permissionpage.name')
      },
      {
        accessorKey: 'description',
        header: t('permissionpage.description')
      },
      {
        accessorKey: 'url',
        header: t('permissionpage.url')
      },
      {
        accessorKey: 'method',
        header: t('permissionpage.method'),
        Cell: ({ cell }: CustomCellProps) => (
          <div
            className={getMethodColor(String(cell.getValue())) + ' text-white font-bold text-xs rounded-none inline-flex justify-center px-2 text-[10px]'}
          >
            {String(cell.getValue())}
          </div>
        )
      },
      {
        accessorKey: 'formattedCreatedAt',
        header: t('permissionpage.createdAt'),
        enableEditing: false
      },
      {
        accessorKey: 'formattedUpdatedAt',
        header: t('permissionpage.updatedAt'),
        enableEditing: false
      }
    ],
    [t, currentLanguage]
  )

  const table = useMaterialReactTable({
    columns,
    data: dataWithFormattedDates,
    paginationDisplayMode: 'pages',
    enableRowSelection: true,
    initialState: {
      pagination: { pageSize: 25, pageIndex: 0 },
      sorting: [{ id: 'id', desc: true }],
      columnVisibility: { id: false },
      columnPinning: { right: ['mrt-row-actions'], left: [] } // để cột actions ở bên phải của table không dịch chuyển
    },
    positionToolbarAlertBanner: 'top',
    enableFilterMatchHighlighting: false,
    getRowId: (row: Permisson) => row?.id?.toString(),
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
    muiSearchTextFieldProps: {
      label: t('permissionpage.searchAllFields')
    },
    layoutMode: 'grid',
    muiPaginationProps: {
      rowsPerPageOptions: [
        { label: '25', value: 25 },
        { label: '100', value: 100 },
        { label: t('lesson.All'), value: dataWithFormattedDates.length }
      ],
      showFirstButton: true,
      showLastButton: true
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
    positionActionsColumn: 'last',
    enableRowActions: true,
    renderRowActions: ({ row, table }) => (
      <div className="flex flex-row items-center justify-center space-x-2 ">
        <Box>
          <Tooltip title= {t('permissionpage.edit')}>
            <button className="btn bg-sky-500 hover:bg-sky-400  p-1.5 rounded-sm" onClick={() => handleEditPermission(row.original)}>
              <svg className="w-4 h-4 fill-current text-white shrink-0" viewBox="0 0 16 16">
                <path d="M11.7.3c-.4-.4-1-.4-1.4 0l-10 10c-.2.2-.3.4-.3.7v4c0 .6.4 1 1 1h4c.3 0 .5-.1.7-.3l10-10c.4-.4.4-1 0-1.4l-4-4zM4.6 14H2v-2.6l6-6L10.6 8l-6 6zM12 6.6L9.4 4 11 2.4 13.6 5 12 6.6z" />
              </svg>
            </button>
          </Tooltip>
        </Box>
        <Box>
          <Tooltip title= {t('permissionpage.delete')}>
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
      <div className="flex space-x-4 -ml-0.5">
        <button className="btn bg-red-500 hover:bg-red-400 p-1.5 rounded-sm" onClick={handleDeleteSelected}>
          <svg className="w-4 h-4 fill-current text-white shrink-0" viewBox="0 0 16 16">
            <path d="M5 7h2v6H5V7zm4 0h2v6H9V7zm3-6v2h4v2h-1v10c0 .6-.4 1-1 1H2c-.6 0-1-.4-1-1V5H0V3h4V1c0-.6.4-1 1-1h6c.6 0 1 .4 1 1zM6 2v1h4V2H6zm7 3H3v9h10V5z" />
          </svg>
        </button>
      </div>
    ),
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
    autoResetPageIndex: false,
    localization: isVietnamese() ? MRT_Localization_VI : undefined
  })

  return (
    <>
      <form
        onSubmit={handleSubmit(editingPermission ? handleUpdatePermission : handleCreatePermission)}
        className="space-y-4 px-4 py-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Name Input */}
          <div>
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('permissionpage.name')}
              </label>
              <input
                {...register('name')}
                placeholder={t('permissionpage.enterPermissionName') ?? 'Defaultplaceholder'}
                className={`form-input w-full border border-gray-300 p-2 rounded-md focus:outline-none ${errorField === 'name' ? 'border-red-500' : 'focus:ring-1 focus:ring-teal-400 focus:border-teal-400'}`}
                onChange={() => setErrorField('')}
              />
            </div>
          </div>
          {/* Description Input */}
          <div>
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('permissionpage.description')}
              </label>
              <textarea
                {...register('description')}
                placeholder={t('permissionpage.enterPermissionDescription') ?? 'Defaultplaceholder'}
                className={`form-input w-full border border-gray-300 p-2 rounded-md focus:outline-none ${errorField === 'description' ? 'border-red-500' : 'focus:ring-1 focus:ring-teal-400 focus:border-teal-400'}`}
                onChange={() => setErrorField('')}
              />
            </div>
          </div>
          {/* Select Route */}
          <div>
            <label className="block text-sm font-medium mb-1">
              {t('permissionpage.selectRoute')}
            </label>
            <select
              {...register('method')}
              className={`form-input w-full border border-gray-300 p-2 rounded-md focus:outline-none ${errorField === 'route' ? 'border-red-500' : 'focus:ring-1 focus:ring-teal-400 focus:border-teal-400'}`}
              onChange={() => setErrorField('')}
            >
              <option value="">{t('permissionpage.pleaseSelectRoute')}</option>
              {route.map((routeObj, index) => {
                const displayText = `${routeObj.method} ${routeObj.url}`
                return (
                  <option key={index} value={displayText}>
                    {displayText}
                  </option>
                )
              })}
            </select>
          </div>
        </div>
        {/* Submit Button */}
        <div className="flex justify-end space-x-2">
        <button
          type="submit"
          className="px-4 py-2 bg-green-500 text-white rounded shadow-md hover:bg-green-600 transition"
        >
          {editingPermission ? t('permissionpage.update') : t('permissionpage.create')}
        </button>
        {editingPermission && (
          <button
            type="button"
            onClick={handleCancelEdit}
            className="px-4 py-2 bg-gray-500 text-white rounded shadow-md hover:bg-gray-600 transition"
          >
            {t('permissionpage.cancel')}
          </button>
        )}
      </div>
      </form>
      <hr className="my-4" />
      {/* Table and Modals */}
      <MaterialReactTable table={table} />
      <ModalComponent
        isOpen={isModalOpen}
        title={t('permissionpage.confirm_delete') ?? ''}
        imageUrl='/assets/images/permission/delete.png'
        description={t('permissionpage.confirm_delete_single', { name: deleteName }) ?? ''}
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
        title={t('permissionpage.confirm_delete') ?? ''}
        imageUrl='/assets/images/permission/delete.png'
        description={t('permissionpage.confirm_delete_multiple', { count: Object.keys(rowSelection).length }) ?? ''}
        onClose={() => {
          setIsSecondModalOpen(false)
        }}
        onOk={deleteId !== null ? handleConfirmDeleteSingle : handleConfirmDelete}
        onCancel={() => {
          setIsSecondModalOpen(false)
        }}
      />
    </>
  )
}
export default TablePermission
