/* eslint-disable @typescript-eslint/explicit-function-return-type */
import React, { useEffect, useRef } from 'react'
import {
  useForm,
  Controller,
  UseFormSetError,
  UseFormSetFocus
} from 'react-hook-form'
import Transition from '../../utils/Transition'
import { useTranslation } from 'react-i18next'

export interface CreateUserForm {
  email: string
  username: string
  firstName: string
  lastName: string
  groupId: string
  roleId: string
}

export interface FormControls {
  setError: UseFormSetError<CreateUserForm>
  setFocus: UseFormSetFocus<CreateUserForm>
  reset: () => void
}

export interface AddUserModalProps {
  modalOpen: boolean
  onClose: () => void
  onOk: (data: CreateUserForm) => Promise<void>
  onRegisterFormControls?: (controls: FormControls) => void
  groups: Array<{ id: number | string, name: string }>
  roles: Array<{ id: number | string, description: string }>
}

/** Xoá dấu tiếng Việt */
export const removeVietnameseTones = (str: string): string =>
  str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')

/** Tạo username từ họ + tên: chữ thường, bỏ dấu, bỏ khoảng trắng */
export const buildUsername = (firstName: string, lastName: string): string => {
  const full = `${firstName ?? ''} ${lastName ?? ''}`.trim().toLowerCase()
  return removeVietnameseTones(full).replace(/\s+/g, '')
}

/**
 * AddUserModal — modal tạo người dùng mới.
 *
 * - Dùng react-hook-form (Controller) cho toàn bộ form state.
 * - Expose setError / setFocus / reset cho parent qua onRegisterFormControls.
 */
const AddUserModal: React.FC<AddUserModalProps> = ({
  modalOpen,
  onClose,
  onOk,
  onRegisterFormControls,
  groups,
  roles
}) => {
  const { t } = useTranslation()

  const {
    control,
    handleSubmit,
    reset,
    setError,
    setFocus,
    clearErrors,
    formState: { errors, isSubmitting }
  } = useForm<CreateUserForm>({
    defaultValues: {
      email: '',
      username: '',
      firstName: '',
      lastName: '',
      groupId: '',
      roleId: ''
    }
  })

  // Đăng ký form controls với parent (chỉ 1 lần lúc mount)
  const registeredRef = useRef(false)
  useEffect(() => {
    if (!registeredRef.current) {
      registeredRef.current = true
      onRegisterFormControls?.({ setError, setFocus, reset })
    }
  }, [])

  const handleClose = () => { reset(); onClose() }

  const onSubmit = async (formData: CreateUserForm) => {
    await onOk(formData)
  }

  return (
  <>
    {/* Backdrop */}
    <Transition
      className='fixed inset-0 bg-slate-900 bg-opacity-30 z-50 transition-opacity'
      show={modalOpen}
      enter='transition ease-out duration-200'
      enterStart='opacity-0'
      enterEnd='opacity-100'
      leave='transition ease-out duration-100'
      leaveStart='opacity-100'
      leaveEnd='opacity-0'
      aria-hidden='true'
    />

    {/* Dialog */}
    <Transition
      className='fixed inset-0 z-50 overflow-hidden flex items-center justify-center px-4 sm:px-6'
      role='dialog'
      aria-modal='true'
      show={modalOpen}
      enter='transition ease-in-out duration-200'
      enterStart='opacity-0 translate-y-4'
      enterEnd='opacity-100 translate-y-0'
      leave='transition ease-in-out duration-200'
      leaveStart='opacity-100 translate-y-0'
      leaveEnd='opacity-0 translate-y-4'
    >
      <div className='bg-white rounded-lg shadow-lg max-w-xl w-full p-6'>

        {/* Header */}
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-lg font-semibold text-slate-800'>
            {t('userpage.Addnewuser')}
          </h2>

          <button
            className='text-slate-400 hover:text-slate-500'
            onClick={handleClose}
          >
            <svg className='w-5 h-5 fill-current' viewBox='0 0 20 20'>
              <path d='M10 8.586L3.707 2.293a1 1 0 10-1.414 1.414L8.586 10l-6.293 6.293a1 1 0 101.414 1.414L10 11.414l6.293 6.293a1 1 0 001.414-1.414L11.414 10l6.293-6.293a1 1 0 00-1.414-1.414L10 8.586z' />
            </svg>
          </button>
        </div>

        {/* Email */}
        <Controller
          name='email'
          control={control}
          rules={{
            validate: {
              required: (v) =>
                v.trim() !== '' ||
                String(t('userpage.validation.emailRequired')),

              pattern: (v) =>
                /^\S+@\S+\.\S+$/.test(v) ||
                String(t('userpage.validation.emailInvalid'))
            }
          }}
          render={({ field }) => (
            <div className='mb-4'>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                {t('userpage.email')}
              </label>

              <input
                {...field}
                type='text'
                disabled={isSubmitting}
                onChange={(e) => {
                  field.onChange(e)
                  clearErrors('email')
                }}
                className={`w-full p-3 border rounded-md outline-none ${
                  errors.email != null ? 'border-red-500' : 'border-gray-300'
                }`}
              />

              {errors.email != null && (
                <p className='text-red-500 text-xs mt-1'>
                  {errors.email.message}
                </p>
              )}
            </div>
          )}
        />

        {/* FirstName + LastName */}
        <div className='grid grid-cols-2 gap-4 mb-4'>

          <Controller
            name='firstName'
            control={control}
            rules={{
              validate: {
                required: (v) =>
                  v.trim() !== '' ||
                  String(t('userpage.validation.firstNameRequired'))
              }
            }}
            render={({ field }) => (
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  {t('userpage.firstName')}
                </label>

                <input
                  {...field}
                  type='text'
                  disabled={isSubmitting}
                  onChange={(e) => {
                    field.onChange(e)
                    clearErrors('firstName')
                  }}
                  className={`w-full p-3 border rounded-md outline-none ${
                    errors.firstName != null
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                />

                {errors.firstName != null && (
                  <p className='text-red-500 text-xs mt-1'>
                    {errors.firstName.message}
                  </p>
                )}
              </div>
            )}
          />

          <Controller
            name='lastName'
            control={control}
            rules={{
              validate: {
                required: (v) =>
                  v.trim() !== '' ||
                  String(t('userpage.validation.lastNameRequired'))
              }
            }}
            render={({ field }) => (
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  {t('userpage.lastName')}
                </label>

                <input
                  {...field}
                  type='text'
                  disabled={isSubmitting}
                  onChange={(e) => {
                    field.onChange(e)
                    clearErrors('lastName')
                  }}
                  className={`w-full p-3 border rounded-md outline-none ${
                    errors.lastName != null
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                />

                {errors.lastName != null && (
                  <p className='text-red-500 text-xs mt-1'>
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            )}
          />

        </div>

        {/* Username */}
        <Controller
          name='username'
          control={control}
          rules={{
            validate: {
              required: (v) =>
                v.trim() !== '' ||
                String(t('userpage.validation.usernameRequired')),

              minLen: (v) =>
                v.trim().length >= 3 ||
                String(t('userpage.validation.usernameMinLength')),

              pattern: (v) =>
                /^[a-z0-9_]+$/.test(v.trim()) ||
                String(t('userpage.validation.usernamePattern'))
            }
          }}
          render={({ field }) => (
            <div className='mb-4'>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                {t('userpage.userName')}
              </label>

              <input
                {...field}
                type='text'
                disabled={isSubmitting}
                onChange={(e) => {
                  field.onChange(e)
                  clearErrors('username')
                }}
                className={`w-full p-3 border rounded-md outline-none ${
                  errors.username != null
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
              />

              {errors.username != null && (
                <p className='text-red-500 text-xs mt-1'>
                  {errors.username.message}
                </p>
              )}
            </div>
          )}
        />

        {/* Group */}
        <Controller
          name='groupId'
          control={control}
          rules={{
            validate: {
              required: (v) =>
                v.trim() !== '' ||
                String(t('userpage.validation.groupRequired'))
            }
          }}
          render={({ field }) => (
            <div className='mb-4'>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                {t('userpage.group')}
              </label>

              <select
                {...field}
                disabled={isSubmitting}
                onChange={(e) => {
                  field.onChange(e)
                  clearErrors('groupId')
                }}
                className={`w-full p-3 border rounded-md outline-none ${
                  errors.groupId != null
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
              >
                <option value=''>{t('userpage.group')}</option>

                {groups.map(g => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>

              {errors.groupId != null && (
                <p className='text-red-500 text-xs mt-1'>
                  {errors.groupId.message}
                </p>
              )}
            </div>
          )}
        />

        {/* Role */}
        <Controller
          name='roleId'
          control={control}
          rules={{
            validate: {
              required: (v) =>
                v.trim() !== '' ||
                String(t('userpage.validation.roleRequired'))
            }
          }}
          render={({ field }) => (
            <div className='mb-6'>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                {t('userpage.role')}
              </label>

              <select
                {...field}
                disabled={isSubmitting}
                onChange={(e) => {
                  field.onChange(e)
                  clearErrors('roleId')
                }}
                className={`w-full p-3 border rounded-md outline-none ${
                  errors.roleId != null
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
              >
                <option value=''>{t('userpage.role')}</option>

                {roles.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.description}
                  </option>
                ))}
              </select>

              {errors.roleId != null && (
                <p className='text-red-500 text-xs mt-1'>
                  {errors.roleId.message}
                </p>
              )}
            </div>
          )}
        />

        {/* Footer */}
        <div className='flex justify-end space-x-2'>
          <button
            type='button'
            disabled={isSubmitting}
            onClick={handleClose}
            className='px-5 py-2 bg-gray-300 rounded-md font-bold'
          >
            {t('modal.cancel')}
          </button>

          <button
            type='button'
            disabled={isSubmitting}
            onClick={() => {
              void handleSubmit(onSubmit)()
            }}
            className='px-5 py-2 bg-[#2DD4BF] text-white rounded-md hover:bg-[#26bfac] font-bold'
          >
            {t('modal.save')}
          </button>
        </div>

      </div>
    </Transition>
  </>
  )
}

export default AddUserModal
