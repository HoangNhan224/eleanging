/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/prefer-optional-chain */
/* eslint-disable multiline-ternary */
/* eslint-disable @typescript-eslint/member-delimiter-style */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useMemo, useState } from 'react'
import Select from 'react-select'
import { format, set } from 'date-fns'
import { toast } from 'react-toastify'
import { commentOnQuestion, getCourse, getCourseAndGroupExam, getCourseExam, getDetailExams, getGroup, getGroupExam, getQuestionDiscussion } from 'api/post/post.api'
import { useTheme } from 'services/styled-themes'
import { useTranslation } from 'react-i18next'
import SendIcon from '@mui/icons-material/Send'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import { FormControl, RadioGroup, FormControlLabel, Radio, FormGroup, Checkbox, Collapse, Pagination } from '@mui/material'
import InfoIcon from '@mui/icons-material/Info'
import { PacmanLoader } from 'react-spinners'
import QuillShow from '../../components/QuillEditor'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { useDatePickerLocale } from '../../hooks/useDatePickerLocale'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
const ResultHistory = () => {
  const { t, i18n } = useTranslation()
  const { locale, dateFormat, formatDateForAPI } = useDatePickerLocale()
  const [isExplanationExpanded, setIsExplanationExpanded] = useState(false)
  const { theme } = useTheme()
  const [listExam, setListExam] = useState<any[]>([])
  const [selectedExam, setSelectedExam] = useState<{
    [x: string]: any; id: string; name: string; timeStart: string
  } | null>(null)
  const [selectedResult, setSelectedResult] = useState<any | null>(null)
  const [filterType, setFilterType] = useState('all')
  const [dateFrom, setDateFrom] = useState<Date | null>(null)
  const [dateTo, setDateTo] = useState<Date | null>(null)
  const [courses, setCourses] = useState([])
  const [groups, setGroups] = useState([])
  const [selectedCourse, setSelectedCourse] = useState<{ value: string; label: string } | null>({ value: 'all', label: t('exam_result.all') as string })
  const [selectedGroup, setSelectedGroup] = useState<{ value: string; label: string } | null>({ value: 'all', label: t('exam_result.all') as string })
  const [questionDiscussion, setQuestionDiscussion] = useState<any>(null)
  const [newComments, setNewComments] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await getCourse()
        if (response.data) {
          setCourses(response.data.map((course: any) => ({ value: course.id, label: course.name })))
        }
      } catch (error) {
        // toast.error(t('exam_result.error_fetch_course'))
      }
    }
    fetchCourses()
  }, [])
  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const response = await getGroup()
        if (response.data) {
          setGroups(response.data.map((group: any) => ({ value: group.id, label: group.name })))
        }
      } catch (error) {
        // toast.error(t('exam_result.error_fetch_course'))
      }
    }
    fetchGroup()
  }, [])

  const fetchData = async () => {
    try {
      let exams = []

      const dateFromStr = formatDateForAPI(dateFrom)?.toISOString().split('T')[0] || ''
      const dateToStr = formatDateForAPI(dateTo)?.toISOString().split('T')[0] || ''

      if (filterType === 'course' && selectedCourse?.value) {
        const response = await getCourseExam(selectedCourse.value, searchTerm, dateFromStr, dateToStr)
        if (response.data) {
          exams = response.data
        }
      } else if (filterType === 'group' && selectedGroup?.value) {
        const response = await getGroupExam(selectedGroup.value, searchTerm, dateFromStr, dateToStr)
        if (response.data) {
          exams = response.data
        }
      } else if (filterType === 'all') {
        const response = await getCourseAndGroupExam(searchTerm, dateFromStr, dateToStr)
        if (response.data) {
          exams = response.data
        }
      }
      setListExam(exams)
    } catch (error) {
    // toast.error(t('exam_result.error_fetch_exam'))
    }
  }
  useEffect(() => {
    fetchData()
  }, [])

  const handleFilter = () => {
    fetchData()
  }
  const [pageQuestion, setPageQuestion] = useState(1)

  useEffect(() => {
    const fetchResult = async () => {
      try {
        setIsLoading(true)
        if (selectedExam) {
          const response = await getDetailExams({
            id: selectedExam.id,
            status: 'view',
            attempt: selectedExam.attempt,
            page: pageQuestion,
            limit: 10
          })
          if (response.data) {
            setSelectedResult(response.data)
          }
        }
      } catch (error) {
        // toast.error(t('exam_result.error_fetch_course'))
      } finally {
        setIsLoading(false)
      }
    }
    fetchResult()
  }, [selectedExam, pageQuestion])
  const handleChangeQuestionPagination = (value: number) => {
    setPageQuestion(value)
  }
  const pageSize = 10

  const totalPageQuestion = useMemo(() => {
    const totalRecord = selectedResult?.totalQuestions
    return Math.ceil(totalRecord / pageSize)
  }, [selectedResult])
  useEffect(() => {
    const fetComment = async () => {
      try {
        const questionIds = selectedResult?.questions?.map((question: any) => question.id) || []
        questionIds.forEach(async (questionId: any) => {
          const response = await getQuestionDiscussion({ id: questionId })
          if (response) {
            setQuestionDiscussion((prev: any) => ({
              ...prev,
              [questionId]: response.data
            }))
          }
        })
      } catch (error) {
        // toast.error(t('exam_result.error_fetch_exam'))
      }
    }

    fetComment()
  }, [selectedResult])
  const formatDuration = (start: string, end: string) => {
    if (!start || !end) return ''
    const diff = new Date(end).getTime() - new Date(start).getTime()
    const seconds = Math.floor(diff / 1000)
    const hh = String(Math.floor(seconds / 3600)).padStart(2, '0')
    const mm = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0')
    const ss = String(seconds % 60).padStart(2, '0')
    return `${hh}:${mm}:${ss}`
  }
  const handleCommentChange = (questionId: string, value: string) => {
    setNewComments((prev) => ({ ...prev, [questionId]: value }))
  }
  const handlePostComment = async (questionId: string) => {
    const commentContent = newComments[questionId]
    if (!commentContent) return
    if (!selectedExam?.id) return
    try {
      const payload = {
        comment: commentContent,
        examId: selectedExam.id
      }
      const response = await commentOnQuestion(questionId, payload)
      if (response.data) {
        setQuestionDiscussion((prev: any) => ({
          ...prev,
          [questionId]: [...(prev[questionId] || []), response.data]
        }))
        setNewComments((prev: any) => ({ ...prev, [questionId]: '' }))
      }
    } catch (error) {
      // console.error('Lỗi khi gửi bình luận:', error)
      toast.error(t('exam_result.error_post_comment'))
    }
  }

  const handleDateFromChange = (date: Date | null) => {
    setDateFrom(date)
  }

  const handleDateToChange = (date: Date | null) => {
    setDateTo(date)
  }

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <div className="w-11/12 mx-auto bg-white p-6 shadow rounded-lg">
        <h2 className="text-2xl font-bold text-green-600 text-center mb-4">{t('exam_result.exam_history')}</h2>

        <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">🔍 {t('exam_result.filter')}</h3>
          <div className="p-4 bg-white shadow-md rounded-lg">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Bộ lọc loại */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">{t('exam_result.type')}</label>
                <Select
                  className="w-full"
                  options={[
                    { value: 'all', label: t('exam_result.all') as string },
                    { value: 'course', label: t('exam_result.course') as string },
                    { value: 'group', label: t('exam_result.group') as string }
                  ]}
                  value={{
                    value: filterType,
                    label:
                      filterType === 'course'
                        ? t('exam_result.course')
                        : filterType === 'group'
                          ? t('exam_result.group')
                          : t('exam_result.all')
                  }}
                  onChange={(selected) => setFilterType(selected?.value || 'all')}
                />
              </div>

              {/* Ô tìm kiếm */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">{t('exam_result.search')}</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                  placeholder={`🔎 ${t('exam_result.enter_exam_name')}`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleFilter()
                    }
                  }}
                />
              </div>

              {/* Bộ lọc khóa học hoặc nhóm */}
              {filterType === 'course' && (
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">{t('exam_result.course')}</label>
                  <Select
                    className="w-full"
                    options={[{ value: 'all', label: t('exam_result.all') as string }, ...courses]}
                    value={selectedCourse || { value: 'all', label: t('exam_result.all') }}
                    onChange={(selected) =>
                      setSelectedCourse(selected?.value === 'all' ? { value: 'all', label: t('exam_result.all') } : selected)
                    }
                    placeholder={t('exam_result.select_course') as string}
                  />
                </div>
              )}
              {filterType === 'group' && (
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">{t('exam_result.group')}</label>
                  <Select
                    className="w-full"
                    options={[{ value: 'all', label: t('exam_result.all') as string }, ...groups]}
                    value={selectedGroup || { value: 'all', label: t('exam_result.all') }}
                    onChange={(selected) =>
                      setSelectedGroup(selected?.value === 'all' ? { value: 'all', label: t('exam_result.all') } : selected)
                    }
                    placeholder={t('exam_result.select_group') as string}
                  />
                </div>
              )}
              {/* Chọn ngày */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">{t('exam_result.from')}</label>
                <div className="relative">
                  <DatePicker
                    key={`dateFrom-${i18n.language}`}
                    selected={dateFrom}
                    onChange={handleDateFromChange}
                    dateFormat={dateFormat}
                    locale={locale}
                    placeholderText={t('picker.placeholder_public_date_text') ?? ''}
                    className='w-full text-gray-700 border rounded-md py-2 pl-2 pr-10 bg-white'
                    wrapperClassName="w-full"
                  >
                    <div className="flex justify-between w-full px-3 py-2 border-t">
                      <button
                        type="button"
                        className="text-blue-600 hover:text-blue-800"
                        onClick={() => {
                          handleDateFromChange(null)
                        }}
                      >
                        {t('picker.clear')}
                      </button>
                      <button
                        type="button"
                        className="text-blue-600 hover:text-blue-800 font-bold"
                        onClick={() => {
                          const today = new Date()
                          today.setHours(0, 0, 0, 0)
                          handleDateFromChange(today)
                        }}
                      >
                        {t('picker.today')}
                      </button>
                    </div>
                  </DatePicker>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <CalendarMonthIcon className="text-gray-400 w-4 h-4" />
                  </div>
                </div>
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">{t('exam_result.to')}</label>
                <div className="relative">
                  <DatePicker
                    key={`dateTo-${i18n.language}`}
                    selected={dateTo}
                    onChange={handleDateToChange}
                    dateFormat={dateFormat}
                    locale={locale}
                    placeholderText={t('picker.placeholder_public_date_text') ?? ''}
                    className='w-full text-gray-700 border rounded-md py-2 pl-2 pr-10 bg-white'
                    wrapperClassName="w-full"
                  >
                    <div className="flex justify-between w-full px-3 py-2 border-t">
                      <button
                        type="button"
                        className="text-blue-600 hover:text-blue-800"
                        onClick={() => {
                          handleDateToChange(null)
                        }}
                      >
                        {t('picker.clear')}
                      </button>
                      <button
                        type="button"
                        className="text-blue-600 hover:text-blue-800 font-bold"
                        onClick={() => {
                          const today = new Date()
                          today.setHours(0, 0, 0, 0)
                          handleDateToChange(today)
                        }}
                      >
                        {t('picker.today')}
                      </button>
                    </div>
                  </DatePicker>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <CalendarMonthIcon className="text-gray-400 w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Nút Tìm */}
              <div className='flex items-end'>
                <button
                  type='submit'
                  className={`bg-custom-button-control hover:bg-custom-button-control-hover w-3/4 h-3/4 items-end justify-end rounded-md font-bold px-7 sm:px-4 transition duration-200 ${theme === 'dark' ? 'text-black' : 'text-white'}`}
                  onClick={handleFilter}
                >
                  {t('exam_result.search')}
                </button>
              </div>
            </div>
          </div>

        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg shadow-md overflow-auto max-h-[70vh]">
            {/* Hiển thị số lượng bài thi */}
            <div className="flex justify-between items-center mb-4">
              <div className="text-lg font-semibold text-gray-700">
                📜 {t('exam_result.list_exam')}
              </div>
              <div className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-semibold">
                {t('exam_result.total')}: {listExam.length}
              </div>
            </div>
            {listExam.length > 0 ? (
              listExam.map((exam) => {
                const isSelected = selectedExam && selectedExam.id === exam.id && selectedExam.attempt === exam.attempt
                const isPass = exam.score >= exam.pointToPass

                return (
                  <button
                    key={`${exam.id}-${exam.attempt}`}
                    className={`block w-full text-left p-4 border rounded-lg mb-3 transition-all
                    ${isSelected
                      ? isPass
                        ? 'bg-green-600 text-white shadow-lg border-green-700'
                        : 'bg-red-500 text-white shadow-lg border-red-700'
                      : isPass
                        ? 'bg-white border border-green-500 text-green-700 hover:bg-green-50'
                        : 'bg-white border border-red-500 text-red-700 hover:bg-red-50'
                    }`}
                    onClick={() => {
                      setSelectedExam(exam)
                      setPageQuestion(1)
                    }}
                  >
                    <div className='flex items-center justify-between'>
                      <div className="font-semibold text-lg">{exam.name}</div>
                      <div className={`mt-1 text-lg font-semibold flex items-center gap-1
                        ${isPass ? 'text-green-600' : 'text-red-500'} ${isSelected ? 'text-white' : ''}`}>
                        {isPass ? '✅' : '❌'}
                      </div>
                    </div>

                    <div className={`mt-1 text-sm ${isSelected ? 'font-semibold text-white' : 'font-medium text-gray-500'}`}>
                      🔄 {t('exam_result.time')} {exam.attempt}
                    </div>

                    <div className={`mt-1 text-sm ${isSelected ? 'font-semibold text-white' : 'font-medium text-gray-500'}`}>
                      📘 {t('exam_result.type')}: {exam.courseId ? t('exam_result.course') : t('exam_result.group')}
                    </div>
                  </button>
                )
              })
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-500 mt-6">
                <div className="text-4xl">📭</div>
                <p className="mt-2 text-lg font-medium">{t('exam_result.doesnt_have_result')}</p>
              </div>
            )}

          </div>

          <div className="md:col-span-2 p-4 bg-gray-100 space-y-4 overflow-auto max-h-[70vh] rounded-md">
            {isLoading ? (
              <div className="flex justify-center items-center w-full h-140 mt-20">
                <PacmanLoader
                  className='flex justify-center items-center w-full mt-20'
                  color='#5EEAD4'
                  cssOverride={{
                    display: 'block',
                    margin: '0 auto',
                    borderColor: 'blue'
                  }}
                  loading
                  margin={10}
                  speedMultiplier={3}
                  size={40}
                /></div>
            ) : selectedResult ? (
              <div className='space-y-4'>
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                  <h3 className="text-2xl font-semibold text-green-700 mb-4 flex items-center">
                    📊 {t('exam_result.exam_result')}
                  </h3>

                  <div className="space-y-2 text-lg">
                    <p className="flex items-center">
                      ✅ <span className="ml-2">{t('exam_result.points_to_pass')}:</span>
                      <strong className="ml-2">{selectedResult.pointToPass}</strong>
                    </p>

                    <p className="flex items-center">
                      👁️ <span className="ml-2">{t('exam_result.show_answer')}:</span>
                      <strong className="ml-2">
                        {selectedResult.answerVisible ? t('exam_result.common.yes') : t('exam_result.common.no')}
                      </strong>
                    </p>

                    <p className="flex items-center">
                      📝 <span className="ml-2">{t('exam_result.score')}:</span>
                      <strong className="ml-2 text-red-600">{selectedResult.score}</strong>
                    </p>

                    <p className="flex items-center">
                      ⏱️ <span className="ml-2">{t('exam_result.done_in')}:</span>
                      <strong className="ml-2 text-gray-700">
                        {formatDuration(selectedResult?.enterTime, selectedResult?.exitTime)}
                      </strong>
                    </p>
                  </div>
                  {selectedResult.attempted && (
                    <div className="mt-4 p-4 bg-gray-100 rounded-lg border-l-4 border-blue-500">
                      <h4 className="text-lg font-semibold text-blue-600">{t('exam_result.attempt')}: <span className='text-gray-700 font-medium'>{selectedResult.attempted}</span></h4>
                    </div>
                  )}

                  {selectedResult.description && (
                    <div className="mt-4 p-4 bg-gray-100 rounded-lg border-l-4 border-gray-400">
                      <h4 className="text-lg font-semibold text-gray-700">{t('exam_result.description')}:</h4>
                      <p className="text-gray-600">{selectedResult.description}</p>
                    </div>
                  )}
                </div>

                <div className='bg-white p-6 rounded-lg shadow'>
                  <div className='text-xl font-bold text-green-600 mb-4'>{t('exam_result.exam_detail')}</div>
                  {selectedResult?.questions?.map((question: any, index: number) => {
                    const correctAnswers = question?.correctAnswer?.split('::') || []
                    const userAnswers = question?.userAnswer?.split('::') || []
                    return (
                      <div
                        key={question?.id}
                        className={`p-4 shadow-2xl rounded-lg mb-4 ${question.isCorrect ? 'bg-green-100 border border-green-500' : 'bg-red-50 border border-red-500'
                          }`}
                      >
                        {/* Header */}
                        <div className="flex justify-between items-center">
                          <h2 className="text-xl font-semibold mb-2">
                            {question.isCorrect ? '✅' : '❌'}
                            <span className="ml-2">{t('course_exam.question')} {(pageQuestion - 1) * 10 + index + 1}:</span>
                          </h2>
                          <div className="text-sm mb-1 text-gray-400 font-bold">
                            {question.type === 'MULTIPLE_CHOICE'
                              ? t('course_exam.multiple_choice')
                              : question.type === 'SINGLE_CHOICE'
                                ? t('course_exam.single_choice')
                                : question.type}
                          </div>
                        </div>

                        {/* Question Title */}
                        <div
                          className="font-bold select-none mb-4"
                          onCopy={(e) => e.preventDefault()}
                          onContextMenu={(e) => e.preventDefault()}
                        >
                          <QuillShow htmlContent={question?.title || ''} />
                        </div>

                        {/* Question Options */}
                        <div className="mt-4">
                          {question.type === 'MULTIPLE_CHOICE' ? (
                            <FormControl component="fieldset" className="w-full">
                              <FormGroup className="w-full">
                                {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p'].map((option) =>
                                  question[option] != null && question[option] !== ''
                                    ? (
                                      <FormControlLabel
                                        key={option}
                                        className="duration-75"
                                        sx={{
                                          width: '100%'
                                        }}
                                        control={
                                          <Checkbox
                                            name={`question-${question.id}`}
                                            disabled={true}
                                            color="primary"
                                            size="medium"
                                            checked={userAnswers.includes(option)}
                                          />
                                        }
                                        label={(
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                              <span className="font-bold uppercase mr-2">{option}.</span>
                                              <QuillShow htmlContent={question[option] || ''} />
                                            </div>
                                            {/* Answer status indicators */}
                                            {selectedResult.answerVisible
                                              ? (
                                                <>
                                                  {correctAnswers.includes(option) && (
                                                    <span className="ml-2 text-green-500 font-bold">✔</span>
                                                  )}
                                                  {userAnswers.includes(option) && !correctAnswers.includes(option) && (
                                                    <span className="ml-2 text-red-500 font-bold">✖</span>
                                                  )}
                                                </>
                                                )
                                              : (
                                                <>
                                                  {userAnswers.includes(option) && correctAnswers.includes(option) && (
                                                    <span className="ml-2 text-green-500 font-bold">✔</span>
                                                  )}
                                                  {userAnswers.includes(option) && !correctAnswers.includes(option) && (
                                                    <span className="ml-2 text-red-500 font-bold">✖</span>
                                                  )}
                                                </>
                                                )
                                            }
                                          </div>
                                        )}
                                      />
                                      )
                                    : null
                                )}
                              </FormGroup>
                            </FormControl>
                          ) : question.type === 'SINGLE_CHOICE' ? (
                            <FormControl component="fieldset" className="w-full">
                              <RadioGroup className="w-full" name={`question-${question.id}`}>
                                {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p'].map((option) =>
                                  question[option]
                                    ? (
                                      <FormControlLabel
                                        disabled={true}
                                        key={option}
                                        value={option}
                                        sx={{
                                          width: '100%'
                                        }}
                                        control={<Radio color="primary" size="medium" checked={userAnswers.includes(option)} />}
                                        label={(
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                              <span className="font-bold uppercase mr-2">{option}.</span>
                                              <QuillShow htmlContent={question[option] || ''} />
                                            </div>
                                            {/* Answer status indicators */}
                                            {selectedResult.answerVisible
                                              ? (
                                                <>
                                                  {correctAnswers.includes(option) && (
                                                    <span className="ml-2 text-green-500 font-bold">✔</span>
                                                  )}
                                                  {userAnswers.includes(option) && !correctAnswers.includes(option) && (
                                                    <span className="ml-2 text-red-500 font-bold">✖</span>
                                                  )}
                                                </>
                                                )
                                              : (
                                                <>
                                                  {userAnswers.includes(option) && correctAnswers.includes(option) && (
                                                    <span className="ml-2 text-green-500 font-bold">✔</span>
                                                  )}
                                                  {userAnswers.includes(option) && !correctAnswers.includes(option) && (
                                                    <span className="ml-2 text-red-500 font-bold">✖</span>
                                                  )}
                                                </>
                                                )
                                            }
                                          </div>
                                        )}
                                      />
                                      )
                                    : null
                                )}
                              </RadioGroup>
                            </FormControl>
                          ) : null}

                          {/* Explanation Section */}

                          {(selectedResult?.answerVisible && question?.explanation) && (
                            <div className="mt-4 border-t pt-4">
                              <div className="flex items-center justify-between">
                                <button
                                  type="button"
                                  onClick={() => setIsExplanationExpanded(!isExplanationExpanded)}
                                  className="flex items-center space-x-2 text-green-600 hover:text-green-800 transition-colors duration-200 font-bold"
                                >
                                  <InfoIcon className="text-lg" />
                                  <span>{t('course_exam.explanation')}</span>
                                  {isExplanationExpanded ? (
                                    <ExpandLessIcon className="text-lg" />
                                  ) : (
                                    <ExpandMoreIcon className="text-lg" />
                                  )}
                                </button>
                              </div>

                              <Collapse in={isExplanationExpanded}>
                                <div className="mt-3 p-4 bg-green-50 border-l-4 border-green-400 rounded-r-lg">
                                  <div
                                    className="text-gray-700 leading-relaxed"
                                  >
                                    <QuillShow htmlContent={question.explanation || ''} />
                                  </div>
                                </div>
                              </Collapse>
                            </div>
                          )}

                          {/* Discussion Section */}
                          {questionDiscussion &&
                            questionDiscussion[question.id] &&
                            questionDiscussion[question.id].length > 0 && (
                              <div className="mt-4 border-t pt-3">
                                <h3 className="text-lg font-semibold mb-2">{t('course_exam.discussion')}</h3>
                                <div className="space-y-3">
                                  {questionDiscussion[question.id]?.map((comment: any, idx: number) => (
                                    <div key={idx} className="p-4 bg-gray-100 rounded-lg shadow-sm">
                                      <div className="flex items-center justify-between">
                                        <div className="font-semibold text-gray-800">
                                          {comment?.firstName} {comment?.lastName}
                                          <span className="text-sm text-gray-600"> (@{comment?.username})</span>
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          {new Date(comment.updatedAt).toLocaleString()}
                                        </div>
                                      </div>
                                      <div className="mt-2 text-gray-700">{comment?.comment}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                          )}

                          {/* Comment Input */}
                          <div className="mt-6 bg-white p-4 border rounded-lg shadow-md flex items-center">
                            <div className="relative w-full flex items-center border border-gray-300 rounded-md">
                              <textarea
                                className="w-full py-2 px-4 pr-10 resize-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition placeholder-gray-500"
                                placeholder={`💬 ${t('exam_result.write_new_comment')}`}
                                value={newComments[question.id] || ''}
                                onChange={(e) => handleCommentChange(question.id, e.target.value)}
                              />
                              <div className="absolute right-2 flex items-center space-x-2">
                                <span className="border-l h-5 border-gray-300"></span>
                                <button
                                  className="text-blue-500 p-1 rounded-md transition flex items-center justify-center"
                                  onClick={async () => await handlePostComment(question.id)}
                                >
                                  <SendIcon fontSize='medium' />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="mt-2 sm:mt-4 flex justify-center">
                  <Pagination
                    count={totalPageQuestion}
                    page={pageQuestion}
                    onChange={(_, page) => handleChangeQuestionPagination(page)}
                    size="small"
                  />
                </div>
              </div>
            ) : (
              // Empty State
              <div className="flex flex-col items-center justify-center text-gray-500 text-lg py-10 h-full">
                <span className="text-4xl mb-3">🎯</span>
                <p className='font-bold'>{t('exam_result.choose_one_exam')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResultHistory
