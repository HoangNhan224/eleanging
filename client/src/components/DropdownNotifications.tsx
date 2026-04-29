/* eslint-disable @typescript-eslint/prefer-optional-chain */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable array-callback-return */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* PAGE: UserPage
   ========================================================================== */
import React, { useState, useRef, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import Transition from '../utils/Transition'
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined'
import { setNotification, deleteNotification, selectNotifications, selectTotalNotifications, updateStatus, updateAllStatus, removeAllNotificationsSlice, clearNotifications, setTotal } from '../redux/notification/notifySlice'
import { getNotifications, readNotification, readAllNotification, markUnread, markAllUnread, removeNotification, removeAllNotification } from 'api/post/post.api'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import { PulseLoader } from 'react-spinners'
import CloseIcon from '@mui/icons-material/Close'
import CheckIcon from '@mui/icons-material/Check'
import LensIcon from '@mui/icons-material/Lens'
import NotificationsIcon from '@mui/icons-material/Notifications'
import { toast } from 'react-toastify'
import { useTheme } from 'services/styled-themes'

interface DropdownNotificationProps {
  align: string
}

function DropdownNotification ({ align }: DropdownNotificationProps) {
  const { theme } = useTheme()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdown = useRef<HTMLDivElement | null>(null)
  const trigger = useRef<HTMLButtonElement | null>(null)
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [openMenuId, setOpenMenuId] = useState<number | null>(null)
  const [isMainMenuOpen, setIsMainMenuOpen] = useState(false)
  const { t, i18n } = useTranslation()
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    return localStorage.getItem('selectedLanguage') ?? 'en'
  })
  useEffect(() => {
    setSelectedLanguage(localStorage.getItem('selectedLanguage') ?? 'en')
  }, [localStorage.getItem('selectedLanguage')])

  const toggleMenu = (id: number) => {
    setOpenMenuId(openMenuId === id ? null : id)
    setIsMainMenuOpen(false)
  }
  const toggleMainMenu = () => {
    setIsMainMenuOpen(!isMainMenuOpen)
    setOpenMenuId(null)
  }
  const dispatch = useDispatch()
  const notifications = useSelector((state: any) => selectNotifications(state))
  const total = useSelector((state: any) => selectTotalNotifications(state))

  const handleDeleteNotification = (id: string) => {
    dispatch(deleteNotification(id))
  }
  const handleUpdateUnreadStatus = (id: string) => {
    dispatch(updateStatus({ id, status: false }))
  }
  const handleUpdateMarkAsReadStatus = (id: string) => {
    dispatch(updateStatus({ id, status: true }))
  }

  // const reloadNotificationsFromStart = async () => {
  //   if (isFetching) {
  //     console.log('Already fetching, skipping reload')
  //     return
  //   }

  //   // Clear current notifications
  //   dispatch(clearNotifications())
  //   // Reset offset
  //   setOffset(0)
  //   setHasMore(true)
  //   setIsFetching(true)

  //   // Load first batch
  //   try {
  //     const res = await getNotifications(5, 0)
  //     if (res.data.notifications.length < 5) {
  //       setHasMore(false)
  //     } else {
  //       setHasMore(true)
  //     }
  //     dispatch(setTotal(res.data.total))

  //     const notifications = res.data.notifications.map((notification: { id: any, notificationId: any, status: any, userId: any, createdAt: any, updatedAt: any, Notification: { id: any, title: any, message: any, url: any, createdAt: any, updatedAt: any } }) => ({
  //       id: notification.id,
  //       notificationId: notification.notificationId,
  //       status: notification.status,
  //       userId: notification.userId,
  //       createdAt: notification.createdAt,
  //       updatedAt: notification.updatedAt,
  //       notificationDetails: {
  //         id: notification.Notification.id,
  //         title: notification.Notification.title,
  //         message: notification.Notification.message,
  //         url: notification.Notification.url,
  //         createdAt: notification.Notification.createdAt,
  //         updatedAt: notification.Notification.updatedAt
  //       }
  //     }))

  //     notifications.forEach((data: any) => {
  //       dispatch(setNotification(data))
  //     })

  //     setOffset(res.data.notifications.length as number)
  //   } catch (err) {
  //     console.error(err)
  //   } finally {
  //     setIsFetching(false)
  //   }
  // }

  const loadNotifications = async (isScroll: boolean = false) => {
    // Prevent multiple simultaneous requests
    if (isFetching) {
      console.log('Already fetching, skipping...')
      return
    }

    if (isScroll && !hasMore) {
      console.log('No more notifications to load')
      return
    }

    if (isScroll) {
      setIsLoading(true)
    }

    setIsFetching(true)

    try {
      console.log('Loading notifications with offset:', offset)
      const res = await getNotifications(5, offset)
      console.log('Received notifications:', res.data.notifications.length)

      if (res.data.notifications.length < 5) {
        setHasMore(false)
        console.log('No more notifications available')
      } else {
        setHasMore(true)
      }
      dispatch(setTotal(res.data.total))

      const notifications = res.data.notifications.map((notification: { id: any, notificationId: any, status: any, userId: any, createdAt: any, updatedAt: any, Notification: { id: any, title: any, message: any, url: any, createdAt: any, updatedAt: any } }) => ({
        id: notification.id,
        notificationId: notification.notificationId,
        status: notification.status,
        userId: notification.userId,
        createdAt: notification.createdAt,
        updatedAt: notification.updatedAt,
        notificationDetails: {
          id: notification.Notification.id,
          title: notification.Notification.title,
          message: notification.Notification.message,
          url: notification.Notification.url,
          createdAt: notification.Notification.createdAt,
          updatedAt: notification.Notification.updatedAt
        }
      }))

      notifications.forEach((data: any) => {
        dispatch(setNotification(data))
      })

      setOffset((prevOffset) => {
        const newOffset = prevOffset + (res.data.notifications.length as number)
        console.log('New offset:', newOffset)
        return newOffset
      })
    } catch (err) {
      console.error('Error loading notifications:', err)
    } finally {
      setIsFetching(false)
      if (isScroll) {
        setTimeout(() => {
          setIsLoading(false)
        }, 500)
      }
    }
  }

  useEffect(() => {
    loadNotifications(true)
  }, [])

  const handleScroll = (e: React.UIEvent<HTMLUListElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    const bottom = scrollHeight - scrollTop <= clientHeight + 10 // Add 10px threshold

    console.log('Scroll event:', { scrollTop, scrollHeight, clientHeight, bottom, hasMore, isFetching })

    if (bottom && hasMore && !isFetching) {
      console.log('Triggering load more notifications')
      loadNotifications(true)
    }
  }

  useEffect(() => {
    const clickHandler = ({ target }: { target: EventTarget | null }) => {
      if (!dropdown.current) return
      if (!dropdownOpen || dropdown.current?.contains(target as Node) || trigger.current?.contains(target as Node)) return
      setDropdownOpen(false)
      setIsMainMenuOpen(false)
      setOpenMenuId(null)
    }
    document.addEventListener('click', clickHandler)
    return () => document.removeEventListener('click', clickHandler)
  })

  useEffect(() => {
    const keyHandler = ({ keyCode }: { keyCode: number }) => {
      if (!dropdownOpen || keyCode !== 27) return
      setDropdownOpen(false)
      setIsMainMenuOpen(false)
      setOpenMenuId(null)
    }
    document.addEventListener('keydown', keyHandler)
    return () => document.removeEventListener('keydown', keyHandler)
  })
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
  const handleMarkAsRead = async (id: string) => {
    try {
      const response = await readNotification({ recipientsId: id })
      if (response) {
        handleUpdateMarkAsReadStatus(id)
        // Decrease total count by 1 if notification was unread
        const notification = notifications.find(n => n.id === id)
        if (notification && !notification.status) {
          dispatch(setTotal(Math.max(0, total - 1)))
        }
        setOpenMenuId(null)
      } else {
        console.error(t('notification.failed_to_mark_as_read'))
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleMarkAsUnread = async (id: string) => {
    try {
      const response = await markUnread({ recipientsId: id })
      if (response) {
        handleUpdateUnreadStatus(id)
        // Increase total count by 1 if notification was read
        const notification = notifications.find(n => n.id === id)
        if (notification && notification.status) {
          dispatch(setTotal(total + 1))
        }
        setOpenMenuId(null)
      } else {
        console.error(t('notification.failed_to_mark_as_unread'))
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleRemoveNotification = async (id: string) => {
    try {
      console.log('id', id)
      const response = await removeNotification({ recipientsId: id })
      if (response) {
        console.log('response', response)
        handleDeleteNotification(id)
        setOpenMenuId(null)
      } else {
        console.error(t('notification.failed_to_remove_notifications'))
      }
    } catch (err) {
      console.error(err)
    }
  }
  const handleRemoveAllNotifications = async () => {
    try {
      await removeAllNotification()
      dispatch(removeAllNotificationsSlice())
      setIsMainMenuOpen(false)
      setDropdownOpen(false)
      // toast.success(t('notification.all_notifications_removed'))
    } catch (err) {
      console.error(err)
    }
  }
  const handleMarkAllAsRead = async () => {
    try {
      const response = await readAllNotification()
      dispatch(updateAllStatus(true))
      // Update total from backend response
      if (response?.data?.total !== undefined) {
        dispatch(setTotal(response.data.total))
      } else {
        dispatch(setTotal(0))
      }
      setIsMainMenuOpen(false)
      // toast.success(t('notification.all_notifications_marked_as_read'))
    } catch (err) {
      console.error(err)
    }
  }
  const handleMarkAllAsUnread = async () => {
    try {
      const response = await markAllUnread()
      dispatch(updateAllStatus(false))
      // Update total from backend response
      if (response?.data?.total !== undefined) {
        dispatch(setTotal(response.data.total))
      }
      setIsMainMenuOpen(false)
      // toast.success(t('notification.all_notifications_marked_as_unread'))
    } catch (err) {
      console.error(err)
    }
  }

  const getStateForCommentNotification = (url: string | null | undefined) => {
    if (!url || !url.includes('/question/')) return undefined

    const examMatch = url.match(/\/exam\/(\d+)/)
    const questionMatch = url.match(/\/question\/(\d+)/)

    if (examMatch && questionMatch) {
      return {
        examId: parseInt(examMatch[1]),
        questionId: parseInt(questionMatch[1])
      }
    }
    return undefined
  }

  return (
    <div className="relative inline-flex">
      <button
        ref={trigger}
        className={`mx-2 w-8 h-8 flex items-center justify-center ${theme === 'light' ? 'bg-slate-100 hover:bg-slate-200' : ''} transition duration-150 rounded-full ${dropdownOpen && theme === 'light' ? 'bg-slate-200' : ''}`}
        aria-haspopup="true"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        aria-expanded={dropdownOpen}
      >
        <span className="sr-only">{t('homepage.notifications')}</span>
        {total > 0 && (
          <div className="absolute -top-1.5 left-7 w-auto px-1.5 bg-rose-500 font-bold border-2 border-white rounded-lg flex justify-center items-center text-xs text-white">
            {total}<br />
          </div>
        )}
        <NotificationsNoneOutlinedIcon sx={{ color: 'teal' }} />
      </button>

      <Transition
        className={`origin-top-right z-10 absolute top-full -mr-10 sm:mr-0 sm:min-w-96 min-w-72  bg-white border border-slate-200 py-1.5 rounded shadow-lg overflow-hidden mt-1 ${align === 'right' ? 'right-0' : 'left-0'}`}
        show={dropdownOpen}
        enter="transition ease-out duration-200 transform"
        enterStart="opacity-0 -translate-y-2"
        enterEnd="opacity-100 translate-y-0"
        leave="transition ease-out duration-200"
        leaveStart="opacity-100"
        leaveEnd="opacity-0"
      >
        <div
          ref={dropdown}
          onFocus={() => setDropdownOpen(true)}
          onBlur={() => setDropdownOpen(false)}
        >
          <div className="text-xs font-semibold text-slate-400 uppercase pt-1.5 pb-2 px-4 flex items-center justify-between">
            <div>{t('notification.notifications')}</div>
            <div className="relative">
              <MoreHorizIcon
                className="cursor-pointer rounded-full hover:bg-slate-200 mx-4"
                onClick={toggleMainMenu}
              />
              {isMainMenuOpen && (
                <div className="absolute right-0 mt-2 sm:w-72 w-40 bg-teal-200 shadow-2xl rounded-2xl border z-30">
                  <div className="absolute -top-2 right-5 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-teal-200"></div>
                  <ul className='m-2 text-xs text-slate-800 normal-case'>
                    <li className="px-4 py-2 hover:bg-slate-100 cursor-pointer font-bold rounded-2xl" onClick={async () => {
                      await handleMarkAllAsRead()
                    }}>
                      <CheckIcon className='mr-2' />{t('notification.mark_all_as_read')}
                    </li>
                    <li className="px-4 py-2 hover:bg-slate-100 cursor-pointer font-bold rounded-2xl" onClick={async () => {
                      await handleMarkAllAsUnread()
                    }}>
                      <NotificationsIcon className='mr-2' />{t('notification.mark_all_as_unread')}
                    </li>
                    <li className="px-4 py-2 hover:bg-slate-100 cursor-pointer font-bold rounded-2xl" onClick={async () => {
                      await handleRemoveAllNotifications()
                    }}>
                      <CloseIcon className='mr-2' />{t('notification.removed_all_notifications')}
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
          <ul className="h-128 overflow-y-auto" onScroll={handleScroll}>
            {notifications.map((notification, idx) => (
              <li key={`${notification.id}-${idx}`} className={`duration-300 border-b border-slate-200  ${isLoading ? '' : 'last: border-0'} flex items-center ${notification.status ? 'bg-white hover:bg-slate-100' : 'bg-slate-100'}`}>
                <Link
                  className='block py-2 px-4 transition w-5/6 space-y-2'
                  to={notification.notificationDetails.url}
                  state={getStateForCommentNotification(notification.notificationDetails.url)}
                  onClick={async () => {
                    setDropdownOpen(!dropdownOpen)
                    if (!notification.status) {
                      await handleMarkAsRead(notification.id)
                    }
                    console.log('notification', notification.notificationDetails.url)
                  }}
                >
                  <div className='flex justify-between'>
                    <div className='flex space-x-2 items-center'>
                      <img className='rounded-full w-10 h-10 bg-black' src='/assets/images/homePage/osyaberi_man.png'></img>
                      <span className="block font-bold text-black mb-2">
                        <span className="block font-bold text-black mb-2">
                          {selectedLanguage === 'vi' && notification.notificationDetails.title === 'Course completed'
                            ? 'Hoàn thành khóa học'
                            : selectedLanguage === 'vi' && notification.notificationDetails.title === 'New Lesson'
                              ? 'Bài học mới'
                              : selectedLanguage === 'vi' && notification.notificationDetails.title === 'Lesson content updated'
                                ? 'Cập nhật bài học'
                                : selectedLanguage === 'vi' && notification.notificationDetails.title === 'Exam completed'
                                  ? 'Hoàn thành bài thi'
                                  : selectedLanguage === 'vi' && notification.notificationDetails.title === 'Change Role'
                                    ? 'Thay đổi vai trò'
                                    : selectedLanguage === 'vi' && notification.notificationDetails.title === 'Change Permission'
                                      ? 'Thay đổi quyền'
                                      : selectedLanguage === 'vi' && notification.notificationDetails.title === 'Comment on Question'
                                        ? 'Bình luận về câu hỏi'
                                        : selectedLanguage === 'vi' && notification.notificationDetails.title === 'Reply from Exam Creator'
                                          ? 'Phản hồi từ người tạo bài thi'
                                          : selectedLanguage === 'vi' && notification.notificationDetails.title === 'New Course'
                                            ? 'Khóa học mới'
                                            : notification.notificationDetails.title}
                        </span>
                      </span>
                    </div>
                  </div>
                  <span className="block text-sm mb-2">
                    📣{' '}
                    {notification.notificationDetails.title === 'Course completed'
                      ? (
                          notification.notificationDetails.message.split(' ').map((word, index) => {
                            if (selectedLanguage === 'vi') {
                              if (word === 'Congratulations!') {
                                return (
                                <span key={index} className="font-medium text-slate-800">
                                  Chúc mừng!
                                </span>
                                )
                              }
                              if (word === 'completed!') {
                                return (
                                <span key={index} className="font-medium text-slate-800">
                                  đã hoàn thành
                                </span>
                                )
                              }
                            } else {
                              if (word === 'Congratulations!' || word === 'completed!') {
                                return (
                                <span key={index} className="font-medium text-slate-800">
                                  {word}
                                </span>
                                )
                              }
                            }
                            return (
                            <span key={index} className="font-bold text-slate-800">
                              {' '}{word}{' '}
                            </span>
                            )
                          })
                        )
                      : notification.notificationDetails.title === 'Comment on Question'
                        ? (() => {
                            const [commenterUsername, examName] = notification.notificationDetails.message.split('|')
                            return selectedLanguage === 'vi'
                              ? (
                          <>
                            <span className="font-bold text-slate-800">{commenterUsername}</span>
                            <span> đã bình luận về câu hỏi trong bài thi </span>
                            <span className="font-bold text-slate-800">"{examName}"</span>
                          </>
                                )
                              : (
                          <>
                            <span className="font-bold text-slate-800">{commenterUsername}</span>
                            <span> commented on the question in the exam </span>
                            <span className="font-bold text-slate-800">"{examName}"</span>
                          </>
                                )
                          })()
                        : notification.notificationDetails.title === 'Reply from Exam Creator'
                          ? (() => {
                              const [commenterUsername, examName] = notification.notificationDetails.message.split('|')
                              return selectedLanguage === 'vi'
                                ? (
                            <>
                              <span className="font-bold text-slate-800">{commenterUsername}</span>
                              <span> đã phản hồi bình luận của bạn trong bài thi </span>
                              <span className="font-bold text-slate-800">"{examName}"</span>
                            </>
                                  )
                                : (
                            <>
                              <span className="font-bold text-slate-800">{commenterUsername}</span>
                              <span> replied to your comment in the exam </span>
                              <span className="font-bold text-slate-800">"{examName}"</span>
                            </>
                                  )
                            })()
                          : notification.notificationDetails.title === 'Exam completed'
                            ? (() => {
                                const message = notification.notificationDetails.message
                                const isPassed = message.toLowerCase().includes('pass')
                                const isFailed = message.toLowerCase().includes('fail')
                                const regex = /exam\s(.+?)\son.*?(\d+)/i
                                const match = message.match(regex)
                                const examName = match?.[1] || ''
                                const attempt = match?.[2] || '1'
                                if (selectedLanguage === 'vi') {
                                  if (isPassed) {
                                    return (
                                <>
                                  <span>Chúc mừng! Bạn đã </span>
                                  <span className="font-bold text-green-600">vượt qua</span>
                                  <span> bài thi </span>
                                  <span className="font-bold text-slate-800">{examName}</span>
                                  <span> ở lần làm thứ </span>
                                  <span className="font-bold text-slate-800">{attempt}</span>
                                </>
                                    )
                                  } else if (isFailed) {
                                    return (
                                <>
                                  <span>Bạn đã </span>
                                  <span className="font-bold text-red-600">không vượt qua</span>
                                  <span> bài thi </span>
                                  <span className="font-bold text-slate-800">{examName}</span>
                                  <span> ở lần làm thứ </span>
                                  <span className="font-bold text-slate-800">{attempt}</span>
                                </>
                                    )
                                  }
                                } else {
                                  if (isPassed) {
                                    return (
                                <>
                                  <span>Congratulations! You have </span>
                                  <span className="font-bold text-green-600">passed</span>
                                  <span> the exam </span>
                                  <span className="font-bold text-slate-800">{examName}</span>
                                  <span> on attempt </span>
                                  <span className="font-bold text-slate-800">{attempt}</span>
                                </>
                                    )
                                  } else if (isFailed) {
                                    return (
                                <>
                                  <span>You have </span>
                                  <span className="font-bold text-red-600">failed</span>
                                  <span> the exam </span>
                                  <span className="font-bold text-slate-800">{examName}</span>
                                  <span> on attempt </span>
                                  <span className="font-bold text-slate-800">{attempt}</span>
                                </>
                                    )
                                  }
                                }
                                return <span>{message}</span>
                              })()
                            : notification.notificationDetails.title === 'New Course'
                              ? (() => {
                                  // Check if message contains date (format: "courseName"|date)
                                  const message = notification.notificationDetails.message
                                  const parts = message.split('|')

                                  if (parts.length === 2) {
                                    // Message with scheduled date
                                    const courseName = parts[0]
                                    const scheduleDate = parts[1]
                                    return (
                                      <>
                                        <span>{t('notification.the_course')}</span>
                                        <span className="font-bold text-slate-800"> {courseName} </span>
                                        <span>{t('notification.course_scheduled_at')}</span>
                                        <span className="font-bold text-slate-800"> {scheduleDate}</span>
                                      </>
                                    )
                                  } else {
                                    // Message without date (immediate publish)
                                    return (
                                      <>
                                        <span>{t('notification.the_course')}</span>
                                        <span className="font-bold text-slate-800"> {message} </span>
                                        <span>{t('notification.course_has_been_added')}</span>
                                      </>
                                    )
                                  }
                                })()
                              : notification.notificationDetails.title === 'New Lesson'
                                ? (
                            <>
                              <span>{t('notification.the_lesson')}</span>
                              <span className="font-bold text-slate-800"> {notification.notificationDetails.message} </span>
                              <span>{t('notification.has_been_added')}</span>
                            </>
                                  )
                                : notification.notificationDetails.title === 'Lesson content updated'
                                  ? (
                              <>
                                <span>{t('notification.the_lesson')}</span>
                                <span className="font-bold text-slate-800"> {notification.notificationDetails.message} </span>
                                <span>{t('notification.has_been_updated')}</span>
                              </>
                                    )
                                  : notification.notificationDetails.title === 'Change Role'
                                    ? (
                                  <>
                                    <span>{t('notification.your_role_has_been_changed')}</span>
                                  </>
                                      )
                                    : notification.notificationDetails.title === 'Change Permission'
                                      ? (
                                    <>
                                      <span>{t('notification.your_permission_has_been_changed')}</span>
                                    </>
                                        )
                                      : (
                                          notification.notificationDetails.message
                                        )}
                  </span>
                  {selectedLanguage === 'en'
                    ? <span className="block text-xs font-medium text-slate-400">
                      {new Date(notification.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                    : <span className="block text-xs font-medium text-slate-400">
                      {new Date(notification.createdAt).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  }

                </Link>
                {notification.status ? <div></div> : <LensIcon className='text-blue-300' fontSize='small' />}
                {notification.status ? <div></div> : <div className='rounded-full bg-teal-300'></div>}
                <div className="relative">
                  <MoreHorizIcon
                    className="cursor-pointer rounded-full hover:bg-slate-200 mx-4"
                    onClick={() => toggleMenu(parseInt(notification.id))}
                  />
                  {openMenuId === parseInt(notification.id) && (
                    <div className="absolute right-0 mt-2 w-72 bg-teal-200 shadow-2xl rounded-2xl border z-30">
                      <div className="absolute -top-2 right-5 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-teal-200"></div>
                      <ul className='m-2 text-xs text-slate-800'>
                        <li
                          className={`px-4 py-2 cursor-pointer font-bold rounded-2xl ${notification.status ? 'cursor-not-allowed opacity-50' : 'hover:bg-slate-100'}`}
                          onClick={async () => {
                            if (!notification.status) {
                              console.log('notification.id', notification.id)
                              await handleMarkAsRead(notification.id)
                            }
                          }}
                        >
                          <CheckIcon className='mr-2' />{t('notification.mark_as_read')}
                        </li>
                        <li
                          className={`px-4 py-2  cursor-pointer font-bold rounded-2xl ${notification.status ? 'hover:bg-slate-100' : 'cursor-not-allowed opacity-50'}`}
                          onClick={async () => {
                            if (notification.status) {
                              await handleMarkAsUnread(notification.id)
                            }
                          }}
                        >
                          <NotificationsIcon className='mr-2' />{t('notification.mark_as_unread')}
                        </li>
                        <li
                          className='px-4 py-2 hover:bg-slate-100 cursor-pointer font-bold rounded-2xl'
                          onClick={async () => {
                            await handleRemoveNotification(notification.id)
                          }}
                        >
                          <CloseIcon className='mr-2' />{t('notification.removed_notification')}
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
          {isLoading && (
            <PulseLoader
              className="flex justify-center items-center w-full mt-20 text-center"
              color="#000000"
              cssOverride={{
                display: 'block',
                margin: '0 auto',
                borderColor: 'blue'
              }}
              loading
              speedMultiplier={1}
              size={10}
            />
          )}
        </div>
      </Transition>
    </div>
  )
}

export default DropdownNotification
