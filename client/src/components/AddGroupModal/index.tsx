/* eslint-disable @typescript-eslint/explicit-function-return-type */
import React, { useState } from 'react'
import Transition from '../../utils/Transition'
import { useTranslation } from 'react-i18next'

/**
 * AddGroupModalProps defines the properties for the AddGroupModal component.
 *
 * @author nhan
 * @interface
 *
 * @property {boolean} modalOpen - Indicates whether the modal is open.
 * @property {() => void} onClose - Function to close the modal.
 * @property {(name: string, description: string) => Promise<boolean>} onOk - Callback to create a new group; returns true on success.
 * @property {string} [duplicateError] - Error message to display when the group name already exists.
 * @property {(error: string) => void} setDuplicateError - Setter to clear or update the duplicate-name error.
 */
interface AddGroupModalProps {
  modalOpen: boolean
  onClose: () => void
  onOk: (name: string, description: string) => Promise<boolean>
  duplicateError?: string
  setDuplicateError: (error: string) => void
}

/**
 * AddGroupModal component allows users to create a new group.
 * Renders an animated modal dialog with name and description inputs,
 * and performs client-side validation before invoking the onOk callback.
 *
 * @author nhan
 * @component
 * @param {AddGroupModalProps} props - Component props.
 * @returns {JSX.Element} The rendered AddGroupModal component.
 *
 * @property {string} name - Group name input value.
 * @property {string} description - Group description input value.
 * @property {string} nameError - Validation error message for the group name field.
 */
const AddGroupModal: React.FC<AddGroupModalProps> = ({ modalOpen, onClose, onOk, duplicateError, setDuplicateError }) => {
  // Store the current value of the group name input field
  const [name, setName] = useState('')

  // Store the current value of the group description input field
  const [description, setDescription] = useState('')

  // Store the validation error message shown below the name input
  const [nameError, setNameError] = useState('')

  const { t } = useTranslation()

  /**
   * Validates the form inputs and triggers group creation if all checks pass.
   * Shows an inline error message and aborts if validation fails.
   * Resets the form and closes the modal after a successful submission.
   *
   * @author nhan
   * @async
   * @returns {Promise<void>}
   */
  const handleOk = async () => {
    // TODO Reject an empty group name before proceeding
    if (name.trim() === '') {
      setNameError(t('group_management.name_required').toString())
      return
    }

    // TODO Enforce the minimum name length of 1 character
    if (name.trim().length < 1) {
      setNameError(t('group_management.groupMinLength').toString())
      return
    }

    // TODO Clear any existing validation error before submitting
    setNameError('')

    // TODO Invoke the parent's create-group callback
    const success = await onOk(name, description)

    // TODO Only reset the form and close the modal when creation succeeds
    if (success) {
      setName('')
      setDescription('')
      onClose()
    }
  }

  /**
   * Resets all form fields and validation errors, then closes the modal.
   *
   * @author nhan
   * @returns {void}
   */
  const handleClose = () => {
    // TODO Reset all modal form state so stale values do not appear on the next open
    setName('')
    setDescription('')
    setNameError('')
    onClose()
  }

  return (
    <>
      {/* Modal backdrop — covers the entire screen with a semi-transparent overlay */}
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

      {/* Modal dialog — centered card that slides up on enter and down on leave */}
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

          {/* Modal header — title on the left, close button on the right */}
          <div className='flex justify-between items-center mb-4'>
            <h2 className='text-lg font-semibold text-slate-800'>
              {t('group_management.add_title')}
            </h2>
            <button className='text-slate-400 hover:text-slate-500' onClick={handleClose}>
              <span className='sr-only'>{t('modal.close')}</span>
              <svg className='w-5 h-5 fill-current' viewBox='0 0 20 20'>
                <path d='M10 8.586L3.707 2.293a1 1 0 10-1.414 1.414L8.586 10l-6.293 6.293a1 1 0 101.414 1.414L10 11.414l6.293 6.293a1 1 0 001.414-1.414L11.414 10l6.293-6.293a1 1 0 00-1.414-1.414L10 8.586z' />
              </svg>
            </button>
          </div>

          {/* Name input field — required; shows a red border and error message when validation fails */}
          <div className='mb-4'>
            <label className='block text-sm font-medium text-gray-700'>
              {t('group_management.name')} <span className='text-red-500'>*</span>
            </label>
            <input
              type='text'
              className={`w-full p-3 border rounded-md ${nameError !== '' || duplicateError !== '' ? 'border-red-500' : ''}`}
              value={name}
              onChange={(e) => {
                // TODO Update the name state and clear the validation error as soon as the user types
                setName(e.target.value)
                if (e.target.value.trim() !== '') {
                  setNameError('')
                }
                if (duplicateError !== '') {
                  setDuplicateError('')
                }
              }}
            />
            {/* Show the inline validation error only when nameError or duplicateError is non-empty */}
            {(nameError !== '' || duplicateError !== '') && (
              <p className='text-red-500 text-xs mt-1'>
                {nameError !== '' ? nameError : duplicateError}
              </p>
            )}
          </div>

          {/* Description input field — optional, no validation required */}
          <div className='mb-4'>
            <label className='block text-sm font-medium text-gray-700'>
              {t('group_management.description')}
            </label>
            <textarea
              className='w-full p-3 border rounded-md'
              value={description}
              // TODO Update the description state on every keystroke
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Action buttons — Cancel resets and closes; Save validates then creates the group */}
          <div className='flex justify-end space-x-2'>
            <button className='px-5 py-2 bg-gray-300 rounded-md font-bold' onClick={handleClose}>
              {t('modal.cancel')}
            </button>
            <button
              className='px-5 py-2 bg-[#2DD4BF] text-white rounded-md hover:bg-[#26bfac] font-bold'
              onClick={() => {
                void handleOk()
              }}
            >
              {t('modal.save')}
            </button>
          </div>
        </div>
      </Transition>
    </>
  )
}

export default AddGroupModal
