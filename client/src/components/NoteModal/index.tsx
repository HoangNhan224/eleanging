/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import React, { useRef, useEffect } from 'react'
import Transition from '../../utils/Transition'
import { useTranslation } from 'react-i18next'
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import QuizIcon from '@mui/icons-material/Quiz'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import InfoIcon from '@mui/icons-material/Info'

interface Props {
  modalOpen: boolean
  setModalOpen: (value: boolean) => void
}

const NoteModal = ({ modalOpen, setModalOpen }: Props) => {
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
                className="fixed inset-0 z-50 overflow-y-auto flex justify-center items-center px-4 sm:px-6"
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
                            <div className='font-bold text-xl text-blue-600 flex items-center'>
                                <InfoIcon className="mr-2" />
                                {t('learning.guide_title') ?? 'Hướng dẫn học tập'}
                            </div>
                            <button className="text-slate-400 hover:text-slate-500" onClick={() => setModalOpen(false)}>
                                <svg className="w-4 h-4 fill-current">
                                    <path d="M7.95 6.536l4.242-4.243a1 1 0 111.415 1.414L9.364 7.95l4.243 4.242a1 1 0 11-1.415 1.415L7.95 9.364l-4.243 4.243a1 1 0 01-1.414-1.415L6.536 7.95 2.293 3.707a1 1 0 011.414-1.414L7.95 6.536z" />
                                </svg>
                            </button>
                        </div>
                        <hr className="my-4 border-t border-gray-300" />

                        {/* Modal body - Hướng dẫn học tập */}
                        <div className="space-y-6">
                            {/* Giới thiệu */}
                            <div className="text-gray-700 mb-4">
                                <p>{t('learning.guide_intro') ?? 'Chào mừng bạn đến với khóa học! Dưới đây là hướng dẫn để hoàn thành các bài học và bài kiểm tra.'}</p>
                            </div>

                            {/* Bài học video */}
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <div className="flex items-start">
                                    <OndemandVideoIcon className="text-blue-500 mr-3 mt-1 flex-shrink-0" />
                                    <div>
                                        <h3 className="font-semibold text-lg text-blue-700 mb-2">{t('learning.video_lessons') ?? 'Bài học video'}</h3>
                                        <p className="text-gray-700">
                                            {t('learning.video_completion_rule') ?? 'Để đánh dấu hoàn thành một bài học video, bạn cần xem ít nhất 90% thời lượng của video.'}
                                        </p>
                                        <div className="mt-2 flex items-center">
                                            <CheckCircleIcon className="text-green-500 mr-2" />
                                            <span className="text-sm text-gray-600">{t('learning.video_completion_indicator') ?? 'Tiến độ xem sẽ được lưu tự động.'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bài học PDF */}
                            <div className="bg-green-50 p-4 rounded-lg">
                                <div className="flex items-start">
                                    <PictureAsPdfIcon className="text-red-500 mr-3 mt-1 flex-shrink-0" />
                                    <div>
                                        <h3 className="font-semibold text-lg text-green-700 mb-2">{t('learning.pdf_lessons') ?? 'Bài học PDF'}</h3>
                                        <p className="text-gray-700">
                                            {t('learning.pdf_completion_rule') ?? 'Để đánh dấu hoàn thành một bài học PDF, bạn cần cuộn xuống hết trang tài liệu.'}
                                        </p>
                                        <div className="mt-2 flex items-center">
                                            <CheckCircleIcon className="text-green-500 mr-2" />
                                            <span className="text-sm text-gray-600">{t('learning.pdf_completion_indicator') ?? 'Hệ thống sẽ tự động ghi nhận khi bạn đã đọc hết tài liệu.'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bài kiểm tra */}
                            <div className="bg-purple-50 p-4 rounded-lg">
                                <div className="flex items-start">
                                    <QuizIcon className="text-purple-500 mr-3 mt-1 flex-shrink-0" />
                                    <div>
                                        <h3 className="font-semibold text-lg text-purple-700 mb-2">{t('learning.exam_info') ?? 'Bài kiểm tra'}</h3>
                                        <p className="text-gray-700">
                                            {t('learning.exam_description') ?? 'Mỗi khóa học sẽ có một bài kiểm tra cuối khóa để đánh giá kiến thức của bạn. Bạn cần đạt điểm tối thiểu theo yêu cầu để hoàn thành khóa học.'}
                                        </p>
                                        <div className="mt-2 flex items-center">
                                            <CheckCircleIcon className="text-green-500 mr-2" />
                                            <span className="text-sm text-gray-600">{t('learning.exam_attempts') ?? 'Số lần làm bài sẽ được giới hạn tùy theo từng bài thi.'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Lưu ý chung */}
                            <div className="bg-orange-50 p-4 rounded-lg">
                                <div className="flex items-start">
                                    <InfoIcon className="text-orange-500 mr-3 mt-1 flex-shrink-0" />
                                    <div>
                                        <h3 className="font-semibold text-lg text-orange-700 mb-2">{t('learning.general_notes') ?? 'Lưu ý chung'}</h3>
                                        <ul className="list-disc pl-5 text-gray-700 space-y-1">
                                            <li>{t('learning.progress_saved') ?? 'Tiến độ học tập của bạn sẽ được lưu tự động.'}</li>
                                            <li>{t('learning.complete_all') ?? 'Để hoàn thành khóa học, bạn cần hoàn thành tất cả các bài học và vượt qua bài kiểm tra cuối khóa.'}</li>
                                            <li>{t('learning.certificate') ?? 'Chứng chỉ sẽ được cấp sau khi bạn hoàn thành toàn bộ khóa học.'}</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Transition>
        </>
  )
}

export default NoteModal
