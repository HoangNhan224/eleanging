/* eslint-disable @typescript-eslint/indent */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { getExamByGroupId, getGroup, getUnsubmittedExams, checkAttemptAllowed, postSubmitUnsubmittedExam } from 'api/post/post.api'
import { toast } from 'react-toastify'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getFromLocalStorage } from 'utils/functions'
import Select from 'react-select'
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled'
import { Pagination } from '@mui/material'
import { styled } from '@mui/system'
import ModalComponent from 'components/Modal'
import ModalExamDetail from 'components/ModalExamDetail'
import { useTranslation } from 'react-i18next'
import { PacmanLoader } from 'react-spinners'

const GroupExamList = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const CustomPagination = styled(Pagination)({
    '.MuiPagination-ul': {
      display: 'inline-flex',
      fontSize: 'large',
      listStyle: 'none',
      margin: '10px',
      '@media (max-width: 600px)': {
        margin: '5px'
      }
    },
    '.MuiPaginationItem-root': {
      fontSize: 'large',
      fontWeight: 'bold',
      borderRadius: '4px',
      margin: '2px',
      border: '1px solid #cbd5e0',
      backgroundColor: 'white',
      color: '#718096',
      '&:hover': {
        backgroundColor: '#667eea',
        color: 'white'
      },
      '@media (max-width: 600px)': {
        margin: '0px'
      }
    },
    '.MuiPaginationItem-firstLast': {
      borderRadius: '4px'
    },
    '.MuiPaginationItem-previousNext': {
      borderRadius: '4px',
      margin: '10px',
      '@media (min-width: 600px)': {
        margin: '20px'
      },
      '@media (max-width: 600px)': {
        fontSize: 'medium',
        margin: '0px'
      }
    },
    '.MuiPaginationItem-page.Mui-selected': {
      color: '#667eea',
      fontWeight: 'bold',
      border: '2px solid #667eea',
      backgroundColor: 'white',
      '&:hover': {
        backgroundColor: '#667eea',
        color: 'white'
      }
    },
    '.MuiPaginationItem-ellipsis': {
      color: '#a0aec0',
      border: '1px solid #cbd5e0',
      backgroundColor: 'white',
      padding: '2px',
      margin: '0',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  })
  const [exams, setExams] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingGroups, setLoadingGroups] = useState(false)
  const [groups, setGroups] = useState<any[]>([])
  const [tokens, setTokens] = useState(getFromLocalStorage<any>('tokens'))
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const limit = 8
  const groupIdFromToken = tokens?.groupId
  const [selectedExam, setSelectedExam] = useState<any>(null)

  const [isViewModalExamDetail, setIsViewModalExamDetail] = useState(false)
  const [isOpenModalExam, setIsOpenModalExam] = useState(false)

  useEffect(() => {
    if (groups.length > 0) {
      setSelectedGroup(groupIdFromToken || groups[0].id)
    }
  }, [groups, groupIdFromToken])

  useEffect(() => {
    const handleStorageChange = () => {
      setTokens(getFromLocalStorage<any>('tokens'))
    }
    window.addEventListener('storage', handleStorageChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  useEffect(() => {
    const fetchGroups = async () => {
      setLoadingGroups(true)
      const res = await getGroup()
      if (res) {
        setGroups(res.data)
        if (res.data.length > 0) {
          setSelectedGroup(res.data[0].id)
        }
      }
      setLoadingGroups(false)
    }
    fetchGroups()
  }, [])
  const fetchExams = async (groupId = selectedGroup, pageNum = page) => {
    setLoading(true)
    const res = await getExamByGroupId({ groupId: groupId ?? undefined, page: pageNum, limit })
    if (res) {
      setExams(res.data.data)
      setTotalPages(res.data.totalPages)
    }
    setLoading(false)
  }
  useEffect(() => {
    if (!selectedGroup) return
    fetchExams(selectedGroup, page)
  }, [selectedGroup, page])

  const groupOptions = groups.map((group) => ({
    value: group.id,
    label: group.name
  }))

  const handleChangePagination = (value: number) => {
    setPage(value)
  }
  // const handleStartExam = (exam: any) => {
  //   setIsOpenModalExam(true)
  // }
  const handleOkModalExam = async (id: any) => {
    // if (exam.attempted >= exam.numberOfAttempt) {
    //   toast.error('Số lần thử đã hết')
    //   return
    // }
    try {
      navigate(`/group_exam_detail/${id}`, { state: { allowStart: true } })
    } catch (error) {
      console.error('Error fetching exam:', error)
    }
  }
  const handleCancelModalExam = () => {
    setIsOpenModalExam(false)
  }
  const handleViewExamDetail = (exam: any) => {
    setSelectedExam(exam)
    // navigate(`/group_exam_detail/${exam.id}`)
    setIsViewModalExamDetail(true)
  }
  const handleStartExam = async (exam: any) => {
  try {
    // 1. Kiểm tra bài chưa nộp
    const checkSubmitExamBefore = await getUnsubmittedExams(exam.id)
    if (checkSubmitExamBefore?.data?.unsubmitted === true) {
      const { status, timeRemaining, attempt } = checkSubmitExamBefore.data
      if (status === 'active' && timeRemaining > 0) {
        // Có bài chưa nộp và còn thời gian, tiếp tục bài cũ
        navigate(`/group_exam_detail/${exam.id}`, { state: { allowStart: true } })
        return
      } else {
        // Hết giờ, auto nộp bài cũ
        await postSubmitUnsubmittedExam(exam.id)
        // Kiểm tra còn lượt thi không
        await fetchExams()
        const checkAttempt = await checkAttemptAllowed({ id: exam.id })
        if (!checkAttempt.data.isAllowed) {
          toast.error(t('group_exam.toast.exam_timeout_no_attempts'))
          return
        }
      }
    } else {
      // Không có bài thi cũ, kiểm tra còn lượt thi không
      const checkAttempt = await checkAttemptAllowed({ id: exam.id })
      if (!checkAttempt.data.isAllowed) {
        toast.error(t('group_exam.toast.no_attempts_left'))
        return
      }
    }
    // Đến đây là chắc chắn còn lượt, cho phép bắt đầu mới
    navigate(`/group_exam_detail/${exam.id}`, { state: { allowStart: true } })
  } catch (error) {
    toast.error(t('group_exam.toast.cannot_start_exam'))
  }
}
  // Thêm hàm để kiểm tra exam có available không
  const isExamAvailable = (exam: any) => {
    if (exam?.publicDate) {
      const publicDate = new Date(exam.publicDate)
      const now = new Date()
      if (publicDate > now) {
        return false
      }
    }
    return true
  }
  return (
    <div className="min-h-screen bg-gradient-to-r bg-slate-50">
      <div className="flex flex-col items-center">
        <h1 className="text-xl my-2 text-gray-600">
          {t('group_exam.your_group')}: <span className="font-semibold text-gray-800">{groups.find(group => group.id === groupIdFromToken)?.name || t('group_exam.not_chosen_yet')}</span>
        </h1>
        <h1 className="text-2xl font-bold mb-6 text-gray-800">{t('group_exam.choose_group_to_view_your_group_exam')}</h1>
        <Select
          options={groupOptions}
          value={groupOptions.find(option => option.value === selectedGroup)}
          onChange={(option) => {
            setSelectedGroup(option?.value || null)
            setPage(1) // Reset lại trang khi đổi nhóm
          }}
          className="w-full max-w-sm mb-6"
        />
      </div>
      <div className='flex flex-col items-center justify-center'>
        <div className='w-11/12 flex mt-5'>
          {loading || loadingGroups
            ? (
              // <p className="text-lg text-blue-700 h-full text-center">{t('group_exam.loading')}</p>
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
            )
            : exams?.length > 0
              ? (
                <div className='flex flex-col items-center justify-center w-full'>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full items-center justify-center cursor-pointer">
                    {exams.map((exam) => (
                      <div
                        key={exam.id}
                        className="bg-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 rounded-lg overflow-hidden p-4"
                      >
                        <img
                          src={exam?.image && exam.image.trim()
                              ? `${process.env.REACT_APP_API}/uploads/exams/${exam.image}`
                              : 'https://res.cloudinary.com/djlegzpte/image/upload/v1753953155/pngwing.com_n1p7ho.png'}
                          alt="exam"
                          className="w-full h-44 object-cover rounded-md mb-3"
                        />
                        <h2 className="text-lg font-bold text-gray-800 mb-2">{exam?.name}</h2>
                        <div className="flex items-center mb-2">
                          <img
                            src={exam?.creatorAVT && exam.creatorAVT.trim()
                              ? `${process.env.REACT_APP_API}/uploads/avatars/${exam.creatorAVT}`
                              : `${process.env.REACT_APP_API}/uploads/avatars/avatardefault.png`}
                            alt="creator avatar"
                            className="w-8 h-8 rounded-full object-cover mr-2"
                          />
                          <span className="text-gray-700 text-sm">{exam?.creatorName}</span>
                        </div>
                        <p className="text-gray-600 text-sm mb-1">
                          <strong>{t('group_exam.public_date')}:</strong>{' '}
                          {exam?.publicDate ? new Date(exam.publicDate).toLocaleDateString('en-GB') : ''}
                        </p>
                        <div className="flex items-center text-gray-600 text-sm mb-1">
                          <AccessTimeFilledIcon className="text-gray-500 mr-1" />
                          <span>{exam?.durationInMinute} {t('group_exam.minutes')}</span>
                        </div>
                        <p className="text-gray-600 text-sm mb-1">
                          <strong>{t('group_exam.points_to_pass')}:</strong> {exam?.pointToPass}
                        </p>
                        <div className='flex flex-between p-1 space-x-3'>
                          <button
                            onClick={async () => await handleStartExam(exam)}
                            disabled={
                              // Điều kiện cũ: đã hết lượt thi
                              (exam?.attempted !== null && exam?.attempted >= exam?.numberOfAttempt) ||
                              // Điều kiện mới: publicDate chưa đến
                              !isExamAvailable(exam)
                            }
                            className={`mt-4 w-full ${
                              (exam?.attempted !== null && exam?.attempted >= exam?.numberOfAttempt) || !isExamAvailable(exam)
                                ? 'bg-red-400 cursor-not-allowed'
                                : 'bg-custom-button-enroll hover:bg-custom-button-enroll-hover'
                              } text-white font-semibold py-2 rounded-lg transition-all duration-300`}
                          >
                            {exam?.attempted !== null && exam?.attempted >= exam?.numberOfAttempt
                              ? t('group_exam.cant_do_exam')
                              : !isExamAvailable(exam)
                                ? t('group_exam.exam_not_available_yet')
                                : exam?.doThisExamBefore && !exam?.isUnfinished
                                  ? t('group_exam.do_again')
                                  : exam?.isUnfinished
                                    ? t('group_exam.continue_exam')
                                    : t('group_exam.do_exam')}
                          </button>
                          <button
                            onClick={() => handleViewExamDetail(exam)}
                            className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg transition-all duration-300"
                          >
                            {t('group_exam.view_detail')}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-center mt-8">
                    <CustomPagination
                      count={totalPages}
                      page={page}
                      onChange={(_, page) => handleChangePagination(page)}
                      boundaryCount={1}
                      siblingCount={1}
                    />
                  </div>
                </div>
              )
              : (
                <div className="flex justify-center items-center w-full h-96 mt-20">
                  <p className="text-lg text-gray-700">{t('group_exam.doesnt_have_exam')}</p>
                </div>
              )}
        </div>
      </div>
      <ModalComponent
        isOpen={isOpenModalExam}
        title={t('group_exam.confirm') as string}
        description={t('group_exam.sure_start_exam') as string}
        onClose={handleCancelModalExam}
        onOk={async () => {
          if (selectedExam?.id) {
            await handleOkModalExam(selectedExam.id)
          }
        }}
        onCancel={handleCancelModalExam}
      />

      <ModalExamDetail
        exam={selectedExam}
        modalOpen={isViewModalExamDetail}
        setModalOpen={setIsViewModalExamDetail}
      />
    </div>

  )
}

export default GroupExamList
