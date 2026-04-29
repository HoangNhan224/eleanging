/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import React, { useState } from 'react'
import Select from 'react-select'
import Transition from '../../utils/Transition'
import { useTranslation } from 'react-i18next'

// interface Course {
//   id: number
//   name: string
// }

interface AddCategoryLessonModalProps {
  modalOpen: boolean
  onClose: () => void
  onOk: (name: string, courseId: number) => void
  courses: any
}

const AddCategoryLessonModal: React.FC<AddCategoryLessonModalProps> = ({ modalOpen, onClose, onOk, courses }) => {
  const { t } = useTranslation()

  const [name, setName] = useState('')
  const [selectedCourse, setSelectedCourse] = useState<{ value: number, label: string } | null>(null)
  const [errors, setErrors] = useState<{ name?: string, course?: string }>({})

  const handleOk = () => {
    const validationErrors: { name?: string, course?: string } = {}
    if (!name.trim()) validationErrors.name = t('category_lesson_admin.category_name_required').toString()
    if (selectedCourse == null) validationErrors.course = t('category_lesson_admin.course_required').toString()

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    if (selectedCourse) {
      onOk(name, selectedCourse.value)
    }
    setName('')
    setSelectedCourse(null)
    setErrors({})
    onClose()
  }

  return (
    <>
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
        <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-slate-800">{t('modal.add_category_lesson')}</h2>
            <button className="text-slate-400 hover:text-slate-500" onClick={onClose}>
              <span className="sr-only">{t('modal.close')}</span>
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M10 8.586L3.707 2.293a1 1 0 10-1.414 1.414L8.586 10l-6.293 6.293a1 1 0 101.414 1.414L10 11.414l6.293 6.293a1 1 0 001.414-1.414L11.414 10l6.293-6.293a1 1 0 00-1.414-1.414L10 8.586z" />
              </svg>
            </button>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">{t('modal.category_name')}</label>
            <input
              type="text"
              className={`w-full p-2 border rounded-md ${errors.name ? 'border-red-500' : ''}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">{t('modal.course')}</label>
            <Select
              options={courses.map((course: { id: any, name: any }) => ({ value: course.id, label: course.name }))}
              value={selectedCourse}
              onChange={setSelectedCourse}
              className={errors.course ? 'border-red-500' : ''}
            />
            {errors.course && <p className="text-red-500 text-sm mt-1">{errors.course}</p>}
          </div>

          <div className="flex justify-end space-x-2">
            <button className="px-4 py-2 bg-gray-300 rounded-md font-bold" onClick={onClose}>
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

export default AddCategoryLessonModal
