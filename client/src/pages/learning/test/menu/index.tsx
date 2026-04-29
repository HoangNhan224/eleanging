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
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import CountDownTimer from '../../../../pages/detail/components/timer/CountDownTimer'
import { Paper, Typography, List, Pagination } from '@mui/material'
import ProgressBar from '@ramonak/react-progress-bar'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import FlagIcon from '@mui/icons-material/Flag'
import SaveAsIcon from '@mui/icons-material/SaveAs'
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn'
interface OptionType {
  questionId: number
  page: number
}
interface MenuProps {
  examDetail: any
  exam: any
  isViewResult: boolean
  handleTimeUp: () => Promise<void>
  handleBackExam: () => void
  handleOpenSubmitModal: () => void
  progressExam: number
  userAnswers: Record<string, any>
  pageQuestion: number
  totalPageQuestion: number
  handleChangeQuestionPagination: (page: number) => void
  answerCache: React.MutableRefObject<Record<string, any>>
  flagCache: React.MutableRefObject<Record<string, any>>
  flaggedQuestions: Record<string, boolean>
  handleScrollToQuestion: (index: number) => void
  jumpToMarkQuestion: () => void
  flaggedIds: string[]
  currentFlaggedIndex: number
  theme: string
  flaggedQuestionsFromServer?: any[]
  onSelectFlaggedQuestion: (questionId: number, page: number) => void
}
const Menu: React.FC<MenuProps> = ({
  examDetail,
  exam,
  isViewResult,
  handleTimeUp,
  handleBackExam,
  handleOpenSubmitModal,
  progressExam,
  userAnswers,
  pageQuestion,
  totalPageQuestion,
  handleChangeQuestionPagination,
  answerCache,
  flagCache,
  flaggedQuestions,
  handleScrollToQuestion,
  jumpToMarkQuestion,
  flaggedIds,
  currentFlaggedIndex,
  theme,
  flaggedQuestionsFromServer,
  onSelectFlaggedQuestion
}) => {
  const { t } = useTranslation()
  const validEndTime: Date | null = useMemo(() => {
    if (examDetail?.enterTime != null && examDetail?.durationInMinute != null && examDetail?.exitTime == null) {
      const enterTime = new Date(examDetail?.enterTime)
      return new Date(enterTime.getTime() + examDetail?.durationInMinute * 60000)
    } else {
      return null
    }
  }, [examDetail])
  const displayIndex =
    (currentFlaggedIndex - 1 + (flaggedQuestionsFromServer?.length ?? 0)) % (flaggedQuestionsFromServer?.length ?? 1)
  const options: OptionType[] = (flaggedQuestionsFromServer ?? []).map((q: any, index: number) => ({
    questionId: q.questionId,
    page: q.page
  }))
  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedIndex = parseInt(e.target.value)
    if (!isNaN(selectedIndex)) {
      const selected = (flaggedQuestionsFromServer ?? [])[selectedIndex]
      onSelectFlaggedQuestion(selected.questionId, selected.page)
    }
  }
  const flaggedQuestionsMap = useMemo(() => {
    const map: Record<number, boolean> = {}

    // Add flags from flaggedQuestionsFromServer
    if (flaggedQuestionsFromServer && flaggedQuestionsFromServer.length > 0) {
      flaggedQuestionsFromServer.forEach((item) => {
        map[item.questionId] = true
      })
    }

    // Also include flags from the flaggedQuestions prop
    if (flaggedQuestions) {
      Object.keys(flaggedQuestions).forEach(id => {
        if (flaggedQuestions[id]) {
          map[Number(id)] = true
        }
      })
    }

    // And include flags from questions with isFlagged property
    if (examDetail?.questions) {
      examDetail.questions.forEach((q: any) => {
        if (q.isFlagged) {
          map[Number(q.id)] = true
        }
      })
    }

    return map
  }, [flaggedQuestionsFromServer, flaggedQuestions, examDetail?.questions])
  const formatDuration = (start: string, end: string) => {
    if (!start || !end) return ''
    const diff = new Date(end).getTime() - new Date(start).getTime()
    const seconds = Math.floor(diff / 1000)
    const hh = String(Math.floor(seconds / 3600)).padStart(2, '0')
    const mm = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0')
    const ss = String(seconds % 60).padStart(2, '0')
    return `${hh}:${mm}:${ss}`
  }
  return (
    <div className='col-span-2 rounded-lg flex-col flex space-y-5 overflow-y-auto h-screen pb-40 custom-scrollbar pt-0 p-4'>
      <div className="col-span-1 bg-white shadow rounded-lg p-4">
        <div className="mb-4 border-b pb-2 border-gray-200">
          <div className='pb-2'>
            <h3 className="text-lg font-semibold mb-2">{t('course_exam.general_info')}</h3>
            {/* <p className="text-sm text-gray-600">ID EXAM: <span className="font-bold">{exam?.id}</span></p> */}
            <p className='text-sm text-gray-600'>{t('course_exam.show_answer_label')}: <span className="font-bold">{exam?.answerVisible ? t('exam_result.common.yes') : t('exam_result.common.no')}</span></p>

            <p className="text-sm text-gray-600">{t('course_exam.exam_name')}: <span className="font-bold">{exam?.name}</span></p>
          </div>
          <div className='border-t border-gray-200 pt-2'>
            <p className="text-sm text-gray-600">{t('course_exam.time')}: <span className="font-bold">{exam?.durationInMinute} {t('course_exam.minutes')}</span></p>
            {validEndTime && (
              <CountDownTimer
                targetDate={validEndTime.getTime()}
                onTimeUp={async () => await handleTimeUp()}
              />
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 w-full">
          <button
            className={`grow basis-[140px] ${isViewResult ? 'w-full' : 'sm:w-[calc(50%-4px)] w-full'
              } bg-gray-300 hover:bg-gray-400 text-gray-800 flex space-x-3 justify-center items-center font-bold py-1 px-4 rounded`}
            onClick={handleBackExam}
          >
            <KeyboardReturnIcon />
            <span className="ml-2">{t('course_exam.back')}</span>
          </button>
          {!isViewResult && (
            <button
              className="grow basis-[140px] sm:w-[calc(50%-4px)] w-full flex space-x-3 justify-center items-center bg-custom-button-enroll hover:bg-custom-button-enroll-hover text-white font-bold py-1 px-4 rounded"
              onClick={handleOpenSubmitModal}
            >
              <SaveAsIcon />
              <div>{t('course_exam.submit')}</div>
            </button>
          )}
        </div>
        {!isViewResult && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">
              <span className='font-bold'>{t('course_exam.progress')}: </span>
              {Number(((progressExam * 100)).toFixed(2))}%
            </p>
            <div className="relative pb-4">
              <ProgressBar
                className="pb-4"
                maxCompleted={100}
                completed={Number(((progressExam ?? 0) * 100).toFixed(0))}
                bgColor="#8BBF8B"
                baseBgColor="#e9ecef"
                isLabelVisible={Number(((progressExam ?? 0) * 100).toFixed(0)) >= 5} // Hide built-in label when below 5%
                labelColor={Number(((progressExam ?? 0) * 100).toFixed(0)) < 20 ? '#000' : '#fff'}
                transitionDuration="0.5s"
                animateOnRender
                customLabelStyles={{
                  fontSize: '12px',
                  fontWeight: 'bold',
                  position: 'relative',
                  whiteSpace: 'nowrap',
                  left: Number(((progressExam ?? 0) * 100).toFixed(0)) < 20 ? 'calc(100% + 5px)' : 'auto'
                }}
              />
              {/* External label for very low percentages */}
              {Number(((progressExam ?? 0) * 100).toFixed(0)) < 5 && (
                <div
                  className="absolute text-xs font-bold text-black"
                  style={{
                    left: 'calc(1% + 10px)',
                    top: '0',
                    lineHeight: '20px' // Adjust based on your progress bar height
                  }}
                >
                  {Number(((progressExam ?? 0) * 100).toFixed(0))}%
                </div>
              )}
            </div>
          </div>
        )}
        {isViewResult && (
          <div className="mt-4 space-y-3">
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-sm text-gray-700 mb-2">
                <span className="font-bold">{t('course_exam.number_attempted')}: </span>
                {examDetail?.attempted}/{examDetail?.numberOfAttempt}
              </p>
              <p className="text-sm text-gray-700 mb-2">
                <span className="font-bold">{t('course_exam.result_of_attempt')}: </span>
                {examDetail?.attempted}
              </p>
            </div>
            <div className="mt-4 space-y-3">
              <div className="bg-gray-100 shadow rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-700 mb-1">
                    <span className="font-bold">{t('course_exam.score')}:</span>{' '}
                    {examDetail?.score || 0}
                  </p>
                  <p className="text-sm text-gray-700 mb-1">
                    <span className="font-bold">{t('course_exam.point_to_pass')}:</span>{' '}
                    {exam?.pointToPass || 0}
                  </p>
                  <p className="text-sm text-gray-700 mb-1">
                    <span className="font-bold">{t('course_exam.correct_answers')}:</span>{' '}
                    {examDetail?.numberOfCorrectAnswers || 0} / {examDetail?.totalQuestions || 0}
                  </p>
                </div>
                  <div className="w-14 h-14 relative">
                    <CircularProgressbar
                      className="w-14 h-14"
                      value={100}
                      text=""
                      styles={buildStyles({
                        strokeLinecap: 'round',
                        pathTransitionDuration: 0.5,
                        pathColor: (examDetail?.score || 0) >= (exam?.pointToPass || 0) 
                          ? '#10b981' 
                          : '#ef4444',
                        trailColor: '#d6d6d6',
                        backgroundColor: '#3e98c7'
                      })}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span 
                        className="text-xs font-bold text-center leading-none"
                        style={{ 
                          color: (examDetail?.score || 0) >= (exam?.pointToPass || 0) ? '#10b981' : '#ef4444',
                          fontSize: '10px'
                        }}
                      >
                        {(examDetail?.score || 0) >= (exam?.pointToPass || 0) 
                          ? String(t('course_exam.pass'))
                          : String(t('course_exam.fail'))
                        }
                      </span>
                    </div>
                  </div>
                  </div>
                </div>
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-sm text-gray-700 mb-2">
                <span className="font-bold">{t('course_exam.done_in')}: </span>
                {formatDuration(examDetail?.enterTime, examDetail?.exitTime)}
              </p>
              <p className="text-sm text-gray-700 mb-2">
                <span className="font-bold">{t('course_exam.time_end')}: </span>
                {new Date(examDetail?.exitTime).toLocaleTimeString()}
              </p>
            </div>
          </div>
        )}
      </div>
      <div className="col-span-1 w-full max-w-md mx-auto">
        <Paper elevation={3} className="p-2 sm:p-4 border border-gray-300 rounded-lg">
          <Typography variant="h6" className="mb-2 sm:mb-4 font-bold text-center sm:text-left">
            {t('course_exam.question_list')}
          </Typography>
          <div className="max-h-96 sm:max-h-128 overflow-y-auto p-1 sm:p-2">
            <List className="grid grid-cols-5 gap-1 sm:gap-2 p-2 sm:p-5">
              {examDetail?.questions?.map((question: any, idx: number) => {
                const isAnswered = answerCache.current[question.id] && answerCache.current[question.id] !== ''
                const isFlagged = flagCache.current[question.id] === 'true'
                const isCorrect = question.isCorrect

                const baseClass = 'rounded-lg flex items-center justify-center cursor-pointer duration-300 h-10 sm:h-14 font-bold relative overflow-hidden text-xs sm:text-base'
                let boxClass = ''

                if (isViewResult) {
                  boxClass = isCorrect
                    ? 'bg-green-100 border border-green-500 text-green-700'
                    : 'bg-red-100 border border-red-500 text-red-700'
                } else {
                  boxClass = `border border-gray-300 ${isAnswered ? 'bg-custom-button-enroll text-white' : 'bg-white hover:bg-custom-button-enroll hover:text-white'}`
                }

                return (
                  <div key={idx} className="col-span-1">
                    <div
                      onClick={() => handleScrollToQuestion(idx)}
                      className={`${baseClass} ${boxClass}`}
                    >
                      <span>{(pageQuestion - 1) * 10 + idx + 1}</span>

                      {(isFlagged && !isViewResult) && (
                        <div className="absolute right-1 top-1">
                          <FlagIcon
                            className="text-yellow-500"
                            style={{ fontSize: '16px' }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </List>
          </div>
          <div className="mt-2 sm:mt-4 flex justify-center">
            <Pagination
              count={totalPageQuestion}
              page={pageQuestion}
              onChange={(_, page) => handleChangeQuestionPagination(page)}
              size="small"
            />
          </div>
        </Paper>

        {!isViewResult && (
          <button
            onClick={jumpToMarkQuestion}
            className="mt-2 sm:mt-4 flex items-center justify-center gap-2 w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-white font-semibold py-2 sm:py-3 px-2 sm:px-4 rounded-lg shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-95 transition-all duration-200"
          >
            <span className="p-1 flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6">
              <FlagIcon />
            </span>
            <span className="text-xs sm:text-base">
              {t('course_exam.jump_to_marked_question') ?? 'Đi tới những câu đã đánh dấu'}
              {(flaggedQuestionsFromServer?.length ?? 0) > 0 &&
                ` (${displayIndex + 1}/${(flaggedQuestionsFromServer?.length ?? 0)})`}
            </span>
          </button>
        )}
      </div>
    </div>
  )
}

export default Menu
