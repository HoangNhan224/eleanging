/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/brace-style */
/* eslint-disable @typescript-eslint/indent */
/* eslint-disable react/jsx-key */
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

import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { useDispatch } from 'react-redux'
import { addNotification } from '../../redux/notification/notifySlice'
import 'react-pdf/dist/esm/Page/TextLayer.css'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import { useLocation, useNavigate } from 'react-router-dom'
import { getCategoryLessionsByCourse, getLessionByCategory, getLessionById, getLessionsByCategoryLessionId, getEnrollmentByUserId, getProgressByEnrollmentId, addProgress, checkUpdates, getFirstIncompleteLessionCourse, markCourseAsDone, createNotification, getCourseDetail, getExamByCourseId, getDetailExams, saveTempAnswer, markExam, getQuestionDiscussion, commentOnQuestion, getAllQuestionsInExam, getFlaggedQuestions, getUnsubmittedExams, postSubmitUnsubmittedExam, getTemptAnswers, checkAttemptAllowed } from 'api/post/post.api'
import { useTranslation } from 'react-i18next'
import 'react-circular-progressbar/dist/styles.css'
import { toast } from 'react-toastify'
import ModalComponent from 'components/Modal'
import { useMediaQuery } from 'react-responsive'
import ROUTES from 'routes/constant'
import { getFromLocalStorage, reload } from 'utils/functions'
import { useTheme } from 'services/styled-themes'
import { PacmanLoader } from 'react-spinners'
import Test from './test'
import Lesson from './study/lesson_content/index'
import LessonList from './study/lesson_list/index'
import LessonControl from './study/lesson_control/index'
import NoteModal from 'components/NoteModal'
import { idID } from '@mui/material/locale'
import { set, sub } from 'date-fns'

declare global {
  interface Window {
    YT: any
  }
}
interface CourseData {
  assignBy: 1
  categoryCourseId: string
  categoryCourseName: string
  createdAt: Date
  description: string
  durationInMinute: number
  endDate: Date
  id: string
  locationPath: string
  name: string
  prepare: string
  price: number
  startDate: Date
  summary: string
  updatedAt: Date
}

const Learning = () => {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const isMobileScreen = useMediaQuery({ maxWidth: 767 })
  const isTabletScreen = useMediaQuery({ minWidth: 768, maxWidth: 1023 })
  const isLaptopScreen = useMediaQuery({ minWidth: 1024, maxWidth: 1439 })
  const getPageWidth = () => {
    if (isMobileScreen) return 300
    if (isTabletScreen) return 600
    if (isLaptopScreen) return 800
    return 1000
  }
  const [noteModalOpen, setNoteModalOpen] = useState(false)
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false)
  const [numPages, setNumPages] = useState<number>(1)
  const location = useLocation()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [isPagination, setIsPagination] = useState(false)
  const [lession, setLession] = useState<any>({})
  const [enrollData, setEnrollData] = useState<any>(null)
  const [lessionCategories, setLessionCategories] = useState<any[]>([])
  const [lessions, setLessions] = useState<any[]>([])
  const [activeIndexes, setActiveIndexes] = useState<number[]>([])
  const [activeDrop, setActiveDrop] = useState<string | null>(null)
  const [courseProgress, setCourseProgress] = useState<Array<{ lessionId: string, enrollmentId: any }>>([])
  const [isExpanded, setIsExpanded] = useState(false)
  const watchRef = useRef<boolean>(false)
  const pdfContainerRef = useRef(null)
  const tt = useRef<any>({})
  const dispatch = useDispatch()
  const [courseData, setCourseData] = useState<CourseData | null>(null)
  const courseID = location.pathname.split('/')[2]

  const [exam, setExam] = useState<any>(null)
  const [examPassed, setExamPassed] = useState(false)
  const [isExamActive, setIsExamActive] = useState(false)
  const [isDoingExam, setIsDoingExam] = useState(false)
  const [examDetail, setExamDetail] = useState<any>(null)
  const [isExamDone, setIsExamDone] = useState(false)
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false)
  const [progressExam, setProgressExam] = useState<any>(null)
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({})
  const [isViewResult, setIsViewResult] = useState(false)
  const [questionDiscussion, setQuestionDiscussion] = useState<any>(null)
  const [isVideoError, setIsVideoError] = useState(false)
  const commentRefs = useRef<Record<string, HTMLTextAreaElement | null>>({})
  const [skipCheck, setSkipCheck] = useState(false)

    const tabId = useRef(Date.now().toString(36) + Math.random().toString(36).substring(2))
    const navigatingAway = useRef(false)
    useEffect(() => {
      if (!isDoingExam || !examDetail?.id) {
        return
      }
  
      const LEADER_KEY = `exam_leader_${examDetail.id}`
      const channel = new BroadcastChannel(`exam_channel_${examDetail.id}`)
      let isThisTabLeader = false
  
      const cleanup = () => {
        // If this tab is the leader, when it closes, it will remove the key to allow another tab to become the leader
        if (isThisTabLeader) {
          localStorage.removeItem(LEADER_KEY)
        }
        channel.close()
      }
  
      const becomeLeader = () => {
        isThisTabLeader = true
        localStorage.setItem(LEADER_KEY, tabId.current)
        // Notify all other tabs that there is a new leader
        channel.postMessage({ type: 'NEW_LEADER', id: tabId.current })
      }
  
      const becomeFollower = () => {
        if (navigatingAway.current) return
        navigatingAway.current = true
        toast.warn(t('exam.toast_exam_blocked'))
        navigate(ROUTES.homePage, { replace: true })
      }
  
      // Handle messages from other tabs
      channel.onmessage = (event) => {
        const { type, id } = event.data
        // If there is a new leader and it is not this tab, this tab will become
        if (type === 'NEW_LEADER' && id !== tabId.current) {
          becomeFollower()
        }
      }
  
      // When a new tab is opened, it will immediately declare itself as the
      becomeLeader()
  
      window.addEventListener('beforeunload', cleanup)
      return () => {
        window.removeEventListener('beforeunload', cleanup)
        cleanup()
      }
    }, [isDoingExam, examDetail?.id, navigate])
  const handlePostComment = async (questionId: string) => {
    const commentContent = commentRefs.current[questionId]?.value?.trim()
    if (!commentContent) return

    try {
      const payload = { comment: commentContent }
      const response = await commentOnQuestion(questionId, payload)
      console.log(response)

      if (response.data) {
        setQuestionDiscussion((prev: any) => ({
          ...prev,
          [questionId]: [...(prev[questionId] || []), response.data]
        }))

        // Xoá nội dung textarea sau khi gửi
        if (commentRefs.current[questionId]) {
          commentRefs.current[questionId]!.value = ''
        }
      }
    } catch (error) {
      console.error('Lỗi khi gửi bình luận:', error)
      toast.error(t('course_exam.cant_send_comment'))
    }
  }

  const [pageQuestion, setPageQuestion] = useState<number>(1)
const handleChangeQuestionPagination = (value: number) => {
  if (!examDetail) return
  if (value === pageQuestion) return
  setIsPagination(true)
  fetchExamDetails(
    examDetail.id,
    examDetail.attempted,
    value,
    10,
    { fullScreen: false }
  ).finally(() => setIsPagination(false))
}
  const pageSize = 10
  const totalPageQuestion = useMemo(() => {
    const totalRecord = examDetail ? examDetail.totalQuestions : 10
    return Math.ceil(totalRecord / pageSize)
  }, [examDetail])

  const handleOpenSubmitModal = () => {
    setUserAnswers({ ...userAnswers, ...answerCache.current })
    setIsSubmitModalOpen(true)
  }
  const handleExamClick = async () => {
    const response = await getExamByCourseId({ courseId: courseID })
    const examId = response.data?.id
    navigate(`/learning/${courseID}/examDetail?examId=${examId}`)
    setIsExamActive(true)
  }
  const handleBackExam = () => {
    window.location.href = `/learning/${courseID}/examDetail?examId=${examDetail?.id}`
  }
  const [userAnswers, setUserAnswers] = useState<Record<string, string | string[]>>({})

  const validEndTime: Date | null = useMemo(() => {
    if (examDetail?.enterTime != null && examDetail?.durationInMinute != null && examDetail?.exitTime == null) {
      const enterTime = new Date(examDetail?.enterTime)
      return new Date(enterTime.getTime() + examDetail?.durationInMinute * 60000)
    } else {
      return null
    }
  }, [examDetail])

  const answerCache = useRef<Record<string, string>>({})
  const flagCache = useRef<Record<string, string>>({})
  const [, forceUpdate] = useState(0)

  const [answerCacheVersion, setAnswerCacheVersion] = useState(0)
  const [flagCacheVersion, setFlagCacheVersion] = useState(0)
  useEffect(() => {
    if (examDetail) {
      examDetail.questions.forEach((q: any) => {
        if (q.isFlagged) {
          flagCache.current[q.id] = 'true'
        }
      })
      setFlagCacheVersion(prev => prev + 1)
    }
  }, [examDetail])
  const toggleFlag = async (questionId: string) => {
    if (!examDetail) return

    const currentCache = flagCache.current[questionId]
    const questionFromExam = examDetail.questions.find((q: any) => q.id === questionId)

    const currentFlagState = currentCache !== undefined
      ? currentCache === 'true'
      : questionFromExam?.isFlagged || false

    const newFlaggedState = !currentFlagState

    flagCache.current[questionId] = newFlaggedState.toString()

    setFlaggedQuestionsFromServer((prev) => {
      if (newFlaggedState) {
        const alreadyExists = prev.some((q) => q.questionId === Number(questionId))
        if (alreadyExists) return prev
        return [
          ...prev,
          {
            questionId: Number(questionId),
            page: examDetail.currentPage
          }
        ]
      } else {
        return prev.filter((q) => q.questionId !== Number(questionId))
      }
    })

    await saveTempAnswer(examDetail.id, {
      [questionId]: answerCache.current[questionId] || '',
      isFlagged: newFlaggedState,
      page: examDetail.currentPage,
      questionId
    })

    setFlagCacheVersion(prev => prev + 1)
    setAnswerCacheVersion(prev => prev + 1)
    forceUpdate((prev) => prev + 1)

    console.log('Flagged question:', questionId, 'New state:', newFlaggedState)
  }
  const handleSingleChoiceChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, questionId: string) => {
      const answer = e.target.value
      answerCache.current[questionId] = answer

      saveTempAnswer(exam?.id, {
        [questionId]: answer,
        questionId,
        page: examDetail?.currentPage,
      })

      setAnswerCacheVersion(prev => prev + 1)
      forceUpdate((prev) => prev + 1)
    },
    [exam?.id, examDetail?.currentPage]
  )
  const handleMultipleChoiceChange = useCallback(
    (questionId: string, value: string) => {
      const currentAnswers = answerCache.current[questionId]
        ? answerCache.current[questionId].split('::')
        : []
      const newAnswers = currentAnswers.includes(value)
        ? currentAnswers.filter((opt) => opt !== value)
        : [...currentAnswers, value]
      const newAnswer = newAnswers.join('::')

      answerCache.current[questionId] = newAnswer

      saveTempAnswer(exam?.id, {
        [questionId]: newAnswer,
        questionId,
        page: examDetail?.currentPage,
      })

      setAnswerCacheVersion(prev => prev + 1)
      forceUpdate((prev) => prev + 1)
    },
    [exam?.id, examDetail?.currentPage]
  )
  function tempAnswersToCache (
    tempAnswers: Array<{ questionId: number, userAnswer: string }>
  ): Record<string, string> {
    const result: Record<string, string> = {}
    tempAnswers.forEach(item => {
      if (item.questionId !== undefined) {
        result[item.questionId] = item.userAnswer ?? ''
      }
    })
    return result
  }
  useEffect(() => {
    const fetchAndSetAnswerCache = async () => {
      if (!examDetail) return
      try {
        const response = await getTemptAnswers({
          id: examDetail.id,
          attempt: examDetail.attempted
        })
        const tempAnswerArr = response.data.tempAnswers || []
        if (tempAnswerArr.length > 0) {
          answerCache.current = tempAnswersToCache(tempAnswerArr)
        } else {
          // Fallback: get from examDetail.questions
          const result: Record<string, string> = {};
          (examDetail.questions || []).forEach((question: any) => {
            if (question.userAnswer) {
              result[question.id] = Array.isArray(question.userAnswer)
                ? question.userAnswer.join('::')
                : question.userAnswer
            }
          })
          answerCache.current = result
        }
        setAnswerCacheVersion((prev) => prev + 1)
      } catch (error) {
        console.error('Error fetching temp answers:', error)

        answerCache.current = {}
        setAnswerCacheVersion((prev) => prev + 1)
      }
    }

    fetchAndSetAnswerCache()
  }, [examDetail])

  useEffect(() => {
    const fetchFlaggedQuestions = async () => {
      if (!examDetail) return

      try {
        const response = await getFlaggedQuestions({
          id: examDetail.id,
          attempt: examDetail.attempted
        })
        const flaggedQuestions = response.data.flaggedQuestions || []
        setFlaggedQuestionsFromServer(flaggedQuestions)
      } catch (error) {
        console.error('Error fetching flagged questions on mount:', error)
      }
    }
    fetchFlaggedQuestions()
  }, [examDetail])

  useEffect(() => {
    const loadUserAnswers = async () => {
      const nonEmptyCount = Object.values(answerCache.current).filter(
        (answer) => answer !== ''
      ).length
      setProgressExam(nonEmptyCount / (examDetail?.totalQuestions || 1))
    }
    loadUserAnswers()
  }, [answerCacheVersion, examDetail?.totalQuestions])

  const handleTimeUp = async () => {
    try {
      setUserAnswers({ ...userAnswers, ...answerCache.current })
      const response = await markExam(examDetail?.id, userAnswers)
      console.log(response)
      if (response) {
        if (response.data === 'too many attempted!') {
          // toast.error(t('course_exam.exceed_attempt'))
          return
        }
        setIsSubmitModalOpen(false)
        setIsExamDone(true)
        toast.dismiss()
        toast.success(t('course_exam.successfully_submitted'))
        try {
          setIsViewResult(true)
          const reponseExamResult = await getDetailExams({ id: examDetail?.id, attempt: examDetail.attempted, status: 'view' })
          if (reponseExamResult) {
            console.log(reponseExamResult)
            setExamDetail(reponseExamResult.data)
            if (parseInt(reponseExamResult?.data?.score) < exam?.pointToPass) {
              const responseNoti = await createNotification({
                title: 'Exam completed',
                message: `You failed the exam ${examDetail.name} on your ${examDetail?.attempted} attempt.`,
                url: '/exam_result'
              })
              if (responseNoti) {
                const data = {
                  id: responseNoti.data.recipients.recipientId,
                  notificationId: 1,
                  status: false,
                  updatedAt: new Date(),
                  createdAt: new Date(),
                  userId,
                  notificationDetails: {
                    id: 1,
                    title: 'Exam completed',
                    message: `You failed the exam ${examDetail.name} on your ${examDetail?.attempted} attempt.`,
                    url: '/exam_result',
                    createdAt: new Date(),
                    updatedAt: new Date()
                  }
                }
                dispatch(addNotification(data))
              }
            } else {
              const responseNoti = await createNotification({
                title: 'Exam completed',
                message: `Congratulations! You passed the exam ${examDetail.name} on your ${examDetail?.attempted} attempt.`,
                url: '/exam_result'
              })
              if (responseNoti) {
                const data = {
                  id: responseNoti.data.recipients.recipientId,
                  notificationId: 1,
                  status: false,
                  updatedAt: new Date(),
                  createdAt: new Date(),
                  userId,
                  notificationDetails: {
                    id: 1,
                    title: 'Exam completed',
                    message: `Congratulations! You passed the exam ${examDetail.name} on your ${examDetail?.attempted} attempt.`,
                    url: '/exam_result',
                    createdAt: new Date(),
                    updatedAt: new Date()
                  }
                }
                dispatch(addNotification(data))
              }
            }
            setPageQuestion(1)
            const questionIds = examDetail?.questions?.map((question: any) => question.id) || []
            questionIds.forEach(async (questionId: any) => {
              const response = await getQuestionDiscussion({ id: questionId })
              if (response) {
                setQuestionDiscussion((prev: any) => ({
                  ...prev,
                  [questionId]: response.data
                }))
              }
            })
          }
        localStorage.removeItem(`exam_session_${examDetail?.id}`)
        } catch (error) {
          console.error('Error fetching exam:', error)
        }
      }
    } catch (error) {
      console.error('Error submitting exam:', error)
    }
  }
  useEffect(() => {
    const fetchData = async () => {
      const response = await getCourseDetail({ id: courseID })
      setCourseData(response.data)
    }
    fetchData()
  }, [location.pathname])
  const [isOpenModal, setIsOpenModal] = useState(false)
  const [tokens, setTokens] = useState(getFromLocalStorage<any>('tokens'))
  const userId = tokens?.id
  useEffect(() => {
    const fetchUpdatesAndCheckLesson = async () => {
      let response = null
      if (courseData) {
        response = await getFirstIncompleteLessionCourse(userId, courseData?.id)
      } else {
        response = await getFirstIncompleteLessionCourse(userId, location.pathname.split('/')[2])
      }
      const { id: lessonId } = response?.data?.lession
      console.log('lessonId', lessonId)

      const currentLessonId = new URLSearchParams(location.search).get('id')
      if (location.pathname === `/learning/${courseData?.id}` && currentLessonId === lessonId.toString()) {
        return
      }

      if (userId) {
        const updateResponse = await checkUpdates(userId, courseData?.id ?? courseID)
        if (updateResponse.data.updates.length > 0) {
          setIsOpenModal(true)
        }
      }
    }
    fetchUpdatesAndCheckLesson()
  }, [])
  const handleCancelModalExam = () => {
    setIsOpenModalExam(false)
    setIsOpenStartNewExamModal(false)
    setIsOpenContinueOldExamModal(false)
  }
const fetchExamDetails = async (
  id: any,
  attempt: string,
  page: number = 1,
  limit: number = 10,
  options?: { fullScreen?: boolean }
) => {
  const fullScreen = options?.fullScreen === true
  try {
    if (fullScreen) setIsLoadingExam(true)
    const response = await getDetailExams({
      id,
      attempt,
      status: isViewResult ? 'view' : 'test',
      page,
      limit
    })
    if (response.data.sessionId) {
      localStorage.setItem(`exam_session_${id}`, response.data.sessionId)
    }
    setExamDetail(response.data)
    setPageQuestion(page)
    return response.data
  } catch (error: any) {
    console.error('Error fetching exam:', error)
    if (error.response?.data?.error === 'active_session_elsewhere') {
      toast.error(t('exam.toast_exam_forbidden'))
      navigate(ROUTES.homePage)
    }
    return null
  } finally {
    if (fullScreen) setIsLoadingExam(false)
  }
}
  const [isOpenModalExam, setIsOpenModalExam] = useState(false)
  const [isOpenStartNewExamModal, setIsOpenStartNewExamModal] = useState(false)
  const [isOpenContinueOldExamModal, setIsOpenContinueOldExamModal] = useState(false)
  const [pendingExamInfo, setPendingExamInfo] = useState<any>(null)
  const [pendingExamId, setPendingExamId] = useState<any>(null)
  const handleStartExam = async (exam: any) => {
    answerCache.current = {}
    setIsLoading(true)
    setPendingExamId(exam.id)
    try {
      console.log('check btn start exam')
      const checkSubmitExamBefore = await getUnsubmittedExams(exam.id)
      // If there is an unsubmitted exam and there is still time left,
      if (checkSubmitExamBefore?.data?.unsubmitted === true) {
        const { status, timeRemaining, attempt } = checkSubmitExamBefore.data
        if (status === 'active' && timeRemaining > 0) {
          setPendingExamInfo({ id: exam.id, attempt })
          setIsOpenContinueOldExamModal(true)
          setIsOpenStartNewExamModal(false)
          setIsOpenModalExam(false)
          setIsLoading(false)
          return
        } else {
          // If time is up, automatically
          await postSubmitUnsubmittedExam(exam.id)
          // Check if there are any
          const checkAttempt = await checkAttemptAllowed({ id: exam?.id })
          if (!checkAttempt.data.isAllowed) {
            toast.warn(t('course_exam.exceed_attempt'))
            setIsOpenContinueOldExamModal(false)
            setIsOpenStartNewExamModal(false)
            setIsOpenModalExam(false)
            await fetchExamData()
            setIsLoading(false)
            return
          }
          // If there are attempts left, fetch the latest data before showing the start new
          await fetchExamData()
        }
      } else {
        // No previous exam, check if there are any attempts
        const checkAttempt = await checkAttemptAllowed({ id: exam?.id })
        if (!checkAttempt.data.isAllowed) {
          toast.warn(t('course_exam.exceed_attempt'))
          setIsOpenContinueOldExamModal(false)
          setIsOpenStartNewExamModal(false)
          setIsOpenModalExam(false)
          await fetchExamData()
          setIsLoading(false)
          return
        }
        // If there are attempts left, fetch the latest data to ensure the number of exam
        await fetchExamData()
      }
      // At this point, there are definitely attempts left, open the start new exam
      setIsOpenStartNewExamModal(true)
      setIsOpenContinueOldExamModal(false)
      setIsOpenModalExam(false)
    } catch (error) {
      toast.error(t('course_exam.error_starting_exam'))
      setIsOpenContinueOldExamModal(false)
      setIsOpenStartNewExamModal(false)
      setIsOpenModalExam(false)
    } finally {
      setIsLoading(false)
    }
  }

const handleOkStartNewExamModal = async () => {
  if (!pendingExamId) return
  setIsLoading(true)
  try {
    setExamDetail(null)
    setIsDoingExam(false)
    setIsViewResult(false)
    setIsOpenStartNewExamModal(false)
    navigate(`/learning/${courseID}/examTest?examId=${pendingExamId}`)
    setIsExpanded(true)
    setSkipCheck(true)
    const examData = await fetchExamDetails(
      pendingExamId,
      exam?.attempted + 1,
      1,
      10,
      { fullScreen: true }
    )
    if (examData) {
      setIsDoingExam(true)
      setExamDetail(examData)
      setTimeout(() => {
        window.scrollTo(0, 0)
        if (centerColumnRef.current) centerColumnRef.current.scrollTop = 0
      }, 300)
    }
  } catch (error) {
    toast.error(t('course_exam.error_starting_exam'))
  } finally {
    setIsLoading(false)
  }
}
// When confirming to continue the previous exam
const handleOkContinueOldExamModal = async () => {
  if (!pendingExamInfo) return
  setIsLoading(true)
  try {
    setExamDetail(null)
    setIsDoingExam(false)
    setIsOpenContinueOldExamModal(false)
    navigate(`/learning/${courseID}/examTest?examId=${pendingExamInfo.id}`)
    setSkipCheck(true)
    const examData = await fetchExamDetails(
      pendingExamInfo.id,
      pendingExamInfo.attempt,
      1,
      10,
      { fullScreen: true }
    )
    if (examData) {
      setIsDoingExam(true)
    }
  } catch {
    toast.error(t('course_exam.error_starting_exam'))
  } finally {
    setIsLoading(false)
  }
}
  const [flaggedQuestionsFromServer, setFlaggedQuestionsFromServer] = useState<Array<{ questionId: number, page: number }>>([])
  const [currentFlaggedIndex, setCurrentFlaggedIndex] = useState(0)

const jumpToMarkQuestion = async () => {
  if (!examDetail) return
  try {
    setIsPagination(true)
    const response = await getFlaggedQuestions({
      id: examDetail.id,
      attempt: examDetail.attempted
    })
    const flaggedQuestions = response.data.flaggedQuestions || []
    if (flaggedQuestions.length === 0) {
      toast.info(t('course_exam.no_flagged_questions'))
      return
    }
    if (
      !flaggedQuestionsFromServer.length ||
      JSON.stringify(flaggedQuestionsFromServer) !== JSON.stringify(flaggedQuestions)
    ) {
      setFlaggedQuestionsFromServer(flaggedQuestions)
      setCurrentFlaggedIndex(0)
    }
    const nextIndex =
      currentFlaggedIndex >= flaggedQuestions.length ? 0 : currentFlaggedIndex
    const target = flaggedQuestions[nextIndex]

    const goScroll = (data: any) => {
      setTimeout(() => {
        const idx = data.questions.findIndex(
          (q: any) => q.id === target.questionId
        )
        if (idx !== -1) improvedScrollToQuestion(idx)
      }, 250)
    }

    if (target.page !== examDetail.currentPage) {
      const newPageData = await fetchExamDetails(
        examDetail.id,
        examDetail.attempted,
        target.page,
        10,
        { fullScreen: false }
      )
      if (newPageData) goScroll(newPageData)
    } else {
      const idx = examDetail.questions.findIndex(
        (q: any) => q.id === target.questionId
      )
      if (idx !== -1) improvedScrollToQuestion(idx)
    }
    setCurrentFlaggedIndex(prev =>
      prev + 1 >= flaggedQuestions.length ? 0 : prev + 1
    )
  } catch (e) {
    console.error(e)
    toast.error(t('course_exam.error_fetching_flagged'))
  } finally {
    setIsPagination(false)
  }
}

  // Cải tiến hàm scroll để nhanh hơn
  const improvedScrollToQuestion = (index: number) => {
    if (!centerColumnRef.current) return

    window.requestAnimationFrame(() => {
      const questionElement = questionRefs.current[index]
      if (!questionElement) return

      const centerColumn = centerColumnRef.current

      const originalBackground = questionElement.style.backgroundColor
      const originalBoxShadow = questionElement.style.boxShadow

      questionElement.style.transition = 'all 0.3s ease'
      questionElement.style.backgroundColor = 'rgba(255, 215, 0, 0.3)'
      questionElement.style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.8)'

      const offsetTop = questionElement.offsetTop - 100
      centerColumn?.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      })

      setTimeout(() => {
        if (questionElement) {
          questionElement.style.backgroundColor = originalBackground
          questionElement.style.boxShadow = originalBoxShadow
        }
      }, 1500)
    })
  }
const jumpToSpecificQuestion = async (questionId: number, page: number) => {
  if (!examDetail) return
  try {
    setIsPagination(true)

    if (page !== examDetail.currentPage) {
      const newPageData = await fetchExamDetails(
        examDetail.id,
        examDetail.attempted,
        page,
        10,
        { fullScreen: false }
      )
      if (newPageData) {
        setTimeout(() => {
          const idx = newPageData.questions.findIndex(
            (q: any) => q.id === questionId
          )
            if (idx !== -1) improvedScrollToQuestion(idx)
        }, 250)
      }
    } else {
      const idx = examDetail.questions.findIndex(
        (q: any) => q.id === questionId
      )
      if (idx !== -1) improvedScrollToQuestion(idx)
    }
  } catch (e) {
    console.error(e)
    toast.error(t('course_exam.error_fetching_flagged'))
  } finally {
    setIsPagination(false)
  }
}

  const [flaggedIds, setFlaggedIds] = useState<string[]>([])
  useEffect(() => {
    const ids = Object.keys(flaggedQuestions).filter(id => flaggedQuestions[id])
    setFlaggedIds(ids)
  }, [flaggedQuestions])

  const handleCancelSubmitExamModal = () => {
    setIsSubmitModalOpen(false)
  }
  const handleOkSubmitExamModal = async () => {
    try {
      toast.dismiss()
      setIsSubmitModalOpen(false)
      setFlaggedQuestions({})
      setFlaggedIds([])
      flagCache.current = {}
      setIsLoading(true)
      const response = await markExam(examDetail?.id, userAnswers)
      console.log(response)
      if (response) {
        if (response.data === 'too many attempted!') {
          // toast.error(t('course_exam.exceed_attempt'))
        }
        setIsExamDone(true)
        toast.success(t('course_exam.successfully_submitted'))
        try {
          setIsViewResult(true)
          const reponseExamResult = await getDetailExams({ id: examDetail?.id, attempt: examDetail.attempted, status: 'view' })
          if (reponseExamResult) {
            console.log(reponseExamResult)
            setExamDetail(reponseExamResult.data)
            if (parseInt(reponseExamResult?.data?.score) < exam?.pointToPass) {
              const responseNoti = await createNotification({
                title: 'Exam completed',
                message: `You failed the exam ${examDetail.name} on your ${examDetail?.attempted} attempt.`,
                url: '/exam_result'
              })
              if (responseNoti) {
                const data = {
                  id: responseNoti.data.recipients.recipientId,
                  notificationId: 1,
                  status: false,
                  updatedAt: new Date(),
                  createdAt: new Date(),
                  userId,
                  notificationDetails: {
                    id: 1,
                    title: 'Exam completed',
                    message: `You failed the exam ${examDetail.name} on your ${examDetail?.attempted} attempt.`,
                    url: '/exam_result',
                    createdAt: new Date(),
                    updatedAt: new Date()
                  }
                }
                dispatch(addNotification(data))
              }
            } else {
              const responseNoti = await createNotification({
                title: 'Exam completed',
                message: `Congratulations! You passed the exam ${examDetail.name} on your ${examDetail?.attempted} attempt.`,
                url: '/exam_result'
              })
              if (responseNoti) {
                const data = {
                  id: responseNoti.data.recipients.recipientId,
                  notificationId: 1,
                  status: false,
                  updatedAt: new Date(),
                  createdAt: new Date(),
                  userId,
                  notificationDetails: {
                    id: 1,
                    title: 'Exam completed',
                    message: `Congratulations! You passed the exam ${examDetail.name} on your ${examDetail?.attempted} attempt.`,
                    url: '/exam_result',
                    createdAt: new Date(),
                    updatedAt: new Date()
                  }
                }
                dispatch(addNotification(data))
              }
            }
            setPageQuestion(1)
            const questionIds = examDetail?.questions?.map((question: any) => question.id) || []
            questionIds.forEach(async (questionId: any) => {
              const response = await getQuestionDiscussion({ id: questionId })
              if (response) {
                setQuestionDiscussion((prev: any) => ({
                  ...prev,
                  [questionId]: response.data
                }))
              }
            })
          }
        } catch (error) {
          console.error('Error fetching exam:', error)
        }
      }
      localStorage.removeItem(`exam_session_${examDetail?.id}`)
    } catch (error) {
      console.error('Error submitting exam:', error)
    } finally {
      setIsLoading(false)
    }
  }
  const handleCancelModal = () => {
    navigate(`/courses/${courseData?.id}`)
    setIsOpenModal(false)
  }
  const handleOkModal = async () => {
    const response = await getFirstIncompleteLessionCourse(userId, courseData?.id ?? courseID)
    const { id: lessonId } = response.data.lession
    console.log('lessonId', lessonId)
    navigate(`/learning/${courseData?.id}?id=${lessonId}`)
    setIsOpenModal(false)
  }

  const getPdfFilePath = async (fileName: string | null): Promise<string | null> => {
  if (!fileName) return null
  console.log('ENV:', process.env.REACT_APP_API)
  const path = `${process.env.REACT_APP_API}/uploads/lessions/${encodeURIComponent(fileName)}`
  console.log('PDF PATH:', path)
  return path
}

  const [loadingPDF, setLoadingPDF] = useState(true)
  const [pdfPath, setPdfPath] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false
    setLoadingPDF(true)
    setPdfPath(null) // reset
    if (!lession?.locationPath) {
      setLoadingPDF(false)
      return
    }
    const fetchPdfPath = async () => {
      const path = await getPdfFilePath(lession.locationPath)
      if (!ignore) {
        setPdfPath(path)
        setLoadingPDF(false)
      }
    }
    fetchPdfPath()
    return () => {
      ignore = true
    }
  }, [lession?.locationPath])
  const fetchFirstLessonId = async (id: string) => {
    try {
      const fetchedLessionCategories = await getCategoryLessionsByCourse({ id: courseData?.id })
      // Sort the categories by order
      const sortedCategories = fetchedLessionCategories.data.sort((a: { order: number }, b: { order: number }) => a.order - b.order)
      const firstCategory = sortedCategories[0]
      if (firstCategory) {
        const lessions = await getLessionByCategory({ id: firstCategory.id })
        if (lessions.data.length > 0) {
          // Sort the lessons by order
          const sortedLessions = lessions.data.sort((a: { order: number }, b: { order: number }) => a.order - b.order)
          const firstLessonId = sortedLessions[0].id
          return firstLessonId
        }
      }
      return null
    } catch (error) {
      console.error('Error fetching first lesson:', error)
      return null
    }
  }
  const [isLoadingCourseProgress, setIsLoadingCourseProgress] = useState(true)
  useEffect(() => {
    setIsLoadingCourseProgress(true)
    const fetchData = async () => {
      const fetchedLessionCategories = await getCategoryLessionsByCourse({ id: courseData?.id })
      setLessionCategories(fetchedLessionCategories.data)

      const promises = fetchedLessionCategories.data.map(async (category: { id: string }) => {
        const lessions = await getLessionByCategory({ id: category.id })
        return lessions.data
      })
      Promise.all(promises)
        .then((lessionsDataArray) => {
          setLessions(lessionsDataArray)
        })
        .catch((error) => {
          console.error('Error fetching lessions:', error)
        })
      if (enrollData) {
        const courseProgress = await getProgressByEnrollmentId({ id: enrollData.id })
        setCourseProgress(courseProgress.data.data)
        setIsLoadingCourseProgress(false)
      }
    }
    if (courseData) {
      fetchData()
    }
  }, [courseData, enrollData])

  const playVideo = (event: any) => {
    const player = event.target
    const queryParams = new URLSearchParams(location.search)
    const newLessonId = queryParams.get('id')

    watchRef.current = courseProgress.some((progress) => Number(progress.lessionId) === Number(newLessonId))

    tt.current = setInterval(async () => {
      const payload = {
        lessionId: lession?.id,
        enrollmentId: enrollData?.id,
      }
      const duration = player.getDuration()
      const currentTime = player.getCurrentTime()
      const percentagePlayed = (currentTime / duration) * 100
      console.log(percentagePlayed, lession.id)

      if (watchRef.current) {
        clearInterval(tt.current)
      } else if (percentagePlayed >= 90) {
        try {
          const response = await addProgress(payload)
          setCourseProgress([...courseProgress, payload])
          if (!response) {
            console.error('Error adding progress')
          }
        } catch (error) {
          console.error(error)
        } finally {
          clearInterval(tt.current)

          // Check if the current lesson is the last lesson in the last category
          const currentCategoryIndex = lessions.findIndex(category =>
            category.some((lesson: { id: any }) => lesson.id === lession.id)
          )
          const sortedLessions = [...lessions[currentCategoryIndex]].sort((a, b) => a.order - b.order)
          const currentLessonIndex = sortedLessions.findIndex(
            (lesson) => lesson.id === lession.id
          )

          const isLastLesson = currentCategoryIndex === lessions.length - 1 && currentLessonIndex === sortedLessions.length - 1

          if (isLastLesson) {
            // toast.success('Congratulations! Course completed!')
            const responseMark = await markCourseAsDone({ courseId: courseData?.id })
            const responseNoti = await createNotification({ title: 'Course completed', message: `Congratulations! ${courseData?.name} completed!`, url: '/myCourses' })
            console.log('responseMark', responseMark)
            console.log('responseNoti', responseNoti)
            if (responseMark && responseNoti) {
              const data = {
                id: responseNoti.data.recipients.recipientId,
                notificationId: 1,
                status: false,
                updatedAt: new Date(),
                createdAt: new Date(),
                userId,
                notificationDetails: { id: 1, title: 'Course completed', message: `Congratulations! ${courseData?.name} completed!`, url: '/myCourses', createdAt: new Date(), updatedAt: new Date() }
              }
              dispatch(addNotification(data))
              toast.success(t('learning.toast_you_have_completed_this_course'))
            }
          } else {
            console.log('You learned')
          }
        }
      }
    }, 1000)
    console.log('courseProgress', courseProgress)
    console.log('newLessonId', newLessonId)
  }
  // =========================================================================
  const hasPermissionToViewLesson = (newLessonId: number, courseProgress: any[], lessons: any[], firstLessonId: number) => {
    const drops = lessions.map(lessionArray => lessionArray.map((lession: { name: any, id: string, type: string, order: number, description: string, lessionCategoryId: number }) => ({ name: lession.name, id: lession.id, type: lession.type, order: lession.order, description: lession.description, lessionCategoryId: lession.lessionCategoryId })))
    const sortedDrops = drops.map(dropArray =>
      dropArray.sort((a: { order: number }, b: { order: number }) => a.order - b.order)
    )
    const flattenedSortedDrops = sortedDrops.flat()
    const lessonIds: number[] = flattenedSortedDrops.map(lesson => lesson.id)
    if (!lessonIds.includes(newLessonId)) {
      // toast.error('Lesson not found in the course')
      return false
    }
    const newLessonIndex = lessonIds.indexOf(newLessonId)
    const allPreviousLessonsCompleted = flattenedSortedDrops.slice(0, newLessonIndex).every(lesson => {
      const isCompleted = courseProgress.some(progress => progress.lessionId === lesson.id)
      return isCompleted
    })
    if (!allPreviousLessonsCompleted && newLessonId !== firstLessonId) {
      toast.error(t('learning.need_to_complete_all_previous_lesson'))
      return false
    }
    return true
  }
  // =====================================
  const [isloadingLession, setIsLoadingLession] = useState(false)
  useEffect(() => {
    setIsLoadingLession(true)
    let isMounted = true
    const lessonIds: Array<number | React.SetStateAction<null>> = []
    lessions.forEach((category) => {
      category.forEach((lesson: { id: number | React.SetStateAction<null> }) => {
        lessonIds.push(lesson.id)
      })
    })
    if (enrollData && lessions && lessonIds.length > 0) {
      const fetchData = async () => {
        const queryParams = new URLSearchParams(location.search)
        const newLessonId = Number(queryParams.get('id')) || 0
        const firstLessonId = await fetchFirstLessonId(courseData?.id ?? '')
        if (newLessonId) {
          const hasPermission = hasPermissionToViewLesson(newLessonId, courseProgress, lessions, firstLessonId)
          if (!hasPermission) {
            navigate(`/learning/${courseData?.id}?id=${firstLessonId}`, { state: { courseData }, replace: true })
          } else if (isMounted) {
            const fetchedLession = await getLessionById({ id: Number(newLessonId) })
            if (!fetchedLession || !fetchedLession.data) {
              console.error('Lesson not found: ', newLessonId)
              navigate(`/learning/${courseData?.id}`)
              return
            }
            setActiveDrop(fetchedLession?.data.name)
            setLession(fetchedLession.data)
            let categoryIndex = -1
            for (let i = 0; i < parts?.length; i++) {
              const part = parts[i]
              if (part.name === fetchedLession.data.categoryLessionName) {
                categoryIndex = i
                break
              }
            }
            setActiveIndexes(prevIndexes => [...prevIndexes, categoryIndex])
          }
        }
      }
      fetchData()
      setIsLoadingLession(false)
    }
    return () => {
      setIsLoadingLession(false)
      isMounted = false
    }
  }, [courseProgress, location])
  // useEffect(() => {
  //   let isMounted = true
  //   const lessonIds: Array<number | React.SetStateAction<null>> = []
  //   lessions.forEach((category) => {
  //     category.forEach((lesson: { id: number | React.SetStateAction<null> }) => {
  //       lessonIds.push(lesson.id)
  //     })
  //   })
  //   if (enrollData && lessions && lessonIds.length > 0) {
  //     const fetchData = async () => {
  //       const queryParams = new URLSearchParams(location.search)
  //       const newLessonId = Number(queryParams.get('id')) || 0
  //       const firstLessonId = await fetchFirstLessonId(courseData?.id ?? '')
  //       if (newLessonId) {
  //         const hasPermission = hasPermissionToViewLesson(newLessonId, courseProgress, lessions, firstLessonId)
  //         if (!hasPermission) {
  //           navigate(`/learning/${courseData?.id}?id=${firstLessonId}`, { state: { courseData }, replace: true })
  //         } else if (isMounted) {
  //           const fetchedLession = await getLessionById({ id: String(newLessonId) })
  //           setActiveDrop(fetchedLession?.data.name)
  //           setLession(fetchedLession.data)
  //           let categoryIndex = -1
  //           for (let i = 0; i < parts?.length; i++) {
  //             const part = parts[i]
  //             if (part.name === fetchedLession.data.categoryLessionName) {
  //               categoryIndex = i
  //               break
  //             }
  //           }
  //           setActiveIndexes(prevIndexes => [...prevIndexes, categoryIndex])
  //         }
  //       }
  //     }
  //     fetchData()
  //   }
  //   return () => {
  //     isMounted = false
  //   }
  // }, [courseProgress, location])
  // SỬA SCROLL

  const handleScroll = async () => {
    const pdfContainer = pdfContainerRef.current as HTMLElement | null

    if (pdfContainer) {
      const { scrollTop, scrollHeight, clientHeight } = pdfContainer
      console.log(scrollTop, 'scrollTop')
      console.log(scrollHeight, 'scrollHeight')
      console.log(clientHeight, 'clientHeight')

      if (scrollTop + clientHeight >= scrollHeight * 0.8) {
        console.log(scrollTop, 'scrollTop_finish')
        console.log(scrollHeight, 'scrollHeight_finish')
        console.log(clientHeight, 'clientHeight_finish')
        console.log(pdfPath, 'pdfPath')
        await addProgressNoVideo()
        pdfContainer.removeEventListener('scroll', handleScroll)
      }
    }
  }

  const addProgressNoVideo = async () => {
    if (lession && enrollData) {
      const payload = {
        lessionId: lession?.id,
        enrollmentId: enrollData?.id
      }
      if (lession.type !== 'MP4') {
        try {
          const response = await addProgress(payload)
          setCourseProgress([...courseProgress, payload])
          const currentCategoryIndex = lessions.findIndex(category =>
            category.some((lesson: { id: any }) => lesson.id === lession.id)
          )
          const sortedLessions = [...lessions[currentCategoryIndex]].sort((a, b) => a.order - b.order)
          const currentLessonIndex = sortedLessions.findIndex(
            (lesson) => lesson.id === lession.id
          )

          const isLastLesson = currentCategoryIndex === lessions.length - 1 && currentLessonIndex === sortedLessions.length - 1

          if (isLastLesson) {
            const responseMark = await markCourseAsDone({ courseId: courseData?.id })
            const responseNoti = await createNotification({ title: 'Course completed', message: `Congratulations! ${courseData?.name} completed!`, url: '/myCourses' })
            console.log('responseMark', responseMark)
            console.log('responseNoti', responseNoti)
            if (responseMark && responseNoti) {
              const data = {
                id: responseNoti.data.recipients.recipientId,
                notificationId: 1,
                status: false,
                updatedAt: new Date(),
                createdAt: new Date(),
                userId,
                notificationDetails: { id: 1, title: 'Course completed', message: `Congratulations! ${courseData?.name} completed!`, url: '/myCourses', createdAt: new Date(), updatedAt: new Date() }
              }
              dispatch(addNotification(data))
              toast.success(t('learning.congratulations'))
            }
          }
        } catch (error) {
          console.log('error hoc lai>>>', error)
        }
      }
    }
  }

  useEffect(() => {
    const pdfContainer = pdfContainerRef.current as HTMLElement | null
    const checkPDFLoaded = () => {
      if (!pdfPath) return
      if (pdfContainer) {
        if (pdfContainer.scrollHeight > pdfContainer.clientHeight) {
          console.log('PDF has multiple pages')
          pdfContainer.addEventListener('scroll', handleScroll)
        } else {
          addProgressNoVideo()
        }
        clearInterval(intervalId)
      }
    }
    const intervalId = setInterval(checkPDFLoaded, 500)
    return () => {
      clearInterval(intervalId)
      if (pdfContainer) {
        pdfContainer.removeEventListener('scroll', handleScroll)
      }
    }
  }, [lession.id, pdfPath])

  // SỬA SCROLL
  const onStateChange = (event: any) => {
    console.log('onStateChange: ', event)
    console.log('window.YT.PlayerState.PLAYING: ', window.YT.PlayerState.PLAYING)
    if (event.data !== window.YT.PlayerState.PLAYING) {
      // If the video is not playing, clear the interval
      clearInterval(tt.current ?? 0)
    }
  }

  const opts = {
    height: '750',
    width: '100%',
    playerVars: {
      autoplay: 0,
      controls: 1,
      rel: 0,
      showinfo: 0,
      mute: 0,
      loop: 0,
    },
    rel: 0
  }

  function onDocumentLoadSuccess ({ numPages }: { numPages: number | null }) {
    setNumPages(numPages ?? 0)
  }

  const handlePress = () => {
    setIsCommentModalOpen(false)
  }

  const handleExpandClick = () => {
    setIsExpanded(!isExpanded)
  }

  useEffect(() => {
    if (!courseData?.id) {
      return
    }
    const fetchEnrollmentData = async () => {
      try {
        const enrollments = await getEnrollmentByUserId()
        const enrollment = enrollments.data.find(
          (enrollment: { courseId: string | undefined }) => enrollment.courseId === courseData.id
        )
        if (enrollment) {
          setEnrollData(enrollment)
        } else {
          toast.error(t('learning.not_enroll_yet'))
          navigate(ROUTES.homePage)
        }
      } catch (error) {
        console.error('Error fetching enrollment data:', error)
      }
    }

    fetchEnrollmentData()
  }, [courseData?.id])
  useEffect(() => {
    document.body.classList.add('overflow-y-hidden')
    return () => {
      document.body.classList.remove('overflow-y-hidden')
    }
  }, [])

  // useEffect(() => {
  //   window.scrollTo(0, 0)
  // }, [])

  const parsedDate = new Date(lession.updatedAt)
  const formattedDate = `${parsedDate.getMonth() + 1 < 10 ? '0' : ''}${parsedDate.getMonth() + 1}-${parsedDate.getDate() < 10 ? '0' : ''}${parsedDate.getDate()}-${parsedDate.getFullYear()}`

  const parts = lessionCategories.sort((a, b) => a.order - b.order).map(category => ({ id: category.id, name: category.name, order: category.order }))
  const drops = lessions.map(lessionArray => lessionArray.map((lession: { name: any, id: string, type: string, order: number, description: string, lessionCategoryId: number }) => ({ name: lession.name, id: lession.id, type: lession.type, order: lession.order, description: lession.description, lessionCategoryId: lession.lessionCategoryId })))
  const sortedDrops = drops.map(dropArray =>
    dropArray.sort((a: { order: number }, b: { order: number }) => a.order - b.order)
  )
  const handleClick = (index: number) => {
    setActiveIndexes(activeIndexes.includes(index)
      ? activeIndexes.filter(activeIndex => activeIndex !== index)
      : [...activeIndexes, index])
  }
  const handleDropClick = async (drop: { name: string, id: string, order: number, categoryOrder: number }, dropIndex: number) => {
    setIsVideoError(false)
    setIsExamActive(false)
    setIsDoingExam(false)
    const pdfContainer = pdfContainerRef.current as HTMLElement | null
    if (pdfContainer) {
      pdfContainer.scrollTop = 0
    }
    const previousLessonsInSameCategory = lessions[drop.categoryOrder].filter(
      (lesson: { order: number }) => lesson.order < drop.order
    )
    const previousLessonsInPreviousCategories = lessions
      .slice(0, drop.categoryOrder)
      .flatMap(category => category)
    const previousLessons = [...previousLessonsInSameCategory, ...previousLessonsInPreviousCategories]
    const isAllowedToContinue = previousLessons.every((lesson: { id: string }) =>
      courseProgress.some((progress: { lessionId: string }) => progress.lessionId === lesson.id)
    )
    if (!isAllowedToContinue) {
      toast.error(t('learning.need_to_complete_all_previous_lesson'))
      return
    }
    setActiveDrop(drop.name)
    navigate(`/learning/${courseData?.id}?id=${drop.id}`, { state: { courseData }, replace: true })
  }

  const handleBackToCourse = () => {
    navigate(`/courses/${courseData?.id}`)
  }

const safeCompleted = Array.isArray(courseProgress) ? courseProgress.length : 0
const safeTotal = Array.isArray(lessions)
  ? lessions.reduce(
      (total, currentCategoryCourses) =>
        total + (Array.isArray(currentCategoryCourses) ? currentCategoryCourses.length : 0),
      0
    )
  : 0
const percentage =
  safeTotal > 0
    ? parseFloat(((safeCompleted / safeTotal) * 100).toFixed(2))
    : 0
    const [isLoadingExam, setIsLoadingExam] = useState(false)
useEffect(() => {
  const toastMsg = localStorage.getItem('showToast')
  if (toastMsg) {
    toast.error(toastMsg)
    localStorage.removeItem('showToast')
  }
}, [])
  const fetchExamData = async () => {
    const response = await getExamByCourseId({ courseId: courseID })
    if (response.data) {
      setExam(response.data)
      setExamPassed(response.data.isPassed)

      // Check examId
      const params = new URLSearchParams(location.search)
      const examIdParam = params.get('examId')
      if (examIdParam && String(examIdParam) !== String(response.data.id)) {
        toast.warn(t('course_exam.invalid_exam'))
        navigate(`/courses/${courseID}`)
      }
    }
  }
useEffect(() => {
  const isExamDetailPage = location.pathname.includes('examDetail')
  const isExamTestPage = location.pathname.includes('examTest')
  const isCoursePage = location.pathname.includes('/courses/')

  const fetchAndNavigate = async () => {
    setIsLoadingExam(true)

    // If the lesson is not completed, restrict
    if (
      !isLoadingCourseProgress &&
      safeTotal > 0 &&
      courseProgress &&
      typeof safeCompleted === 'number' &&
      courseProgress.length < safeTotal &&
      courseData?.id &&
      !isCoursePage && 
      (isExamDetailPage || isExamTestPage)
    ) {
      const firstLessonId = await fetchFirstLessonId(courseData?.id ?? '')
      window.location.href = `/learning/${courseData?.id}?id=${firstLessonId}`
      toast.warn(t('learning.need_to_complete_all_previous_lesson'))
    }
    // Completed all lessons, on examDetail page then fetch exam
    else if (
      !isLoadingCourseProgress &&
      safeTotal > 0 &&
      courseProgress &&
      typeof safeCompleted === 'number' &&
      courseProgress.length >= safeTotal &&
      courseData?.id &&
      !isCoursePage && 
      isExamDetailPage
    ) {
      setIsExamActive(true)
      await fetchExamData()
    }
    // All lessons completed, handle the exam when entering
    else if (
      !skipCheck &&
      !isLoadingCourseProgress &&
      safeTotal > 0 &&
      courseProgress &&
      typeof safeCompleted === 'number' &&
      courseProgress.length >= safeTotal &&
      courseData?.id &&
      isExamTestPage
    ) {
      const params = new URLSearchParams(location.search)
      const examId = params.get('examId')
      await fetchExamData()
      const checkAttempt = await checkAttemptAllowed({ id: examId ?? undefined })
      const unsubmittedExam = await getUnsubmittedExams(examId)

      if (!checkAttempt.data.isAllowed) {
        console.log('checkAttempt.data.isAllowed', checkAttempt.data)
        setIsLoadingExam(true)
        toast.warn(t('course_exam.exceed_attempt'))
        navigate(`/learning/${courseData?.id}/examDetail?examId=${examId}`, { replace: true })
        return
      } else if (checkAttempt.data.isAllowed) {
        if (unsubmittedExam.data.unsubmitted) {
          setIsExamActive(true)
          setIsDoingExam(true)
          const response = await getDetailExams({ id: examId ?? undefined, status: 'test', attempt: unsubmittedExam.data.attempt })
          if (response) {
            console.log('DETAIL EXAM', response)
            setExamDetail(response.data)
          }
        } else {
          setIsLoadingExam(true)
          toast.warn(t('course_exam.invalid_exam'))
          navigate(`/learning/${courseData?.id}/examDetail?examId=${examId}`, { replace: true })
          return
        }
      }
    }
    setIsLoadingExam(false)
  }
  fetchAndNavigate()
}, [
  courseData,
  location.pathname,
  safeCompleted,
  safeTotal,
  courseProgress,
  isLoadingCourseProgress
])

  const handlePreviousClick = () => {
    setIsVideoError(false)
    const currentCategoryIndex = lessions.findIndex(category =>
      category.some((lesson: { id: any }) => lesson.id === lession.id)
    )

    // Sort lessons in the current category by order
    const sortedLessions = [...lessions[currentCategoryIndex]].sort((a, b) => a.order - b.order)
    const currentLessonIndex = sortedLessions.findIndex(
      (lesson: { id: any }) => lesson.id === lession.id
    )

    if (currentLessonIndex > 0) {
      const previousLesson = sortedLessions[currentLessonIndex - 1]
      navigate(`/learning/${courseData?.id}?id=${previousLesson.id}`, { state: { courseData } })
    } else if (currentCategoryIndex > 0) {
      const previousCategoryIndex = currentCategoryIndex - 1

      // Sort lessons in the previous category by order
      const sortedPreviousCategoryLessions = [...lessions[previousCategoryIndex]].sort((a, b) => a.order - b.order)
      const previousLesson = sortedPreviousCategoryLessions[sortedPreviousCategoryLessions.length - 1]

      if (!activeIndexes.includes(previousCategoryIndex)) {
        setActiveIndexes(prevIndexes => [...prevIndexes, previousCategoryIndex])
      }
      navigate(`/learning/${courseData?.id}?id=${previousLesson.id}`, { state: { courseData }, replace: true })
    }
    setActiveDrop(lession.name)
  }

  const handleNextClick = useCallback(async () => {
    setIsVideoError(false)
    const pdfContainer = pdfContainerRef.current as HTMLElement | null
    if (pdfContainer) {
      pdfContainer.scrollTop = 0
    }
    const currentCategoryIndex = lessions.findIndex(category =>
      category.some((lesson: { id: any }) => lesson.id === lession.id)
    )

    // Sort lessons in the current category by order
    const sortedLessions = [...lessions[currentCategoryIndex]].sort((a, b) => a.order - b.order)
    const currentLessonIndex = sortedLessions.findIndex(
      (lesson: { id: any }) => lesson.id === lession.id
    )

    if (currentLessonIndex < sortedLessions.length - 1) {
      const nextLesson = sortedLessions[currentLessonIndex + 1]
      const isCompleted = courseProgress.some(
        (progress: { lessionId: string }) => progress.lessionId === sortedLessions[currentLessonIndex].id
      )

      if (!isCompleted) {
        toast.warn(t('learning.need_to_complete_current_lesson'))
        return
      }
      navigate(`/learning/${courseData?.id}?id=${nextLesson.id}`, { state: { courseData }, replace: true })
    } else if (currentCategoryIndex < lessions.length - 1) {
      const currentLesson = sortedLessions[currentLessonIndex]

      // Check if the current lesson is already in courseProgress
      const isCompleted = courseProgress.some(
        (progress: { lessionId: string }) => progress.lessionId === currentLesson.id
      )

      if (!isCompleted) {
        toast.warn(t('learning.need_to_complete_current_lesson'))
        return
      }
      const nextCategoryIndex = currentCategoryIndex + 1

      // Sort lessons in the next category by order
      const sortedNextCategoryLessions = [...lessions[nextCategoryIndex]].sort((a, b) => a.order - b.order)

      if (!activeIndexes.includes(nextCategoryIndex)) {
        setActiveIndexes(prevIndexes => [...prevIndexes, nextCategoryIndex])
      }

      if (sortedNextCategoryLessions.length > 0) {
        const nextLesson = sortedNextCategoryLessions[0]
        // navigate(`?id=${nextLesson.id}`, { state: { courseData }, replace: true })
        navigate(`/learning/${courseData?.id}?id=${nextLesson.id}`, { state: { courseData }, replace: true })
      } else {
        console.error('Next category does not contain any lessons')
      }
    } else {
      // toast.success('Congratulations! Course completed!')
    }
    setActiveDrop(lession.name)
  }, [lessions, lession, courseProgress, enrollData, activeIndexes])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 'Enter') {
        handleNextClick()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleNextClick])
  useEffect(() => {
    const isMounted = { current: true }

    const handleBackButtonEvent = (e: { preventDefault: () => void }) => {
      e.preventDefault()
      if (isMounted.current) {
        navigate(`/courses/${courseData?.id}`, { replace: true })
      }
    }

    window.onpopstate = handleBackButtonEvent

    return () => {
      isMounted.current = false
      window.onpopstate = null
    }
  }, [])

  const videoOptions = {
    controls: [
      'play', // Nút Play
      'progress', // Thanh tiến trình
      'current-time', // Thời gian hiện tại
      'mute', // Nút tắt tiếng
      'volume', // Điều chỉnh âm lượng
      'fullscreen' // Nút toàn màn hình
    ],
    settings: ['captions', 'quality', 'speed'], // Các cài đặt tùy chọn khác (nếu muốn)
    youtube: {
      noCookie: true, // Tắt cookie theo dõi
      controls: 0, // Ẩn các điều khiển của YouTube
      modestbranding: 1, // Giảm logo YouTube
      rel: 0, // Không hiển thị video liên quan
      showinfo: 0, // Ẩn thông tin video
      iv_load_policy: 3, // Ẩn chú thích
      playsinline: 1, // Phát video trong chế độ inline
      enablejsapi: 1, // Kích hoạt API JavaScript
      origin: 'https://plyr.io' // Origin của trang web
    }
  }
  const buildYouTubeEmbedUrl = (videoId: any, options: any) => {
    const baseUrl = `https://www.youtube.com/embed/${videoId}`
    const params = new URLSearchParams({
      origin: options.youtube.origin,
      iv_load_policy: options.youtube.iv_load_policy,
      modestbranding: options.youtube.modestbranding,
      playsinline: options.youtube.playsinline,
      showinfo: options.youtube.showinfo,
      rel: options.youtube.rel,
      enablejsapi: options.youtube.enablejsapi
    })

    return `${baseUrl}?${params.toString()}`
  }
  const videoId = 'lCofA723a4A'
  const questionRefs = useRef<Array<HTMLDivElement | null>>([])
  const centerColumnRef = useRef<HTMLDivElement | null>(null)

  // Hàm xử lý cuộn đến câu hỏi
  const handleScrollToQuestion = (index: number) => {
    if (centerColumnRef.current && questionRefs.current[index]) {
      const centerColumn = centerColumnRef.current
      const questionElement = questionRefs.current[index]

      if (questionElement && centerColumn) {
        // Tính khoảng cách từ câu hỏi đến container
        const offsetTop = questionElement.offsetTop - centerColumn.offsetTop

        // Cuộn Center Column đến vị trí đó
        centerColumn.scrollTo({ top: offsetTop, behavior: 'smooth' })
      }
    }
  }
  // if (isLoadingExam || isloadingLession || isLoadingCourseProgress) {
  //   return (
  //   <div className="flex justify-center items-center w-full h-140 mt-20 z-50">
  //     <PacmanLoader
  //       className='flex justify-center items-center w-full mt-20 z-50'
  //       color='#8B5CF6'
  //       cssOverride={{
  //         display: 'block',
  //         margin: '0 auto',
  //         borderColor: 'blue'
  //       }}
  //       loading
  //       margin={10}
  //       speedMultiplier={3}
  //       size={40}
  //   /></div>
  //   )
  // }
  return (
    <div className='flex h-screen overflow-hidden'>
      {/* {isLoading
        && <div className="flex justify-center items-center w-full h-140 mt-20 z-50">
          <PacmanLoader
            className='flex justify-center items-center w-full mt-20 z-50'
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
      } */}
      <div className="relative flex flex-col flex-1 lg:overflow-y-hidden overflow-y-auto custom-scrollbar overflow-x-hidden">
        {isCommentModalOpen && <div className="fixed inset-0 z-40 bg-black opacity-50" onClick={handlePress}></div>}

        <div className='relative flex'>
          <div className={`${isDoingExam
            ? 'lg:w-full'
            : isExpanded
              ? 'lg:w-full'
              : 'lg:w-9/12'
            } transition-all duration-700 ease-in-out`}>
            {!isExamActive ? (
              isLoadingCourseProgress || isloadingLession ? (
               <div className="flex justify-center items-center w-full h-screen">
                 <div className="flex flex-col items-center space-y-4">
                   <PacmanLoader
                     color="#5EEAD4"
                     cssOverride={{
                       display: 'block',
                       margin: '0 auto'
                     }}
                     loading
                     margin={10}
                     speedMultiplier={3}
                     size={30}
                   />
                 </div>
               </div>
             ) : (
              <Lesson
                lesson={lession}
                lession={lession}
                pdfContainerRef={pdfContainerRef}
                isVideoError={isVideoError}
                setIsVideoError={setIsVideoError}
                isCommentModalOpen={isCommentModalOpen}
                numPages={numPages}
                setNumPages={setNumPages}
                formattedDate={formattedDate}
                opts={opts}
                playVideo={playVideo}
                onStateChange={onStateChange}
                getPdfFilePath={getPdfFilePath}
                onDocumentLoadSuccess={onDocumentLoadSuccess}
                getPageWidth={getPageWidth}
                watchRef={watchRef}
                tt={tt}
                courseProgress={courseProgress}
                addProgress={addProgress}
                setCourseProgress={setCourseProgress}
                enrollData={enrollData}
                courseData={courseData}
                userId={userId}
                dispatch={dispatch}
                lessions={lessions}
                markCourseAsDone={markCourseAsDone}
                createNotification={createNotification}
                addNotification={addNotification}
                pdfPath={pdfPath}
                loadingPDF={loadingPDF}
              />
             )
            ) : (
              isLoadingExam ? (
               <div className="flex justify-center items-center w-full h-screen">
                 <div className="flex flex-col items-center space-y-4">
                   <PacmanLoader
                     color="#5EEAD4"
                     cssOverride={{
                       display: 'block',
                       margin: '0 auto'
                     }}
                     loading
                     margin={10}
                     speedMultiplier={3}
                     size={30}
                    />
                  </div>
                 </div>
            ) : (
              <Test
                isDoingExam={isDoingExam}
                exam={exam}
                examDetail={examDetail}
                isPagination={isPagination}
                centerColumnRef={centerColumnRef}
                // isOpenModalExam={isOpenModalExam}
                isOpenStartNewExamModal={isOpenStartNewExamModal}
                isOpenContinueOldExamModal={isOpenContinueOldExamModal}
                handleStartExam={handleStartExam}
                handleCancelModalExam={handleCancelModalExam}
                // handleOkModalExam={handleOkModalExam}
                handleOkStartNewExamModal={handleOkStartNewExamModal}
                handleOkContinueOldExamModal={handleOkContinueOldExamModal}
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
                handleTimeUp={handleTimeUp}
                handleBackExam={handleBackExam}
                handleOpenSubmitModal={handleOpenSubmitModal}
                progressExam={progressExam}
                handleChangeQuestionPagination={handleChangeQuestionPagination}
                totalPageQuestion={totalPageQuestion}
                handleScrollToQuestion={handleScrollToQuestion}
                jumpToMarkQuestion={jumpToMarkQuestion}
                flaggedIds={flaggedIds}
                currentFlaggedIndex={currentFlaggedIndex}
                theme={theme}
                flaggedQuestionsFromServer={flaggedQuestionsFromServer}
                onSelectFlaggedQuestion={jumpToSpecificQuestion}
              />
            )
            )}
          </div>
          <LessonList
            isExpanded={isExpanded}
            handleBackToCourse={handleBackToCourse}
            courseData={courseData}
            completedLessonsCount={ safeCompleted}
            totalCourses={safeTotal}
            percentage={percentage}
            theme={theme}
            parts={parts}
            lessionCategories={lessionCategories}
            lessions={lessions}
            courseProgress={courseProgress}
            activeIndexes={activeIndexes}
            handleClick={handleClick}
            sortedDrops={sortedDrops}
            activeDrop={activeDrop ?? ''}
            isExamActive={isExamActive}
            handleDropClick={handleDropClick}
            handleExamClick={handleExamClick}
            exam={exam}
            isDoingExam={isDoingExam}
            setIsExpand={setIsExpanded}
            noteModalOpen={noteModalOpen}
            setNoteModalOpen={setNoteModalOpen}
            isPassed={examPassed}
          />
        </div>
      </div>
      <LessonControl
        lession={lession}
        theme={theme}
        isExamActive={isExamActive}
        handlePreviousClick={handlePreviousClick}
        handleNextClick={handleNextClick}
        isExpanded={isExpanded}
        handleExpandClick={handleExpandClick}
      />
      <ModalComponent
        isOpen={isOpenModal}
        title={t('learning.continue_title') ?? 'Course updated'}
        description={t('learning.continue_message') ?? 'Do you want to continue learning now?'}
        onClose={handleCancelModal}
        onOk={handleOkModal}
        onCancel={handleCancelModal}
      />
      <ModalComponent
        isOpen={isSubmitModalOpen}
        title={t('learning.submit') ?? 'Submit'}
        description={t('learning.sure_submit_exam') as string || 'Are you sure you want to submit the exam?'}
        onClose={handleCancelSubmitExamModal}
        onOk={handleOkSubmitExamModal}
        onCancel={handleCancelSubmitExamModal}
      />
      <NoteModal modalOpen={noteModalOpen} setModalOpen={setNoteModalOpen} />

    </div>
  )
}
export default Learning
