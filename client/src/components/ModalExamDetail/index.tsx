/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import React, { useRef, useEffect } from 'react'
import Transition from '../../utils/Transition'
import { useTranslation } from 'react-i18next'

interface Exam {
  id: string
  name: string
  creatorName: string
  creatorAVT?: string
  publicDate?: string
  durationInMinute: number
  pointToPass: number
  numberOfAttempt: number
  attempted: number
  image?: string
  description?: string
}

interface Props {
  exam: Exam | null
  modalOpen: boolean
  setModalOpen: (value: boolean) => void
}

const ModalExamDetail = ({ exam, modalOpen, setModalOpen }: Props) => {
  const modalRef = useRef<HTMLDivElement>(null)
  const { t } = useTranslation()
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setModalOpen(false)
      }
    }

    if (modalOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [modalOpen, setModalOpen])

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
        className="fixed inset-0 z-50 overflow-hidden flex items-center my-4 justify-center px-4 sm:px-6"
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
        <div ref={modalRef} className="bg-white rounded shadow-lg overflow-auto max-w-2xl w-full max-h-full p-6">
          <div className="p-5">
            {/* Modal header */}
            <div className="mb-2 flex justify-between items-center">

            <div className='font-bold text-lg'>{t('modal_exam_detail.exam_detail')}</div>
            <button className="text-slate-400 hover:text-slate-500" onClick={() => setModalOpen(false)}>
                <svg className="w-4 h-4 fill-current">
                  <path d="M7.95 6.536l4.242-4.243a1 1 0 111.415 1.414L9.364 7.95l4.243 4.242a1 1 0 11-1.415 1.415L7.95 9.364l-4.243 4.243a1 1 0 01-1.414-1.415L6.536 7.95 2.293 3.707a1 1 0 011.414-1.414L7.95 6.536z" />
                </svg>
              </button>
              </div>
            <hr className="my-2 border-t border-gray-300" />
            <div className="mb-2 flex justify-between items-center">
              <div className="font-semibold text-slate-800">
                {exam?.name || t('modal_exam_detail.exam_info_default')}
              </div>
            </div>

            {/* Modal body */}
            {(exam != null)
              ? (
              <div>
                {/* Ảnh minh họa bài kiểm tra */}
                <img
                 src={exam?.image && exam.image.trim()
                   ? `${process.env.REACT_APP_API}/uploads/exams/${exam.image}`
                   : 'https://res.cloudinary.com/djlegzpte/image/upload/v1753953155/pngwing.com_n1p7ho.png'}
                  alt="Exam"
                  className="w-full h-40 object-cover rounded mb-3"
                />

                {/* Thông tin người tạo */}
                <div className="flex items-center mb-2">
                  <img
                    src={exam?.creatorAVT && exam.creatorAVT.trim()
                      ? `${process.env.REACT_APP_API}/uploads/avatars/${exam.creatorAVT}`
                      : `${process.env.REACT_APP_API}/uploads/avatars/avatardefault.png`}
                    alt="creator avatar"
                    className="w-8 h-8 rounded-full object-cover mr-2"
                  />
                  <span className="text-gray-700 text-sm">{exam.creatorName}</span>
                </div>

                {/* Mô tả bài kiểm tra */}
                <p className="text-gray-600 text-sm mb-2 whitespace-pre-line">
                  <strong>{t('group_exam.description')}:</strong> {exam.description || t('modal_exam_detail.no_description')}
                </p>

                {/* Thông tin chi tiết bài kiểm tra */}
                <p className="text-gray-600 text-sm mb-1">
                  <strong>{t('group_exam.public_date')}:</strong>{' '}
                  {exam.publicDate ? new Date(exam.publicDate).toLocaleDateString('en-GB') : t('modal_exam_detail.not_available')}
                </p>
                <p className="text-gray-600 text-sm mb-1">
                  <strong>{t('group_exam.duration')}:</strong> {exam.durationInMinute} {t('group_exam.minutes')}
                </p>
                <p className="text-gray-600 text-sm mb-1">
                  <strong>{t('group_exam.points_to_pass')}:</strong> {exam.pointToPass}
                </p>
                <p className="text-gray-600 text-sm mb-1">
                  <strong>{t('group_exam.number_of_attempts')}:</strong> {exam.numberOfAttempt}
                </p>
                <p className="text-gray-600 text-sm mb-1">
                  <strong>{t('group_exam.attempted')}:</strong> {exam.attempted}
                </p>
              </div>
                )
              : (
              <p className="text-gray-600 text-sm">{t('group_exam.no_data')}</p>
                )}
          </div>
        </div>
      </Transition>
    </>
  )
}

export default ModalExamDetail
