/* eslint-disable react/jsx-no-duplicate-props */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable react/display-name */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable multiline-ternary */
/* eslint-disable operator-linebreak */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable no-irregular-whitespace */
/* eslint-disable no-unsafe-finally */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable react/no-unknown-property */
/* eslint-disable @typescript-eslint/prefer-optional-chain */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable array-callback-return */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
// import axios from 'axios'
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable-next-line no-trailing-spaces */
/* eslint-disable no-trailing-spaces */
/* eslint-disable @typescript-eslint/comma-dangle */
import React, { useEffect, useState } from 'react'
import Menu from './menu'
import Question from './question'
import { useTranslation } from 'react-i18next'
import ModalComponent from 'components/Modal'
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled'
import { PacmanLoader } from 'react-spinners'
interface TestProps {
  isDoingExam: boolean
  exam: any
  examDetail: any
  isPagination: boolean
  centerColumnRef: React.RefObject<HTMLDivElement>
  //   isOpenModalExam?: boolean
  isOpenStartNewExamModal?: boolean
  isOpenContinueOldExamModal?: boolean
  handleStartExam?: (exam: any) => void
  handleCancelModalExam?: () => void
  handleOkStartNewExamModal?: (examId: string) => Promise<void>
  handleOkContinueOldExamModal?: (examId: string) => Promise<void>
  pageQuestion: number
  isViewResult: boolean
  flaggedQuestions: Record<string, boolean>
  toggleFlag: (questionId: string) => void
  handleMultipleChoiceChange: (questionId: string, option: string) => void
  handleSingleChoiceChange: (e: React.ChangeEvent<HTMLInputElement>, questionId: string) => void
  answerCache: React.MutableRefObject<Record<string, any>>
  flagCache: React.MutableRefObject<Record<string, any>>
  userAnswers: Record<string, any>
  questionRefs: React.MutableRefObject<Array<HTMLDivElement | null>>
  questionDiscussion: Record<string, any[]>
  commentRefs: React.MutableRefObject<Record<string, HTMLTextAreaElement | null>>
  handlePostComment: (questionId: string) => Promise<void>
  handleTimeUp: () => Promise<void>
  handleBackExam: () => void
  handleOpenSubmitModal: () => void
  progressExam: number
  handleChangeQuestionPagination: (page: number) => void
  totalPageQuestion: number
  handleScrollToQuestion: (index: number) => void
  jumpToMarkQuestion: () => void
  flaggedIds: string[]
  currentFlaggedIndex: number
  theme: string
  flaggedQuestionsFromServer?: any[]
  onSelectFlaggedQuestion: (questionId: number, page: number) => void
}
const Test: React.FC<TestProps> = ({
  isDoingExam,
  exam,
  examDetail,
  isPagination,
  centerColumnRef,
  isOpenStartNewExamModal,
  isOpenContinueOldExamModal,
  handleStartExam,
  handleCancelModalExam,
  handleOkStartNewExamModal,
  handleOkContinueOldExamModal,
  pageQuestion,
  isViewResult,
  flaggedQuestions,
  toggleFlag,
  handleMultipleChoiceChange,
  handleSingleChoiceChange,
  answerCache,
  flagCache,
  userAnswers,
  questionRefs,
  questionDiscussion,
  commentRefs,
  handlePostComment,
  handleTimeUp,
  handleBackExam,
  handleOpenSubmitModal,
  progressExam,
  handleChangeQuestionPagination,
  totalPageQuestion,
  handleScrollToQuestion,
  jumpToMarkQuestion,
  flaggedIds,
  currentFlaggedIndex,
  theme,
  flaggedQuestionsFromServer,
  onSelectFlaggedQuestion
}) => {
  const { t, i18n } = useTranslation()
  const [showFullDescription, setShowFullDescription] = useState(false)
  // Hàm kiểm tra exam có available không
  const isExamAvailable = () => {
    if (!exam) return false
    
    if (exam.publicStatus !== 1) return false
    
    if (exam.publicDate) {
      const publicDate = new Date(exam.publicDate)
      const now = new Date()
      if (publicDate > now) {
        return false
      }
    }
    return true
  }
  // Hàm format ngày giờ theo ngôn ngữ hiện tại
  const formatDateTime = (dateString: string) => {
    if (!dateString) return t('course_exam.no_specific_date')
    
    const date = new Date(dateString)
    
    if (i18n.language === 'vi') {
      return date.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    } else {
      return date.toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    }
  }

  return (
  <div className={`flex flex-col items-center p-4 sm:p-8 ${!isDoingExam ? 'overflow-y-auto bg-white' : 'overflow-y-hidden bg-gray-50'}`} 
       style={{ height: !isDoingExam ? 'calc(100vh - 8rem)' : 'auto', overflowY: !isDoingExam ? 'scroll' : 'hidden' }}>
    {!isDoingExam && (
      <div className="w-full max-w-4xl">
        <div className="bg-white shadow-xl rounded-lg overflow-visible">
          <div className="bg-custom-button-enroll text-white text-lg sm:text-xl font-semibold px-4 sm:px-6 py-3 sm:py-4">
              {t('course_exam.exam_info')}
            </div>          
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 p-4 sm:p-6">
              <div className="md:col-span-1 flex justify-center">
                <img
                  src={exam?.image && exam.image.trim()
                    ? `${process.env.REACT_APP_API}/uploads/exams/${exam.image}`
                    : 'https://s3.eduquiz.io.vn/default/exam/exam-01.png'}
                  alt="exam"
                  className="w-full max-w-xs object-cover rounded-lg shadow-md"
                />
              </div>
              <div className="md:col-span-2 flex flex-col justify-between">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">{exam?.name}</h2>
                  <div className="flex items-center mb-3">
                    <img
                      src={exam?.creatorAVT && exam.creatorAVT.trim()
                        ? `${process.env.REACT_APP_API}/uploads/avatars/${exam.creatorAVT}`
                        : `${process.env.REACT_APP_API}/uploads/avatars/avatardefault.png`}
                      alt="creator avatar"
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover mr-3"
                    />
                    <span className="text-gray-700 font-medium text-sm sm:text-base">
                      <strong>{t('course_exam.exam_creater')}:</strong> {exam?.creatorName}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3 text-sm sm:text-base">
                    <strong>{t('course_exam.publicDate')}:{' '}</strong>
                    {formatDateTime(exam?.publicDate)}
                  </p>
                  <div className="flex items-center text-gray-600 mb-3 text-sm sm:text-base">
                    <AccessTimeFilledIcon className="text-gray-500 mr-2" />
                    <strong>{t('course_exam.duration')}:</strong>
                    <span className="ml-2 font-bold">{exam?.durationInMinute} {t('course_exam.minutes')}</span>
                  </div>
                  <div className="text-gray-600 mb-2 text-sm sm:text-base">
                    <strong>{t('course_exam.points_to_pass')}:</strong> <span className="font-bold">{exam?.pointToPass}</span>
                  </div>
                  <div className="text-gray-600 mb-2 text-sm sm:text-base">
                    <strong>{t('course_exam.number_of_attempts')}:</strong> {exam?.numberOfAttempt}
                  </div>
                  <div className="text-gray-600 text-sm sm:text-base">
                    <strong>{t('course_exam.number_attempted')}:</strong> {exam?.attempted === null ? t('course_exam.not_done_yet') : exam?.attempted}
                  </div>
                </div>
                <button
                  onClick={() => handleStartExam?.(exam)}
                  disabled={
                    !isExamAvailable() || 
                    (exam?.attempted !== null &&
                      exam?.attempted >= exam?.numberOfAttempt &&
                      !exam?.isUnfinished)
                  }
                  className={`mt-4 sm:mt-6 w-full sm:w-auto ${
                    !isExamAvailable() ||
                    (exam?.attempted !== null &&
                      exam?.attempted >= exam?.numberOfAttempt &&
                      !exam?.isUnfinished)
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-custom-button-enroll hover:bg-custom-button-enroll-hover'
                    } text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition-all text-sm sm:text-base`}
                >
                  {!isExamAvailable()
                    ? t('course_exam.exam_not_available')
                    : exam?.attempted !== null &&
                      exam?.attempted >= exam?.numberOfAttempt &&
                      !exam?.isUnfinished
                      ? t('course_exam.cant_do_exam')
                      : exam?.doThisExamBefore && !exam?.isUnfinished
                        ? t('course_exam.do_again')
                        : exam?.isUnfinished
                          ? t('course_exam.continue_exam')
                          : t('course_exam.start_exam')}
                </button>
              </div>
            </div>
                        <hr className="border-t border-gray-300 my-2 mx-2" />
                        <div className="p-4 sm:p-6">
                            <div className={`relative ${!showFullDescription ? 'max-h-20 overflow-hidden' : ''}`}>
                                <div className="text-sm sm:text-base text-gray-700 whitespace-pre-line">
                                    {exam?.description}
                                </div>
                                {!showFullDescription && exam?.description?.length > 150 && (
                                    <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-white to-transparent"></div>
                                )}
                            </div>
                            {exam?.description?.length > 150 && (
                                <div className="mt-3">
                                    <button
                                        onClick={() => setShowFullDescription(!showFullDescription)}
                                        className="px-3 sm:px-4 py-2 bg-green-50 hover:bg-green-100 text-[#7BAC79] rounded-md font-bold flex items-center justify-center transition-all duration-300 shadow-sm hover:shadow group text-sm sm:text-base"
                                    >
                                        {showFullDescription ? (
                                            <>
                                                {t('course_exam.show_less')}
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 ml-2 group-hover:-translate-y-1 transition-transform duration-300" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                                                </svg>
                                            </>
                                        ) : (
                                            <>
                                                {t('course_exam.show_more')}
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 ml-2 group-hover:translate-y-1 transition-transform duration-300" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                  <div>
                      <ModalComponent
                          isOpen={isOpenContinueOldExamModal ?? false}
                          title={t('course_exam.continue_exam') as string || 'Tiếp tục bài thi'}
                          description={`${t('course_exam.exam_attempt_message')} ${exam?.attempted} ${t('course_exam.time_remaining_message')}`}
                          onClose={handleCancelModalExam}
                          onCancel={handleCancelModalExam}
                          onOk={async () => await handleOkContinueOldExamModal?.(exam?.id)}
                      />
                      <ModalComponent
                          isOpen={isOpenStartNewExamModal ?? false}
                          title={t('course_exam.confirm') as string || 'Xác nhận'}
                          description={`${t('course_exam.exam_attempt_message')} ${exam?.attempted + 1} ${t('course_exam.confirm_start_message')}`}
                          onClose={handleCancelModalExam}
                          onCancel={handleCancelModalExam}
                          onOk={async () => await handleOkStartNewExamModal?.(exam?.id)}
                      />
                  </div>
                </div>
    )}
            {isDoingExam && (
                // <div className="flex items-center justify-center w-full flex-1 px-2 sm:px-0">
                <div className={`flex items-start justify-center w-full flex-1 px-2 sm:px-0 ${isDoingExam ? 'bg-gray-50' : 'bg-transparent'}`}>
                    <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 lg:gap-6 w-full h-[calc(100vh-6rem)] sm:h-[calc(100vh-8rem)]">
                        <div
                            ref={centerColumnRef}
                            className="lg:col-span-5 order-2 lg:order-1 bg-white shadow rounded-lg p-3 sm:p-6 overflow-y-auto custom-scrollbar"
                        >
                            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">{t('course_exam.main_content')}</h2>

                            {isPagination ? (
                                <div className="flex justify-center items-center w-full h-64 sm:h-96">
                                    <PacmanLoader
                                        color='#5EEAD4'
                                        cssOverride={{
                                          display: 'block',
                                          margin: '0 auto',
                                          borderColor: 'blue'
                                        }}
                                        loading
                                        margin={10}
                                        speedMultiplier={3}
                                        size={30}
                                    />
                                </div>
                            ) : (
                                <div className="text-gray-700 text-sm sm:text-base pb-20">
                                    {examDetail?.questions?.map((question: any, index: any) => (
                                        <Question
                                            key={question.id}
                                            question={question}
                                            index={index}
                                            exam={exam}
                                            pageQuestion={pageQuestion}
                                            isViewResult={isViewResult}
                                            flaggedQuestions={flaggedQuestions}
                                            toggleFlag={toggleFlag}
                                            handleMultipleChoiceChange={handleMultipleChoiceChange}
                                            handleSingleChoiceChange={handleSingleChoiceChange}
                                            answerCache={answerCache}
                                            flagCache={flagCache}
                                            userAnswers={userAnswers}
                                            questionRefs={questionRefs}
                                            questionDiscussion={questionDiscussion}
                                            commentRefs={commentRefs}
                                            handlePostComment={handlePostComment}
                                        />
                                    ))}
                                    {pageQuestion === totalPageQuestion && (
                                        <div className='flex justify-center items-center mt-5 flex-wrap'>
                                            <div className='flex-1 min-w-0 border-b border-gray-200'></div>
                                            <div className='font-bold mx-3 text-lg sm:text-2xl text-center whitespace-nowrap'>{t('course_exam.end')}</div>
                                            <div className='flex-1 min-w-0 border-b border-gray-200'></div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className='lg:col-span-2 order-1 lg:order-2 rounded-lg flex flex-col space-y-3 sm:space-y-5 px-3 sm:px-6 pb-3 sm:pb-6 overflow-y-auto custom-scrollbar max-h-[40vh] lg:max-h-none'>
                            <Menu
                                examDetail={examDetail}
                                exam={exam}
                                isViewResult={isViewResult}
                                handleTimeUp={handleTimeUp}
                                handleBackExam={handleBackExam}
                                handleOpenSubmitModal={handleOpenSubmitModal}
                                progressExam={progressExam}
                                userAnswers={userAnswers}
                                pageQuestion={pageQuestion}
                                totalPageQuestion={totalPageQuestion}
                                handleChangeQuestionPagination={handleChangeQuestionPagination}
                                answerCache={answerCache}
                                flagCache={flagCache}
                                flaggedQuestions={flaggedQuestions}
                                handleScrollToQuestion={handleScrollToQuestion}
                                jumpToMarkQuestion={jumpToMarkQuestion}
                                flaggedIds={flaggedIds}
                                currentFlaggedIndex={currentFlaggedIndex}
                                theme={theme}
                                flaggedQuestionsFromServer={flaggedQuestionsFromServer}
                                onSelectFlaggedQuestion={onSelectFlaggedQuestion}
                            />
                        </div>
                    </div>
                </div>
            )}

            {!isDoingExam && (
                <div className="h-20 sm:h-36 w-full flex-shrink-0"></div>
            )}
        </div>
  )
}

export default Test
