/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable multiline-ternary */
/* eslint-disable react/jsx-no-undef */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/indent */
/* eslint-disable operator-linebreak */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/return-await */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import Test from 'pages/learning/test'
import ModalComponent from 'components/Modal'
import { commentOnQuestion, getDetailExams, getFlaggedQuestions, postSubmitUnsubmittedExam, getUnsubmittedExams, checkAttemptAllowed, getTemptAnswers, getQuestionDiscussion, markExam, saveTempAnswer, createNotification } from 'api/post/post.api'
import { useDispatch } from 'react-redux'
import { addNotification } from '../../redux/notification/notifySlice'
import { PacmanLoader } from 'react-spinners'
import ROUTES from 'routes/constant'
import { getFromLocalStorage } from 'utils/functions'
const GroupExamDetail = () => {
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const { id } = useParams()
  const [exam, setExam] = useState<any>(null)
  const [examDetail, setExamDetail] = useState<any>(null)
  const [userAnswers, setUserAnswers] = useState<Record<string, string | string[]>>({})
  const [progressExam, setProgressExam] = useState<number>(0)
  const [flaggedQuestions, setFlaggedQuestions] = useState<any>({})
  const [questionDiscussion, setQuestionDiscussion] = useState<any>({})
  const [isViewResult, setIsViewResult] = useState<boolean>(false)
  const [isPagination, setIsPagination] = useState(false)
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState<boolean>(false)
  const [theme, setTheme] = useState<string>('light')
  const centerColumnRef = useRef<HTMLDivElement>(null)
  const questionRefs = useRef<any>([])
  const commentRefs = useRef<Record<string, HTMLTextAreaElement | null>>({})
  const [pageQuestion, setPageQuestion] = useState<number>(1)
  const [flaggedQuestionsFromServer, setFlaggedQuestionsFromServer] = useState<Array<{ questionId: number, page: number }>>([])
  const [currentFlaggedIndex, setCurrentFlaggedIndex] = useState(0)
  const [flaggedIds, setFlaggedIds] = useState<string[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [version, setVersion] = useState(0)
  const navigate = useNavigate()

  const answerCache = useRef<Record<string, string>>({})
  const flagCache = useRef<Record<string, string>>({})
  const location = useLocation()
  const allowStart = location.state?.allowStart

  const [tokens, setTokens] = useState(getFromLocalStorage<any>('tokens'))
  const userId = tokens?.id

  const tabId = useRef(Date.now().toString(36) + Math.random().toString(36).substring(2))
  const navigatingAway = useRef(false)
  useEffect(() => {
    if (!examDetail?.id) {
      return
    }

    const LEADER_KEY = `exam_leader_${examDetail.id}`
    const channel = new BroadcastChannel(`exam_channel_${examDetail.id}`)
    let isThisTabLeader = false

    const cleanup = () => {
      if (isThisTabLeader) {
        localStorage.removeItem(LEADER_KEY)
      }
      channel.close()
    }

    const becomeLeader = () => {
      isThisTabLeader = true
      localStorage.setItem(LEADER_KEY, tabId.current)
      channel.postMessage({ type: 'NEW_LEADER', id: tabId.current })
    }

    const becomeFollower = () => {
      if (navigatingAway.current) return
      navigatingAway.current = true
      toast.warn(t('exam.toast_exam_blocked'))
      navigate('/group_exam_list', { replace: true })
    }

    channel.onmessage = (event) => {
      const { type, id } = event.data
      if (type === 'NEW_LEADER' && id !== tabId.current) {
        becomeFollower()
      }
    }

    becomeLeader()

    window.addEventListener('beforeunload', cleanup)
    return () => {
      window.removeEventListener('beforeunload', cleanup)
      cleanup()
    }
  }, [examDetail?.id, navigate])
  useEffect(() => {
  const fetchAndNavigate = async () => {
    setIsLoadingExam(true)
    if (id) {
      const examId = id
      const checkAttempt = await checkAttemptAllowed({ id: examId ?? undefined })
      const unsubmittedExam = await getUnsubmittedExams(examId)

      if (!checkAttempt.data.isAllowed) {
        toast.warn(t('course_exam.exceed_attempt'))
        navigate('/group_exam_list', { replace: true })
        return
      } else if (checkAttempt.data.isAllowed) {
        if (unsubmittedExam.data.unsubmitted) {
          if (unsubmittedExam.data.status === 'active' && unsubmittedExam.data.timeRemaining > 0) {
            const res = await getDetailExams({ id, status: 'test', attempt: unsubmittedExam.data.attempt })
            if (res.status === 200) {
              setExam(res.data)
              setExamDetail(res.data)
            }
          } else {
            await postSubmitUnsubmittedExam(examId)
            const checkAttemptAgain = await checkAttemptAllowed({ id: examId ?? undefined })
            if (!checkAttemptAgain.data.isAllowed) {
              toast.warn(t('course_exam.exceed_attempt'))
              navigate('/group_exam_list', { replace: true })
              return
            }
            if (allowStart) {
              const res = await getDetailExams({ id, status: 'test' })
              if (res.status === 200) {
                setExam(res.data)
                setExamDetail(res.data)
              }
            } else {
              toast.warn(t('course_exam.invalid_exam'))
              navigate('/group_exam_list', { replace: true })
              return
            }
          }
        } else if (allowStart) {
          const res = await getDetailExams({ id, status: 'test' })
          if (res.status === 200) {
            setExam(res.data)
            setExamDetail(res.data)
          }
        } else {
          toast.warn(t('course_exam.invalid_exam'))
          navigate('/group_exam_list', { replace: true })
          return
        }
      }
    }
    setIsLoadingExam(false)
  }
  fetchAndNavigate()
}, [id, navigate, location.state])

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
        // console.error('Error fetching flagged questions on mount:', error)
      }
    }
    fetchFlaggedQuestions()
  }, [examDetail])

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
        // console.error('Error fetching temp answers:', error)
        answerCache.current = {}
        setAnswerCacheVersion((prev) => prev + 1)
      }
    }

    fetchAndSetAnswerCache()
  }, [examDetail])

  const [answerCacheVersion, setAnswerCacheVersion] = useState(0)
  const [flagCacheVersion, setFlagCacheVersion] = useState(0)
  const [, forceUpdate] = useState(0)

  useEffect(() => {
    const loadUserAnswers = async () => {
      const nonEmptyCount = Object.values(answerCache.current).filter(
        (answer) => answer !== ''
      ).length
      setProgressExam(nonEmptyCount / (examDetail?.totalQuestions || 1))
    }
    loadUserAnswers()
  }, [answerCacheVersion, examDetail?.totalQuestions])

  useEffect(() => {
    const ids = Object.keys(flaggedQuestions).filter(id => flaggedQuestions[id])
    setFlaggedIds(ids)
  }, [flaggedQuestions])

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
  }
  const handleSingleChoiceChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, questionId: string) => {
      const answer = e.target.value
      answerCache.current[questionId] = answer
      saveTempAnswer(exam?.id, {
        [questionId]: answer,
        questionId,
        page: examDetail?.currentPage
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
        page: examDetail?.currentPage
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
  const handlePostComment = async (questionId: string) => {
    const commentContent = commentRefs.current[questionId]?.value?.trim()
    if (!commentContent) return

    try {
      const payload = { comment: commentContent }
      const response = await commentOnQuestion(questionId, payload)
      if (response.data) {
        setQuestionDiscussion((prev: any) => ({
          ...prev,
          [questionId]: [...(prev[questionId] || []), response.data]
        }))

        if (commentRefs.current[questionId]) {
          commentRefs.current[questionId]!.value = ''
        }
      }
    } catch (error) {
      // console.error('Lỗi khi gửi bình luận:', error)
      toast.error(t('course_exam.cant_send_comment'))
    }
  }
  const handleOpenSubmitModal = () => {
    setUserAnswers({ ...userAnswers, ...answerCache.current })
    setIsSubmitModalOpen(true)
  }
  const handleCancelSubmitExamModal = () => setIsSubmitModalOpen(false)

  const handleOkSubmitExamModal = async () => {
    try {
      toast.dismiss()
      setIsSubmitModalOpen(false)
      setFlaggedQuestions({})
      setFlaggedIds([])

      flagCache.current = {}
      const examId = examDetail?.id
      const response = await markExam(examDetail?.id, userAnswers)
      if (response) {
        if (response.data === 'too many attempted!') {
          // toast.error(t('course_exam.exceed_attempt'))
        }
        toast.success(t('course_exam.successfully_submitted'))
        try {
          setIsViewResult(true)
          const reponseExamResult = await getDetailExams({ id: examDetail?.id, attempt: examDetail.attempted, status: 'view' })
          if (reponseExamResult) {
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
        localStorage.removeItem(`exam_session_${examId}`)
        } catch (error) {
          // console.error('Error fetching exam:', error)
        }
      }
    } catch (error) {
      // console.error('Error submitting exam:', error)
    }
  }

  const handleBackExam = () => window.history.back()

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

  const [isLoadingExam, setIsLoadingExam] = useState(false)
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
      const response = await getDetailExams({ id, attempt, status: isViewResult ? 'view' : 'test', page, limit })

      if (response.data.sessionId) {
        localStorage.setItem(`exam_session_${id}`, response.data.sessionId)
      }
      setExamDetail(response.data)
      setPageQuestion(page)
      return response.data
    } catch (error: any) {
      if (error.response?.data?.error === 'active_session_elsewhere') {
        toast.error(t('exam.toast_exam_forbidden'))
        navigate('/group_exam_list', { replace: true })
      }
      return null
    } finally {
      if (fullScreen) setIsLoadingExam(false)
    }
  }

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
        // toast.info(t('course_exam.no_flagged_questions'))
        return
      }
      if (
        !flaggedQuestionsFromServer.length ||
        JSON.stringify(flaggedQuestionsFromServer) !== JSON.stringify(flaggedQuestions)
      ) {
        setFlaggedQuestionsFromServer(flaggedQuestions)
        setCurrentFlaggedIndex(0)
      }

      const nextIndex = currentFlaggedIndex >= flaggedQuestions.length ? 0 : currentFlaggedIndex
      const targetQuestion = flaggedQuestions[nextIndex]

      if (targetQuestion.page !== examDetail.currentPage) {
        const newPageData = await fetchExamDetails(
          examDetail.id,
          examDetail.attempted,
          targetQuestion.page,
          10,
          { fullScreen: false }
        )

        if (newPageData) {
          setTimeout(() => {
            window.requestAnimationFrame(() => {
              const questionIndex = newPageData.questions.findIndex(
                (q: any) => q.id === targetQuestion.questionId
              )
              if (questionIndex !== -1) improvedScrollToQuestion(questionIndex)
            })
          }, 300)
        }
      } else {
        const questionIndex = examDetail.questions.findIndex(
          (q: any) => q.id === targetQuestion.questionId
        )
        if (questionIndex !== -1) improvedScrollToQuestion(questionIndex)
      }

      setCurrentFlaggedIndex((prevIndex) =>
        prevIndex + 1 >= flaggedQuestions.length ? 0 : prevIndex + 1
      )
    } catch {
      toast.error(t('course_exam.error_fetching_flagged'))
    } finally {
      setIsPagination(false)
    }
  }

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
            const questionIndex = newPageData.questions.findIndex(
              (q: any) => q.id === questionId
            )
            if (questionIndex !== -1) improvedScrollToQuestion(questionIndex)
          }, 300)
        }
      } else {
        const questionIndex = examDetail.questions.findIndex(
          (q: any) => q.id === questionId
        )
        if (questionIndex !== -1) improvedScrollToQuestion(questionIndex)
      }
    } catch {
      toast.error(t('course_exam.error_fetching_flagged'))
    } finally {
      setIsPagination(false)
    }
  }

  const handleScrollToQuestion = (index: number) => {
    if (centerColumnRef.current && questionRefs.current[index]) {
      const centerColumn = centerColumnRef.current
      const questionElement = questionRefs.current[index]

      if (questionElement && centerColumn) {
        const offsetTop = questionElement.offsetTop - centerColumn.offsetTop

        centerColumn.scrollTo({ top: offsetTop, behavior: 'smooth' })
      }
    }
  }

  const handleTimeUp = async () => {
    try {
      setUserAnswers({ ...userAnswers, ...answerCache.current })
      const response = await markExam(examDetail?.id, userAnswers)
      if (response) {
        if (response.data === 'too many attempted!') {
          // toast.error(t('course_exam.exceed_attempt'))
          return
        }
        setIsSubmitModalOpen(false)
        toast.dismiss()
        toast.success(t('course_exam.successfully_submitted'))
        try {
          setIsViewResult(true)
          const reponseExamResult = await getDetailExams({ id: examDetail?.id, attempt: examDetail.attempted, status: 'view' })
          if (reponseExamResult) {
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
          // console.error('Error fetching exam:', error)
        }
      }
    } catch (error) {
      // console.error('Error submitting exam:', error)
    }
  }

  if (isLoadingExam) {
      return (
            <div className="flex justify-center items-center w-full h-140 mt-20 z-50">
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
      )
  }

  return (
    <div>
      <Test
        isDoingExam={true}
        exam={exam}
        examDetail={examDetail}
        isPagination={isPagination}
        centerColumnRef={centerColumnRef}
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
      <ModalComponent
        isOpen={isSubmitModalOpen}
        title={t('learning.submit') ?? 'Submit'}
        description={t('learning.sure_submit_exam') as string || 'Are you sure you want to submit the exam?'}
        onClose={handleCancelSubmitExamModal}
        onOk={handleOkSubmitExamModal}
        onCancel={handleCancelSubmitExamModal}
      />
    </div>
  )
}

export default GroupExamDetail
