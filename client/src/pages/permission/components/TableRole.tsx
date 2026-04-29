/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* PAGE: TableRole
   ========================================================================== */

import React, { useState, useEffect } from 'react'
import { fetchRole, fetchPermissionByRole, assignPermissonToRole, createRole, deleteRole } from 'api/post/post.api'
import _ from 'lodash'
import { toast } from 'react-toastify'
import ModalComponent from 'components/Modal'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

interface Role {
  id: number
  name: string
  description: string
  createdAt: string
  updatedAt: string
}

interface Permission {
  id: number
  name: string
  description: string
}

interface PermissionObject {
  id: number
  description: string
  isAssigned: boolean
}
interface TableRoleProps {
  permissions: Permission[]
}
interface FormInput {
  name: string
  description: string
}

/**
 * TableRole component displays a table of roles with various functionalities.
 *
 * @author Hien
 * @component
 * @returns {JSX.Element} The rendered TableRole component.
 *
 * @property {object} t - The translation function from useTranslation hook.
 * @property {Role[]} userRole - The state for storing role data.
 * @property {string} selectedRole - The state for storing the selected role.
 * @property {PermissionObject[]} assignedPermissionsByRole - The state for storing assigned permissions by role.
 * @property {boolean} isDeleteModalOpen - The state for managing the delete modal's visibility.
 * @property {string} errorField - The state for storing the error field.
 */
const TableRole = ({ permissions }: TableRoleProps) => {
  const nameInputRef = React.useRef<HTMLInputElement>(null)
  const descriptionTextRef = React.useRef<HTMLTextAreaElement>(null)
  const selectedRoleRef = React.useRef<HTMLSelectElement>(null)
  const [errorField, setErrorField] = useState<string>('')

  const [userRole, setUserRole] = useState<Role[]>([])
  const [selectedRole, setSelectedRole] = useState<string>('')
  const [assignedPermissionsByRole, setAssignedPermissionsByRole] = useState<PermissionObject[]>([])
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false)
  const [originalAssignedPermissions, setOriginalAssignedPermissions] = useState<PermissionObject[]>([])

  const { t } = useTranslation()

  // Opens the delete modal if a role is selected.
  const openDeleteModal = () => {
    if (selectedRole === '') {
      toast.error(t('permissionpage.toast.pleaseSelectARoleFirst'))
      setErrorField('role')
      selectedRoleRef.current?.focus()
    } else {
      setIsDeleteModalOpen(true)
    }
  }

  // Closes the delete modal.
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false)
  }

  // Fetch role data on mount
  useEffect(() => {
    async function fetchData () {
      try {
        const roleResponse = await fetchRole()
        setUserRole(roleResponse.data)
      } catch (error) {
        console.error('Failed to fetch data:', error)
      }
    }
    fetchData()
  }, [])

  // Fetch permissions by role on role change
  useEffect(() => {
    if (selectedRole !== '') {
      const updateAssignedPermissions = async () => {
        try {
          const response = await fetchPermissionByRole(selectedRole)
          const result = buildDataPermissonByRole(response.data, permissions)
          setAssignedPermissionsByRole(result)
          setOriginalAssignedPermissions(_.cloneDeep(result))
        } catch (error) {
          console.error('Failed to fetch permissions by role:', error)
        }
      }
      updateAssignedPermissions()
    }
  }, [permissions, selectedRole])

  /**
   * Handles the change of selected role and fetches permissions for the selected role.
   *
   * @author Hien
   * @param {string} value - The selected role ID.
   */
  const handleOnchangeRole = async (value: string) => {
    setSelectedRole(value)
    if (value !== '') {
      try {
        const response = await fetchPermissionByRole(value)
        const result = buildDataPermissonByRole(response.data, permissions)
        setAssignedPermissionsByRole(result)
      } catch (error) {
        console.error('Failed to fetch permissions by role:', error)
      }
    }
  }

  /**
   * Builds the data structure for permissions by role.
   *
   * @author Hien
   * @param {Permission[]} groupPermisson - The permissions assigned to the role.
   * @param {Permission[]} allPermisson - All available permissions.
   * @returns {PermissionObject[]} The structured permissions data.
   */
  const buildDataPermissonByRole = (groupPermisson: Permission[], allPermisson: Permission[]): PermissionObject[] => {
    const result: PermissionObject[] = []
    if (allPermisson.length > 0) {
      allPermisson.forEach((permission: Permission) => {
        const object: PermissionObject = {
          id: permission.id,
          description: permission.description,
          isAssigned: false
        }
        if (groupPermisson.length > 0) {
          object.isAssigned = groupPermisson.some((item: Permission) => item.name === permission.name)
        }
        result.push(object)
      })
    }
    return result
  }

  /**
   * Handles the selection of a permission.
   *
   * @author Hien
   * @param {string} value - The ID of the selected permission.
   */
  const handleSelectPermission = (value: string) => {
    const _assignedPermissionsByRole = _.cloneDeep(assignedPermissionsByRole)
    const foundIndex = _assignedPermissionsByRole.findIndex(item => +item.id === +value)
    if (foundIndex > -1) {
      _assignedPermissionsByRole[foundIndex].isAssigned = !_assignedPermissionsByRole[foundIndex].isAssigned
    }
    setAssignedPermissionsByRole(_assignedPermissionsByRole)
  }

  /**
   * Handles saving the assigned permissions to the selected role.
   *
   * @author Hien
   * @async
   * @returns {Promise<void>}
   */
  const handleSave = async () => {
    if (selectedRole === '') {
      toast.error(t('permissionpage.toast.pleaseSelectARoleFirst'))
      setErrorField('role')
      selectedRoleRef.current?.focus()
      return
    }

    if (_.isEqual(assignedPermissionsByRole, originalAssignedPermissions)) {
      toast.info(t('permissionpage.toast.noChangesMade'))
      return
    }

    try {
      const permissionIds = assignedPermissionsByRole
        .filter(permission => permission.isAssigned)
        .map(permission => permission.id)

      const payload = { roleId: selectedRole, permissionIds }
      await assignPermissonToRole(payload)
      toast.success(t('permissionpage.toast.assignPermissionSuccessfully'))

      setOriginalAssignedPermissions(_.cloneDeep(assignedPermissionsByRole))
    } catch (error: any) {
      toast.error(t('permissionpage.toast.assignPermissionFailed'))
    }
  }

  /**
   * Handles deleting the selected role.
   *
   * @author Hien
   * @async
   * @returns {Promise<void>}
   */
  const handleDeleteRole = async () => {
    try {
      if (selectedRole === '') {
        toast.error(t('permissionpage.toast.pleaseSelectARoleToDelete'))
      } else {
        await deleteRole(selectedRole)
        const fetchResponse = await fetchRole()
        setUserRole(fetchResponse.data)
        setSelectedRole('')
        toast.success(t('permissionpage.toast.deleteRoleSuccessfully'))
        closeDeleteModal()
      }
    } catch (error: any) {
      console.error('Failed to delete role or fetch roles:', error)
      toast.error(t('permissionpage.toast.roleCanNot'))
    }
  }

  const { register, handleSubmit, reset } = useForm<FormInput>()

  /**
   * Handles creating a new role.
   *
   * @author Hien
   * @async
   * @param {FormInput} data - The form input data.
   * @returns {Promise<void>}
   */
  const handleCreatePermission = async (data: FormInput) => {
    try {
      const response = await createRole(data)
      setUserRole(prevData => [...prevData, response.data])
      reset()
      toast.success(t('permissionpage.toast.createRoleSuccessfully'))
    } catch (error: any) {
      if (error.field) {
        setErrorField(error.field)
        if (error.field === 'name') {
          if (error.errorCode === 'ROLE_ALREADY_EXISTS') {
            toast.error(t('permissionpage.toast.roleNameAlreadyExists'))
          } else if (error.errorCode === 'NAME_REQUIRED_NUMBER') {
            toast.error(t('permissionpage.toast.roleNameCannotBeNumber'))
          } else {
            toast.error(t('permissionpage.toast.roleNameRequired'))
          }
          nameInputRef.current?.focus()
        } else if (error.field === 'description') {
          if (error.errorCode === 'DESCRIPTION_ALREADY_EXISTS') {
            toast.error(t('permissionpage.toast.roleDescriptionAlreadyExists'))
          } else if (error.errorCode === 'DESCRIPTION_REQUIRED_NUMBER') {
            toast.error(t('permissionpage.toast.roleDescriptionCannotBeNumber'))
          } else {
            toast.error(t('permissionpage.toast.roleDescriptionRequired'))
          }
          descriptionTextRef.current?.focus()
        } else {
          // toast.error(error.message)
        }
      }
    }
  }
  return (
    <>
      <form onSubmit={handleSubmit(handleCreatePermission)}
        className="space-y-4 px-4 py-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {/* Name Input */}
          <div>
            <div>
              <label className="block text-sm font-medium mb-1">
                 {t('permissionpage.name')}
              </label>
              <input
                {...register('name')}
                placeholder={t('permissionpage.enterRoleName') ?? 'Defaultplaceholder'}
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
                placeholder={t('permissionpage.enterRoleDescription') ?? 'Defaultplaceholder'}
                className={`form-input w-full border border-gray-300 p-2 rounded-md focus:outline-none ${errorField === 'description' ? 'border-red-500' : 'focus:ring-1 focus:ring-teal-400 focus:border-teal-400'}`}
                onChange={() => setErrorField('')}
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <button type="submit" className='px-4 py-2 bg-green-500 text-white rounded'>
            {t('permissionpage.create')}
          </button>
        </div>
      </form>
      <hr className="my-4" />
      <div className="space-y-4 px-4">
        <h4 className="text-xl font-bold">{t('permissionpage.listRole')}</h4>

        <div className="flex flex-row items-start gap-4">
          <button className="btn bg-red-500 hover:bg-red-400 p-1.5 rounded-sm mt-1" onClick={openDeleteModal}>
            <svg className="w-4 h-4 fill-current text-white shrink-0" viewBox="0 0 16 16">
              <path d="M5 7h2v6H5V7zm4 0h2v6H9V7zm3-6v2h4v2h-1v10c0 .6-.4 1-1 1H2c-.6 0-1-.4-1-1V5H0V3h4V1c0-.6.4-1 1-1h6c.6 0 1 .4 1 1zM6 2v1h4V2H6zm7 3H3v9h10V5z" />
            </svg>
          </button>
          <select
              className={`block w-full sm:w-80 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none ${errorField === 'role' ? 'border-red-500' : 'focus:ring-1 focus:ring-teal-400 focus:border-teal-400'}`}
              onChange={async (event) => {
                await handleOnchangeRole(event.target.value)
                setErrorField('')
              }}
            >
            <option value="">{t('permissionpage.pleaseSelectRole')}</option>
            {userRole.length > 0 &&
              userRole.map((role, index) => {
                return (
                  <option key={`role-${index}`} value={role.id}>
                    {role.description}
                  </option>
                )
              })}
          </select>
        </div>
        <hr className="my-8" />
        <div className="flex items-center justify-between pb-5">
          <h5 className="text-lg font-semibold">{t('permissionpage.assignPermissions')}</h5>
          <button className='bg-blue-500 text-white px-4 py-2 rounded' onClick={handleSave}>{t('permissionpage.save')}</button>
        </div>
        {selectedRole !== '' &&
          <div className='permission grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto max-h-48'>
            {
              assignedPermissionsByRole.length > 0 && assignedPermissionsByRole.map((permission, index) => {
                return (
                  <div key={`permission-${index}`} className='form-check mt-2'>
                    <input
                      className='form-check-input'
                      type='checkbox'
                      id={`permission-${index}`}
                      value={permission.id.toString()}
                      checked={permission.isAssigned || false}
                      onChange={(event) => handleSelectPermission(event.target.value)}
                    />
                    <label className='form-check-label ml-2' htmlFor={`permission-${index}`}>
                      {permission.description}
                    </label>
                  </div>
                )
              })
            }
          </div>
        }
      </div>

      <ModalComponent
        isOpen={isDeleteModalOpen}
        title={t('permissionpage.confirm_delete') ?? ''}
        imageUrl='/assets/images/permission/delete.png'
        description={t('permissionpage.confirm_delete_role') ?? ''}
        onClose={() => setIsDeleteModalOpen(false)}
        onOk={async () => {
          await handleDeleteRole()
          closeDeleteModal()
        }}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </>
  )
}

export default TableRole
