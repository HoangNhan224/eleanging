/* eslint-disable @typescript-eslint/explicit-function-return-type */
import React, { useState } from 'react'
import Transition from '../../utils/Transition'
import { useTranslation } from 'react-i18next'

interface AddCategoryModalProps {
  modalOpen: boolean
  onClose: () => void
  onOk: (name: string, description: string) => void
}

const AddCategoryModal: React.FC<AddCategoryModalProps> = ({ modalOpen, onClose, onOk }) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const { t } = useTranslation()

  const handleOk = () => {
    onOk(name, description)
    setName('')
    setDescription('')
    onClose()
  }

  return (
    <>
      {/* Modal backdrop */}
      <Transition
        className="fixed inset-0 bg-slate-900 bg-opacity-30 z-50 transition-opacity"
        show={modalOpen}
        enter="transition ease-out duration-200"
        enterStart="opacity-0"
        enterEnd="opacity-100"
        leave="transition ease-out duration-100"
        leaveStart="opacity-100"
        leaveEnd="opacity-0"
        aria-hidden="true"
      />
      {/* Modal dialog */}
      <Transition
        className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center px-4 sm:px-6"
        role="dialog"
        aria-modal="true"
        show={modalOpen}
        enter="transition ease-in-out duration-200"
        enterStart="opacity-0 translate-y-4"
        enterEnd="opacity-100 translate-y-0"
        leave="transition ease-in-out duration-200"
        leaveStart="opacity-100 translate-y-0"
        leaveEnd="opacity-0 translate-y-4"
      >
        <div className="bg-white rounded-lg shadow-lg max-w-xl w-full p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-slate-800">{t('modal.add_category_course')}</h2>
            <button className="text-slate-400 hover:text-slate-500" onClick={onClose}>
              <span className="sr-only">{t('modal.close')}</span>
              <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                <path d="M10 8.586L3.707 2.293a1 1 0 10-1.414 1.414L8.586 10l-6.293 6.293a1 1 0 101.414 1.414L10 11.414l6.293 6.293a1 1 0 001.414-1.414L11.414 10l6.293-6.293a1 1 0 00-1.414-1.414L10 8.586z" />
              </svg>
            </button>
          </div>

          {/* Input fields */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">{t('modal.category_name')}</label>
            <input
              type="text"
              className="w-full p-3 border rounded-md"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">{t('modal.category_description')}</label>
            <textarea
              className="w-full p-3 border rounded-md"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-2">
            <button className="px-5 py-2 bg-gray-300 rounded-md font-bold" onClick={onClose}>
              {t('modal.cancel')}
            </button>
            <button className="px-5 py-2 bg-[#2DD4BF] text-white rounded-md hover:bg-[#26bfac] font-bold" onClick={handleOk}>
              {t('modal.save')}
            </button>
          </div>
        </div>
      </Transition>
    </>
  )
}

export default AddCategoryModal
