/* eslint-disable @typescript-eslint/prefer-optional-chain */
/* eslint-disable multiline-ternary */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable no-useless-return */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable promise/param-names */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* PAGE: QuestionDiscussionPage
   ========================================================================== */
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { ClipLoader } from 'react-spinners'
import SendIcon from '@mui/icons-material/Send'
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined'
import RefreshIcon from '@mui/icons-material/Refresh'
import QuillShow from '../../components/QuillEditor'
import { toast } from 'react-toastify'
import { getQuestionDiscussion, commentOnQuestion, getQuestionDetails } from '../../api/post/post.api'
import { selectUserRole, selectAuthTokens } from '../../redux/auth/authSlice'
import { useTranslation } from 'services/i18n'
import { Box, Tooltip } from '@mui/material'

interface Comment {
  id: number
  username?: string
  firstName?: string
  lastName?: string
  comment: string
  updatedAt: string
}

interface LocationState {
  questionId?: number | string
  examId?: number | string
  question?: {
    id?: number | string
    content?: string
  }
}

const initials = (c: Comment) => {
  const name = `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.username || 'U'
  const parts = name.split(' ').filter(Boolean)
  const i1 = parts[0]?.[0] || 'U'
  const i2 = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (i1 + i2).toUpperCase()
}

const colorFrom = (seed: string | undefined) => {
  const s = seed || 'seed'
  let hash = 0
  for (let i = 0; i < s.length; i++) hash = s.charCodeAt(i) + ((hash << 5) - hash)
  const hue = Math.abs(hash) % 360
  return `hsl(${hue} 70% 45%)`
}

const QuestionDiscussionPage: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const state = (location.state || {}) as LocationState
  const { t } = useTranslation()
  // TODO: Get user role and tokens from Redux
  const userRole = useSelector(selectUserRole)
  const authTokens = useSelector(selectAuthTokens)
  const currentUserId = authTokens?.id ? Number(authTokens.id) : null

  const questionId = useMemo<number | null>(() => {
    // Chỉ lấy từ state
    const idFromState = state?.questionId ?? state?.question?.id
    if (!idFromState) return null
    const n = Number(idFromState)
    return Number.isFinite(n) ? n : null
  }, [state?.questionId, state?.question?.id])

  const examId = useMemo<number | null>(() => {
    // Chỉ lấy từ state
    const idFromState = state?.examId
    if (!idFromState) return null
    const n = Number(idFromState)
    return Number.isFinite(n) ? n : null
  }, [state?.examId])

  const [loading, setLoading] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [sending, setSending] = useState(false)
  const listRef = useRef<HTMLDivElement | null>(null)

  const [questionData, setQuestionData] = useState<any>(null)

  // TODO: Check if user can edit exam (ADMIN or exam creator)
  const canEditExam = useMemo(() => {
    if (!questionData?.exam || !userRole || !currentUserId) return false

    const isAdmin = userRole.toLowerCase() === 'admin'
    const isExamCreator = questionData.exam.creatorId === currentUserId

    return isAdmin || isExamCreator
  }, [questionData?.exam, userRole, currentUserId])

  const fetchQuestionDetails = async () => {
    if (!questionId) return
    if (!examId) return
    try {
      const questionRes = await getQuestionDetails(examId, questionId)
      setQuestionData(questionRes.data)
      console.log('check ', questionRes.data)
    } catch (error) {
      console.error('Error fetching question details:', error)
      // toast.error('Không tải được thông tin câu hỏi')
    }
  }

  const fetchComments = async () => {
    if (!questionId) return
    setLoading(true)
    try {
      const res = await getQuestionDiscussion({ id: String(questionId) })
      setComments(res?.data || [])

      // Auto scroll to bottom after loading comments
      requestAnimationFrame(() => {
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
      })
    } catch (error) {
      console.error('Error fetching comments:', error)
      // toast.error('Không tải được bình luận')
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async () => {
    if (!questionId) return
    const content = newComment.trim()
    if (!content) return

    setSending(true)
    try {
      // Prepare payload with examId if available
      const payload: { comment: string, examId?: number } = { comment: content }
      if (examId) {
        payload.examId = examId
      }

      const res = await commentOnQuestion(String(questionId), payload)
      if (res?.data) {
        setComments(prev => [...prev, res.data])
        setNewComment('')

        // Auto scroll to bottom after sending
        requestAnimationFrame(() => {
          listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
        })

        toast.success(t('question_discussion_page.comment_sent_successfully'))
      }
    } catch (error) {
      console.error('Error sending comment:', error)
      toast.error(t('question_discussion_page.comment_failed'))
    } finally {
      setSending(false)
    }
  }

  useEffect(() => {
    if (!questionId) return
    fetchQuestionDetails()
    fetchComments()
  }, [questionId])

  useEffect(() => {
    // Validate required questionId - chỉ check state
    if (!state?.questionId && !state?.question?.id) {
      navigate(-1)
    }
  }, [state, navigate])

  const commentCount = comments.length

  return (
    <div className="w-full h-full min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <div className="text-xl md:text-2xl font-semibold text-gray-900">
                {t('question_discussion_page.title')}
                {questionData?.examQuestion ? ` #${questionData.examQuestion.order}` : ''}
                {questionData?.exam ? ` (${t('question_discussion_page.exam_label')}: ${questionData.exam.name})` : ''}
              </div>
              <div className="mt-0.5 text-sm text-gray-500 flex items-center gap-2">
                <ChatBubbleOutlineOutlinedIcon fontSize="small" className="text-teal-600" />
                <span><span className="font-medium text-gray-700">{commentCount}</span>{t('question_discussion_page.comment')}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            {t('exam_admin.header.back')}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Question panel */}
        <div className="lg:col-span-1">
          <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-gradient-to-r from-teal-50 to-transparent">
              <h2 className="font-semibold text-gray-800">{t('question_discussion_page.content_question')}</h2>
            </div>
            <div className="p-4">
              {questionData ? (
                <div className="space-y-4">
                  {/* Question Content */}
                  <div className="prose max-w-none">
                    <QuillShow htmlContent={questionData.content} />
                  </div>

                  {/* Question Details */}
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg space-y-3">
                    {/* Question Type */}
                    <div>
                      <strong>{t('question_discussion_page.type_question')}</strong>{' '}
                      {questionData.type === 'SINGLE_CHOICE' ? t('question_discussion_page.single_choice') : t('question_discussion_page.multiple_choice')}
                    </div>

                    {/* Instruction */}
                    {questionData.instruction && (
                      <div>
                        <strong>{t('question_discussion_page.instruction')}</strong>{' '}
                        <div className="inline-block align-top [&_p]:!my-0 [&_.ql-editor]:!p-0">
                          <QuillShow htmlContent={questionData.instruction} />
                        </div>
                      </div>
                    )}

                    <div>
                      <strong>{t('question_discussion_page.answer')}</strong>
                      <ul className="mt-2 space-y-2">
                        {[
                          { key: 'a', content: questionData.a },
                          { key: 'b', content: questionData.b },
                          { key: 'c', content: questionData.c },
                          { key: 'd', content: questionData.d },
                          { key: 'e', content: questionData.e },
                          { key: 'f', content: questionData.f },
                          { key: 'g', content: questionData.g },
                          { key: 'h', content: questionData.h },
                          { key: 'i', content: questionData.i },
                          { key: 'j', content: questionData.j },
                          { key: 'k', content: questionData.k },
                          { key: 'l', content: questionData.l },
                          { key: 'm', content: questionData.m },
                          { key: 'n', content: questionData.n },
                          { key: 'o', content: questionData.o },
                          { key: 'p', content: questionData.p }

                        ]
                          .filter(ans => ans.content && ans.content.trim())
                          .map((ans) => (
                            <li key={`option-${ans.key}`} className="flex items-start">
                              <div className="w-6 flex-shrink-0 mt-1">
                                {questionData.answer && questionData.answer.toLowerCase().includes(ans.key.toLowerCase()) ? (
                                  <span className="text-green-500 font-bold">✔</span>
                                ) : (
                                  <div className="h-5 w-5"></div>
                                )}
                              </div>
                              <div className="flex items-start ml-2">
                                <span className="font-medium mr-2">{ans.key.toUpperCase()}. </span>
                                <div className="[&_p]:!my-0 [&_.ql-editor]:!p-0">
                                  <QuillShow htmlContent={ans.content} />
                                </div>
                              </div>
                            </li>
                          ))}
                      </ul>
                    </div>
                    {/* Explanation */}
                    {questionData.explanation && (
                      <div>
                        <strong>{t('question_discussion_page.explanation')}</strong>{' '}
                        <div className="mt-1 [&_p]:!my-0 [&_.ql-editor]:!p-0">
                          <QuillShow htmlContent={questionData.explanation} />
                        </div>
                      </div>
                    )}

                  </div>

                  {/* TODO: Show button only if user can edit exam */}
                  {canEditExam && (
                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <button
                        onClick={() => navigate(`/exam-management/edit/${examId}`, {
                          state: { activeTab: 'compose' }
                        })}
                        className="w-full px-4 py-2 text-sm bg-teal-600 hover:bg-teal-700 text-white rounded-md transition-colors"
                        disabled={!examId}
                      >
                        {t('question_discussion_page.go_to_exam')}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Discussion panel */}
        <div className="lg:col-span-2">
          <div className="bg-white border rounded-xl shadow-sm flex flex-col h-[75vh]">
            <div className="p-4 border-b flex items-center justify-between bg-white">
              <h2 className="font-semibold text-gray-800">{t('question_discussion_page.comments')}</h2>
              <div>
                <Box>
                  {/* F5 button */}
                  <Tooltip title={t('exam_admin.statistic.refresh')}>
                    <button className="btn bg-blue-500 hover:bg-blue-400 rounded-sm" onClick={fetchComments} disabled={loading} >
                      <RefreshIcon className="text-white" />
                    </button>
                  </Tooltip>
                </Box>
              </div>
            </div>

            {/* Comments list */}
            <div ref={listRef} className="flex-1 overflow-auto p-4 space-y-3 bg-gray-50">
              {loading && (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex gap-3 animate-pulse">
                      <div className="h-10 w-10 rounded-full bg-gray-200" />
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                        <div className="h-3 bg-gray-200 rounded w-5/6 mb-1" />
                        <div className="h-3 bg-gray-200 rounded w-2/3" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!loading && comments.length === 0 && (
                <div className="text-center py-10">
                  <div className="mx-auto w-12 h-12 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mb-3">
                    <ChatBubbleOutlineOutlinedIcon />
                  </div>
                  <div className="text-gray-700 font-medium">{t('question_discussion_page.no_comments')}</div>
                  <div className="text-gray-500 text-sm">{t('question_discussion_page.first_comment')}</div>
                </div>
              )}

              {!loading && comments.map((c, idx) => {
                const key = `${c.id ?? 'noid'}-${c.updatedAt ?? idx}`
                return (
                  <div key={key} className="flex gap-3">
                    <div
                      className="flex-none w-10 h-10 rounded-full text-white flex items-center justify-center shadow"
                      style={{ background: colorFrom(c.username || `${c.firstName} ${c.lastName}`) }}
                      title={c.username ? `@${c.username}` : (c.firstName || '') + ' ' + (c.lastName || '')}
                    >
                      <span className="text-sm font-semibold">{initials(c)}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-gray-800">
                          {(c.firstName || '') + ' ' + (c.lastName || '')}
                          {c.username ? <span className="text-gray-500 text-sm"> (@{c.username})</span> : null}
                        </div>
                        <span className="text-xs text-gray-400">•</span>
                        <div className="text-xs text-gray-500">
                          {new Date(c.updatedAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="mt-1">
                        <div className="bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm">
                          <div className="text-gray-700 whitespace-pre-wrap break-words leading-relaxed">
                            {c.comment}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Composer */}
            <div className="p-3 border-t bg-white">
              <div className="mt-6 bg-white p-4 border rounded-lg shadow-md flex items-center">
                <div className="relative w-full flex items-center border border-gray-300 rounded-md">
                  <textarea
                    className="w-full py-2 px-4 pr-10 resize-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition placeholder-gray-500"
                    placeholder={`💬 ${t('question_discussion_page.write_new_comment')}`}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        if (!sending && newComment.trim()) void handleSend()
                      }
                    }}
                  />
                  <div className="absolute right-2 flex items-center space-x-2">
                    <span className="border-l h-5 border-gray-300"></span>
                    <button
                      className="text-blue-500 p-1 rounded-md transition flex items-center justify-center disabled:opacity-60"
                      onClick={handleSend}
                      disabled={!newComment.trim() || !questionId || sending}
                      title={t('question_discussion_page.send_button') || ''}
                    >
                      <SendIcon fontSize='medium' />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuestionDiscussionPage
