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
import { useTranslation } from 'react-i18next'
import ArrowBackIosNewTwoToneIcon from '@mui/icons-material/ArrowBackIosNewTwoTone'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import NoteAltIcon from '@mui/icons-material/NoteAlt'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import TextSnippetIcon from '@mui/icons-material/TextSnippet'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import PlayCircleIcon from '@mui/icons-material/PlayCircle'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import LockIcon from '@mui/icons-material/Lock'
import QuizIcon from '@mui/icons-material/Quiz'
import { Tooltip } from '@mui/material'
import NoteModal from 'components/NoteModal'
import { set } from 'date-fns'
interface Lesson {
  id: string
  name: string
  type: string
  order: number
  lessionCategoryId: string
  locationPath: string
  description?: string
  content?: string
  partOrder?: number
}

interface Part {
  id: string
  name: string
  order: number
}

interface LessonListProps {
  isExpanded: boolean
  handleBackToCourse: () => void
  courseData: any
  completedLessonsCount: number
  totalCourses: number
  percentage: number
  theme: string
  parts: Part[]
  lessionCategories: any[]
  lessions: Lesson[][]
  courseProgress: Array<{ lessionId: string }>
  activeIndexes: number[]
  handleClick: (partOrder: number) => void
  sortedDrops: any[][]
  activeDrop: string
  isExamActive: boolean
  handleDropClick: (drop: any, partOrder: number) => void
  handleExamClick: () => void
  exam?: {
    doThisExamBefore: boolean
  }
  isDoingExam?: boolean
  setIsExpand: (value: boolean) => void
  noteModalOpen: boolean
  setNoteModalOpen: (value: boolean) => void
  isPassed?: boolean
}
const LessonList: React.FC<LessonListProps> = ({
  isExpanded,
  handleBackToCourse,
  courseData,
  completedLessonsCount,
  totalCourses,
  percentage,
  theme,
  parts,
  lessionCategories,
  lessions,
  courseProgress,
  activeIndexes,
  handleClick,
  sortedDrops,
  activeDrop,
  isExamActive,
  handleDropClick,
  handleExamClick,
  exam,
  isDoingExam,
  setIsExpand,
  noteModalOpen,
  setNoteModalOpen,
  isPassed
}) => {
  const { t } = useTranslation()
  useEffect(() => {
    if (isDoingExam) {
      setIsExpand(true)
    }
  }, [isDoingExam, setIsExpand])
  // Hàm helper để kiểm tra exam có available không
  const isExamAvailable = (exam: any) => {
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

  // Hàm kiểm tra exam có thể click được không
  const isExamClickable = () => {
    if (!courseData?.exam) return false
    
    const isAvailable = isExamAvailable(courseData.exam)
    const isProgressComplete = percentage === 100
    
    return isAvailable && isProgressComplete
  }

  return (
    <div
  className={`
    ${isDoingExam ? 'fixed top-16 right-0 bottom-0' : 'static'}
    ${isExpanded ? 'lg:w-0' : 'lg:w-3/12'} 
    transition-transform duration-500 ease-in-out 
    ${isExpanded ? 'translate-x-full pointer-events-none' : 'translate-x-0 pointer-events-auto'}
  `}
>
  <div className={`
    h-full
    lg:sticky
    lg:overflow-x-hidden 
    xl:overflow-y-auto 
    custom-scrollbar 
    lg:shrink-0
    border-t
    lg:border-t-0 
    ${!isExpanded && isDoingExam ? 'lg:border-l border-slate-200' : ''}
    lg:w-full 
    ${isDoingExam
      ? (theme === 'dark' ? 'bg-gray-900' : 'bg-white')
      : '2xl:h-[calc(100vh-120px)] xl:h-[calc(100vh-120px)] lg:h-[calc(100vh-120px)] border-1 border'}
    xl:mb-0 
    lg:mb-56 
    mb-30
    lg:w-3/12
    border-1
    border
  `}>
        <div className='items-center pt-2'>
          <div className='ml-5 flex items-center border-b-2 p-1 font-bold text-lg cursor-pointer' onClick={handleBackToCourse}>
            <ArrowBackIosNewTwoToneIcon className='font-bold' />
            <div className='ml-2'>{courseData?.name}</div>
          </div>
          <div className="mx-2 border-b-2 py-2 px-5">
            <div className="flex items-center justify-between w-full flex-nowrap">
              {/* Lesson count */}
              <div className="font-bold flex items-center text-sm whitespace-nowrap flex-shrink-0">
                <span>{completedLessonsCount}/{totalCourses}</span>
                <span className="ml-1">{t('learning.lession')}</span>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12">
                <CircularProgressbar
                  value={percentage}
                  text={`${percentage}%`}
                  background
                  backgroundPadding={4}
                  styles={buildStyles({
                    strokeLinecap: 'round',
                    textSize: '20px',
                    pathTransitionDuration: 0.5,
                    pathColor: `rgba(82, 234, 99, ${Math.max(0.6, percentage / 100)})`,
                    textColor: theme === 'dark' ? '#FFFFFF' : '#111827',
                    trailColor: theme === 'dark' ? '#4B5563' : '#E5E7EB',
                    backgroundColor: theme === 'dark' ? '#1F2937' : '#F9FAFB',
                  })}
                />
              </div>
              {/* Note Section with text always visible */}
              <div
                onClick={() => setNoteModalOpen(true)}
                className={`flex-shrink-0 cursor-pointer flex items-center ${theme === 'dark' ? 'text-white hover:text-gray-300' : 'text-gray-600 hover:text-black'}`}
              >
                <NoteAltIcon className={`text-sm sm:text-base ${theme === 'dark' ? 'text-white' : 'text-gray-400'}`} />
                <span className="ml-1 text-sm font-bold">{t('learning.note')}</span>
              </div>
            </div>
          </div>
          <div className='font-bold ml-5 py-3'>{t('course_detail.course_content')}</div>
        </div>
        {parts.map((part, partOrder) => {
          const partIndex = lessionCategories.findIndex(category => category.name === part.name)
          const completedLessonsCount = lessions[partIndex]?.filter((lession: { id: string }) => courseProgress.some(progress => progress.lessionId === lession.id)).length

          return (
            <div key={partOrder}>
              {/* <div className='bg-gray-200 font-bold flex items-center justify-between hover:bg-gray-300 transition-colors duration-200 cursor-pointer pl-6 select-none' onClick={() => handleClick(partOrder)}> */}
              <div
                className={`font-bold flex items-center justify-between transition-colors duration-200 cursor-pointer pl-6 select-none ${theme === 'dark' ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-gray-200 text-black hover:bg-gray-300'
                  }`}
                onClick={() => handleClick(partOrder)}
              >
                <div>
                  {partOrder + 1}. {part.name}<br />
                  <div className='font-thin text-sm'>{`${completedLessonsCount}/${lessions[partIndex]?.length}`}</div>
                </div>
                {activeIndexes?.includes(partOrder) ? <ExpandLessIcon className='mr-2' /> : <ExpandMoreIcon className='mr-2' />}
              </div>
              {activeIndexes?.includes(partOrder) && sortedDrops[partIndex]?.map((drop: { id: string, name: {} | null | undefined, type: string }, dropOrder: React.Key | null | undefined) => {
                if (drop) {
                  const dropIndexNumber = dropOrder
                  const dropIndexNumberValue = typeof dropIndexNumber === 'number' ? dropIndexNumber : 0

                  const isFirstLessonOfFirstPart = partOrder === 0 && dropOrder === 0
                  const isFirstLessonOfNextPart = partOrder > 0 && dropOrder === 0

                  const flattenedLessons = lessions.flat()

                  const sortedLessons = flattenedLessons
                    .map(lesson => {
                      const part = parts.find(p => p.id === lesson.lessionCategoryId)
                      return {
                        ...lesson,
                        partOrder: part ? part.order : Infinity
                      }
                    })
                    .sort((a, b) => a.partOrder - b.partOrder || a.order - b.order)

                  // Map courseProgress to sorted lessons
                  const mappedLessons = courseProgress.map(progress => {
                    const foundLesson = sortedLessons.find(lesson => {
                      return String(lesson.id) === String(progress.lessionId)
                    })
                    if (!foundLesson) {
                      console.log(`Lesson not found for id: ${progress.lessionId}`)
                    }
                    return foundLesson
                  })

                  // Find the last completed lesson id
                  const lastCompletedLessonId = mappedLessons
                    .filter(Boolean)
                    .sort((a, b) => {
                      if (!a || !b) return 0
                      return a.partOrder - b.partOrder || a.order - b.order
                    })[courseProgress.length - 1]?.id

                  const lastLessonOfPreviousPartId = sortedDrops[partOrder - 1]?.[sortedDrops[partOrder - 1]?.length - 1]?.id

                  const lastLessonOfPreviousPartCompleted = isFirstLessonOfNextPart && lastCompletedLessonId === lastLessonOfPreviousPartId
                  // gom hết lại mới check
                  const flattenedDrops = sortedDrops.flat()
                  const currentDropIndex = flattenedDrops.findIndex(drop => drop.id === sortedDrops[partOrder][dropIndexNumberValue].id)

                  const allPreviousLessonsCompleted = flattenedDrops.slice(0, currentDropIndex).every((drop: { id: string }) =>
                    courseProgress.some(progress => progress.lessionId === drop.id)
                  )

                  const completedLessonsBeforeCurrent = flattenedDrops.slice(0, currentDropIndex).filter((drop: { id: string }) =>
                    courseProgress.some(progress => progress.lessionId === drop.id)
                  ).map((drop: { name: any }) => drop.name)

                  const isAllowedToView = isFirstLessonOfFirstPart || lastLessonOfPreviousPartCompleted || allPreviousLessonsCompleted

                  return (
                    <div
                      // className={`flex p-3 transition-colors duration-200 cursor-pointer pl-7 select-none ${isAllowedToView && allPreviousLessonsCompleted ? 'opacity-100' : 'opacity-50 pointer-events-none'} ${activeDrop === drop.name ? 'bg-custom-bg-lesson hover:bg-green-500' : 'bg-white hover:bg-gray-200'}`}
                      className={`flex p-3 transition-colors duration-200 cursor-pointer pl-7 select-none ${isAllowedToView && allPreviousLessonsCompleted ? 'opacity-100' : 'opacity-50 pointer-events-none'} ${activeDrop === drop.name && !isExamActive ? (theme === 'dark' ? 'bg-custom-bg-lesson text-slate-100 hover:bg-green-500' : 'bg-custom-bg-lesson hover:bg-green-500') : (theme === 'dark' ? 'bg-gray-900 text-gray-300 hover:bg-gray-800' : 'bg-white hover:bg-gray-200')}`}

                      key={dropOrder}
                      onClick={() => {
                        if (isAllowedToView && drop && typeof drop.name === 'string') {
                          const dropIndexNumberValue = typeof dropIndexNumber === 'number' ? dropIndexNumber : 0
                          const dropWithCategoryOrder = { ...drop, order: dropIndexNumberValue, categoryOrder: partOrder, name: drop.name || '' }
                          handleDropClick(dropWithCategoryOrder, partOrder)
                        }
                      }}
                    >
                      <div className='w-11/12'>
                        {drop?.type === 'PDF' && <PictureAsPdfIcon className="mr-2 text-gray-500" />}
                        {drop?.type === 'DOC' && <TextSnippetIcon className="mr-2 text-gray-500" />}
                        {drop?.type === 'MP4' && <PlayCircleIcon className="mr-2 text-gray-500" />}
                        {drop?.name}
                      </div>
                      <div className='w-1/12 justify-end flex'>
                        {courseProgress.some(progress => progress.lessionId === drop?.id)
                          ? <CheckCircleIcon fontSize='small' className={allPreviousLessonsCompleted ? 'text-green-500' : 'text-gray-500'} />
                          : (!isAllowedToView || !allPreviousLessonsCompleted) && <LockIcon fontSize='small' className="text-gray-500" />
                        }
                      </div>
                    </div>
                  )
                } else {
                  return null
                }
              })}
            </div>
          )
        })}
        {/* Chỉ hiển thị phần "End of course" và "Final exam" khi courseData có exam */}
 {courseData?.exam && (
        <>
          <div className='flex justify-center items-center mt-5 px-2'>
            <div className='flex-grow border-b border-gray-200'></div>
            <div className='font-bold mx-3 text-center whitespace-nowrap'>
              {t('learning.end_of_course')}
            </div>
            <div className='flex-grow border-b border-gray-200'></div>
          </div>
          <div 
            onClick={isExamClickable() ? handleExamClick : undefined} 
            className={`flex p-3 transition-colors duration-200 pl-7 select-none ${
              isExamClickable() 
                ? 'opacity-100 cursor-pointer' 
                : 'opacity-50 pointer-events-none cursor-not-allowed'
            } ${
              isExamActive 
                ? (theme === 'dark' ? 'bg-custom-bg-lesson text-slate-100 hover:bg-green-500' : 'bg-custom-bg-lesson hover:bg-green-500') 
                : (theme === 'dark' ? 'bg-gray-900 text-gray-300 hover:bg-gray-800' : 'bg-white hover:bg-gray-200')
            }`}
          >
            <div className='w-11/12'>
              <QuizIcon className="mr-2 text-gray-500" />
              {t('learning.final_exam')}
              {!isExamAvailable(courseData.exam) && (
                <span className="text-xs text-gray ml-2">
                  ({t('learning.exam_not_available_yet')})
                </span>
              )}
            </div>
            <div className='w-1/12 justify-end flex'>
              {isExamClickable()
                ? (
                    isPassed
                      ? (
                      <CheckCircleIcon fontSize="small" className="text-green-500" />
                        )
                      : (
                      <CheckCircleIcon fontSize="small" className="text-gray-500" />
                        )
                  )
                : (
                  <LockIcon fontSize="small" className="text-gray-500" />
                  )}
            </div>
          </div>
        </>
 )}
      </div>
    </div>
  )
}

export default LessonList
