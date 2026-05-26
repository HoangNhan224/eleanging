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
import { Document, Page } from 'react-pdf'
import 'react-pdf/dist/esm/Page/TextLayer.css'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import { useLocation, useNavigate } from 'react-router-dom'
import { getCategoryLessionsByCourse, getLessionByCategory, getLessionById, getEnrollmentByUserId, getProgressByEnrollmentId, addProgress, checkUpdates, getFirstIncompleteLessionCourse, markCourseAsDone, createNotification, getCourseDetail } from 'api/post/post.api'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import TextSnippetIcon from '@mui/icons-material/TextSnippet'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import PlayCircleIcon from '@mui/icons-material/PlayCircle'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos'
import LockIcon from '@mui/icons-material/Lock'
import ArrowBackIosNewTwoToneIcon from '@mui/icons-material/ArrowBackIosNewTwoTone'
import { useTranslation } from 'react-i18next'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import NoteAltIcon from '@mui/icons-material/NoteAlt'
import HelpIcon from '@mui/icons-material/Help'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import 'react-circular-progressbar/dist/styles.css'
import { toast } from 'react-toastify'
import Tooltip from '@mui/material/Tooltip'
import MenuIcon from '@mui/icons-material/Menu'
import Comment from 'components/comment'

import ModalComponent from 'components/Modal'

import ROUTES from 'routes/constant'
import { getFromLocalStorage } from 'utils/functions'
import { useTheme } from 'services/styled-themes'
import Plyr, { APITypes } from 'plyr-react'
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
/**
 * Learning component manages and displays the details and content of a specific course and lessons in course.
 *
 * It includes lesson data, user enrollment, video playback, and various states for UI interaction.
 *
 * @author Canh
 * @component
 * @returns {JSX.Element} The rendered Learning component.
 *
 * @property {object} theme - The current theme retrieved from the application context.
 * @property {string} comment - The current value of the user's comment input.
 * @property {boolean} isCommentModalOpen - Indicates whether the comment modal is currently open.
 * @property {number} numPages - The number of pages in a PDF document (if applicable).
 * @property {object} location - The react-router-dom location object used for deriving courseID and navigation context.
 * @property {Function} navigate - The react-router-dom navigation function.
 * @property {any} lession - The current lesson data object.
 * @property {any} enrollData - Enrollment information for the current user and course.
 * @property {any[]} lessionCategories - An array of lesson categories associated with the course.
 * @property {any[]} lessions - An array of lessons for the current course.
 * @property {number[]} activeIndexes - An array of indices indicating which lesson categories are expanded.
 * @property {string|null} activeDrop - The currently active dropdown identifier for lesson categories.
 * @property {Array<{ lessionId: string, enrollmentId: any }>} courseProgress - User's progress through the course lessons.
 * @property {boolean} isExpanded - Indicates if all lesson categories are expanded.
 * @property {React.MutableRefObject<boolean>} watchRef - A ref tracking if a certain feature (e.g., video watch) is active.
 * @property {React.MutableRefObject<any>} pdfContainerRef - A ref to the container element for displaying PDF content.
 * @property {React.MutableRefObject<any>} tt - A generic ref object used for storing additional temporary data.
 * @property {Function} dispatch - The Redux dispatch function for updating global state.
 * @property {Array<{name: string, content: string}>} comments - An array of comment objects submitted by users.
 * @property {CourseData|null} courseData - The detailed data object for the currently viewed course.
 * @property {Plyr.SourceInfo|null} videoSrc - The source information for the video player.
 * @property {React.MutableRefObject<any>} playerRef - A ref to the Plyr video player instance.
 * @property {number} currentTime - The current playback time of the video in seconds.
 * @property {React.MutableRefObject<boolean>} isMounted - A ref used to track component mount status.
 * @property {object} videoOptions - Configuration options for the Plyr video player.
 * @property {boolean} isOpenModal - Indicates whether a generic modal (not the comment modal) is open.
 * @property {any} tokens - Authentication tokens from local storage.
 * @property {string|undefined} userId - The ID of the currently authenticated user derived from tokens.
 * @property {string} courseID - The unique identifier for the current course derived from the URL.
 */
const Learning = () => {
  const { theme } = useTheme()
  const [comment, setComment] = useState('')
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false)
  const [numPages, setNumPages] = useState<number>(1)
  const location = useLocation()
  const navigate = useNavigate()
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
  const [comments, setComments] = useState([
    { name: 'Toan', content: 'so good' },
    { name: 'Hien', content: 'great wrork!' },
    { name: 'Quoc', content: 'nice try' }
  ])
  const [courseData, setCourseData] = useState<CourseData | null>(null)

  const [videoSrc, setVideoSrc] = useState<any>(null)
  const playerRef = useRef<any>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const isMounted = useRef(false)
  const videoOptions = useMemo(() => ({
    controls: [
      'play',
      'rewind',
      'progress',
      'current-time',
      'mute',
      'volume',
      'fullscreen',
      'settings',
      'pip'
    ],
    settings: ['captions', 'quality', 'speed'],
    youtube: {
      noCookie: true,
      modestbranding: 1,
      rel: 0,
      showinfo: 0,
      iv_load_policy: 3,
      playsinline: 1,
      enablejsapi: 1,
    }
  }), [location.pathname])
  const [isOpenModal, setIsOpenModal] = useState(false)
  const [tokens, setTokens] = useState(getFromLocalStorage<any>('tokens'))
  const userId = tokens?.id
  const courseID = location.pathname.split('/')[2]
  /**
   * Updates the video source whenever the current lesson or the URL path changes.
   *
   * This effect ensures that the video player always displays the correct content
   * as the user navigates through lessons or the route changes.
   *
   * @author Canh
   */
  useEffect(() => {
    if (!lession) {
      setVideoSrc(null)
      return
    }
    setVideoSrc({
      type: 'video',
      sources: [{ src: lession.locationPath, provider: 'youtube' }],
    })
  }, [location.pathname, lession])
  /**
   * Synchronizes the currently displayed lesson based on changes in the URL, course progress,
   * and lesson availability. This effect is triggered whenever `location` or `courseProgress` changes.
   *
   * Extracts all lesson IDs from the `lessions` array (an array of arrays).
   * Determines the lesson ID from the URL query parameter (`id`).
   * If the current lesson matches the URL's lesson ID, no action is taken.
   * Fetches the first available lesson ID for the course if necessary.
   * Checks if the user has permission to view the targeted lesson based on `courseProgress`, `lessions`, and the first lesson ID.
   * If the user does not have permission, navigates to the first accessible lesson.
   * Otherwise, fetches and sets the new lesson data, updates the active dropdown and expanded categories.
   *
   * @author Canh
   */
  useEffect(() => {
    const fetchData = async () => {
      const lessonIds = lessions.flatMap((category) => category.map((lesson: any) => lesson.id))
      if (!enrollData || !lessions || lessonIds.length === 0) return
      const queryParams = new URLSearchParams(location.search)
      const newLessonId = Number(queryParams.get('id')) || 0
      if (lession?.id === newLessonId) {
        return
      }
      const firstLessonId = await fetchFirstLessonId(courseData?.id ?? '')
      if (!newLessonId) return
      const hasPermission = hasPermissionToViewLesson(newLessonId, courseProgress, lessions, firstLessonId)
      if (!hasPermission) {
        navigate(`?id=${firstLessonId}`, { state: { courseData }, replace: true })
      } else {
        const fetchedLession = await getLessionById({ id: Number(newLessonId) })
        if (fetchedLession?.data) {
          setActiveDrop(fetchedLession.data.name)
          if (fetchedLession.data.type !== 'MP4' && playerRef.current) {
            setLession(fetchedLession.data)
          } else {
            setLession(fetchedLession.data)
          }
          const categoryIndex = parts?.findIndex(part => part.name === fetchedLession.data.categoryLessionName)
          if (categoryIndex !== -1) {
            setActiveIndexes(prevIndexes => [...prevIndexes, categoryIndex])
          }
        }
      }
    }
    fetchData()
  }, [location, courseProgress])
  /**
   * Monitors and updates the user's progress for the currently displayed MP4 video lesson.
   * 
   * Checks if the current lesson is valid and of type MP4, and if a player instance is available.
   * Sets an interval that waits for the video to start playing, then attaches a `timeupdate` event listener.
   * Logs and updates the current playback time state.
   * Once the user reaches the midpoint of the video, removes the event listener and attempts to record the lesson's completion.
   * Displays a success toast if progress recording is successful.
   * Updates the course progress and determines if the entire course is completed.
   * If the course is completed, marks it as done, creates a completion notification, updates Redux, and shows a success toast.
   * If not completed, just logs the user's learning progress.
   * 
   * @author Canh
   */
  useEffect(() => {
    if (!lession || !playerRef.current || lession.type !== 'MP4') {
      console.error('No valid lesson or playerRef provided')
      return
    }
  
    const handleTimeUpdate = async () => {
      const newCurrentTime = playerRef.current?.plyr.currentTime || 0
      console.log('Current Time:', newCurrentTime)
      setCurrentTime(newCurrentTime)
  
      if (newCurrentTime > (playerRef.current.plyr.duration || 0) / 2) {
        playerRef.current.plyr.off('timeupdate', handleTimeUpdate)
        try {
          if (lession?.id) {
            const payload = {
              lessionId: lession?.id,
              enrollmentId: enrollData?.id
            }
            const response = await addProgress(payload)
            if (response) {
              toast.success(t('learning.toast_you_have_completed_this_video'))
            } else if (!response) {
              console.error('Error adding progress')
            }
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
          } else {
            console.error('Lesson ID is missing')
          }
        } catch (error) {
          // console.error('Error adding progress:', error)
        }
      }
    }
    const interval = setInterval(() => {
      if (playerRef.current?.plyr && !playerRef.current.plyr.paused) {
        playerRef.current.plyr.on('timeupdate', handleTimeUpdate)
        clearInterval(interval)
      }
    }, 2000)
  
    return () => {
      isMounted.current = false
      clearInterval(interval)
      if (playerRef.current?.plyr) {
        console.log('Removing timeupdate event listener')
        playerRef.current.plyr.off('timeupdate', handleTimeUpdate)
      }
    }
  }, [lession, location.pathname])
  /**
   * Fetches and updates the course details whenever the URL path changes.
   *
   * This effect retrieves the course data from the server using the current `courseID`.
   * Once the data is fetched, it updates the `courseData` state, ensuring the latest
   * course information is displayed as the user navigates through different routes.
   *
   * @author Canh
   */
  useEffect(() => {
    const fetchData = async () => {
      const response = await getCourseDetail({ id: courseID })

      setCourseData(response.data)
    }
    fetchData()
  }, [location.pathname])

  /**
   * Fetches and checks the user's first incomplete lesson and any available updates when the component mounts.
   *
   * Logs the current location for debugging purposes.
   * Determines the first incomplete lesson for the current course:
   *    If `courseData` is available, uses `courseData.id`.
   *    Otherwise, derives the course ID from the URL.
   * Retrieves the first incomplete lesson and checks if the user is currently on that lesson. If yes, no further action is taken.
   * If the user is authenticated (`userId`), checks for course updates via `checkUpdates`. If updates are found, opens a modal (`setIsOpenModal(true)`) to inform the user.
   *
   * @author Canh
   */
  useEffect(() => {
    console.log(location)
    const fetchUpdatesAndCheckLesson = async () => {
      let response = null
      if (courseData) { 
        response = await getFirstIncompleteLessionCourse(userId, courseData?.id)
      } else {
        response = await getFirstIncompleteLessionCourse(userId, location.pathname.split('/')[2])
      }
      const { id: lessonId } = response.data.lession
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
  /**
   * Handles the cancellation of the modal and navigates the user back to the course detail page.
   *
   * Navigates to the `/courses/:courseID` route, displaying the course details. Closes the currently open modal by setting `isOpenModal` to false.
   *
   * @author Canh
   * @returns {void}
   */
  const handleCancelModal = () => {
    navigate(`/courses/${courseData?.id}`)
    setIsOpenModal(false)
  }

  /**
   * Handles the confirmation action when the modal's "OK" button is clicked.
   *
   * Retrieves the first incomplete lesson for the current user and course.
   * Extracts the lesson ID from the response.
   * Navigates the user to the corresponding lesson page (`/learning/:courseID?id=:lessonID`).
   * Closes the modal by setting `isOpenModal` to false.
   *
   * @author Canh
   * @returns {void}
   */
  const handleOkModal = async () => {
    const response = await getFirstIncompleteLessionCourse(userId, courseData?.id ?? courseID)
    const { id: lessonId } = response.data.lession
    console.log('lessonId', lessonId)
    navigate(`/learning/${courseData?.id}?id=${lessonId}`)
    setIsOpenModal(false)
  }
  /**
   * Retrieves the file path for a given PDF filename.
   *
   * This function attempts to dynamically require the PDF file from the specified
   * `../../assets/uploads/lessions/` directory. If the file cannot be loaded, it logs
   * an error message and returns `null`.
   *
   * @author Canh
   * @param {string} fileName - The name of the PDF file to be imported.
   * @returns {string|null} The imported file path if successful, or `null` if not found or an error occurs.
   */
  const getPdfFilePath = (fileName: string) => {
    try {
      return `${process.env.REACT_APP_API}/uploads/lessions/${fileName}`
    } catch (error) {
      // toast.error(t('lesson.toast.failed_to_fetch_pdf'))
      return null
    }
  }
  /**
   * Fetches and returns the ID of the first lesson from the first category of the specified course.
   *
   * Retrieves the categories for the given course ID (`courseData?.id`).
   * Sorts the categories by their `order` property.
   * Selects the first category and then fetches all lessons under it.
   * Sorts the lessons by their `order` property and returns the ID of the first lesson.
   *
   * @author Canh
   * @param {string} id - The course ID (currently not directly used; relies on `courseData?.id`).
   * @returns {Promise<string|null>} The ID of the first lesson, or `null` if not found.
   */ 
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
          console.log('firstLessonOrder', sortedLessions[0].name)
          return firstLessonId
        }
      }
      return null
    } catch (error) {
      console.error('Error fetching first lesson:', error)
      return null
    }
  }
  /**
   * Fetches lesson categories, their corresponding lessons, and user progress data 
   * whenever `courseData` or `enrollData` become available.
   *
   * Retrieves all lesson categories for the current course.
   * For each category, fetches its associated lessons and stores them in `lessions`.
   * If enrollment data is available, retrieves the user's course progress and updates the state.
   *
   * This ensures the component has up-to-date lesson structures and user progress information 
   * as soon as the course data and enrollment data are known.
   *
   * @author Canh
   */ 

  useEffect(() => {
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
      }
    }
    if (courseData) {
      fetchData()
    }
  }, [courseData, enrollData])
  /**
   * Checks whether the user has permission to view a specified lesson based on their course progress.
   *
   * Maps through all lessons in `lessions` to create a flattened, sorted array of lessons (by order).
   * Determines if the `newLessonId` is valid and exists among the available lessons.
   * Finds the index of the new lesson in the ordered lesson array.
   * Verifies that all previous lessons have been completed (based on `courseProgress`).
   * If not all previous lessons are completed and the new lesson is not the first lesson, it shows a toast error and returns false. Otherwise, returns true.
   *
   * @author Canh
   * @param {number} newLessonId - The ID of the lesson the user is trying to access.
   * @param {Array} courseProgress - An array representing the user's completed lessons.
   * @param {Array} lessons - The array of lesson categories and their lessons.
   * @param {number} firstLessonId - The ID of the first lesson in the course.
   * @returns {boolean} - True if the user can view the lesson, otherwise false.
   */






























































  const hasPermissionToViewLesson = (newLessonId: number, courseProgress: any[], lessons: any[], firstLessonId: number) => {
    const drops = lessions.map(lessionArray => lessionArray.map((lession: { name: any, id: string, type: string, order: number, description: string, lessionCategoryId: number }) => ({ name: lession.name, id: lession.id, type: lession.type, order: lession.order, description: lession.description, lessionCategoryId: lession.lessionCategoryId })))
    const sortedDrops = drops.map(dropArray =>
      dropArray.sort((a: { order: number }, b: { order: number }) => a.order - b.order)
    )
    const flattenedSortedDrops = sortedDrops.flat()
    const lessonIds: number[] = flattenedSortedDrops.map(lesson => lesson.id)
    if (!lessonIds.includes(newLessonId)) {

      return false
    }
    console.log(lessonIds, 'lessonIds')
    const newLessonIndex = lessonIds.indexOf(newLessonId)
    console.log(newLessonIndex, 'newLessonIndex')
    const allPreviousLessonsCompleted = flattenedSortedDrops.slice(0, newLessonIndex).every(lesson => {
      const isCompleted = courseProgress.some(progress => progress.lessionId === lesson.id)
      if (isCompleted) {
        console.log(`Lesson ID ${lesson.id} is completed.`)
      }
      return isCompleted
    })

    console.log(allPreviousLessonsCompleted, 'allPreviousLessonsCompleted')
    if (!allPreviousLessonsCompleted && newLessonId !== firstLessonId) {
      toast.error(t('learning.need_to_complete_all_previous_lesson'))
      return false
    }
    return true
  }
  /**
   * Handles scroll events on the PDF container.
   *
   * When the user scrolls beyond half the content's height, it:
   * Calls `addProgressNoVideo()` to record the user's progress.
   * Removes the scroll event listener to prevent multiple triggers.
   *
   * This ensures that progress is recorded as soon as the user has scrolled through at least half of the PDF content.
   *
   * @author Canh
   * @returns {Promise<void>}
   */







































































  const handleScroll = async () => {
    const pdfContainer = pdfContainerRef.current as HTMLElement | null

    if (pdfContainer) {
      const { scrollTop, scrollHeight, clientHeight } = pdfContainer




      if (scrollTop + clientHeight >= scrollHeight / 2) {
        await addProgressNoVideo()
        pdfContainer.removeEventListener('scroll', handleScroll)
      }
    }
  }
  /**
   * Records the user's progress for non-MP4 lessons when the user has viewed at least half of the content.
   *
   * Checks if both `lession` and `enrollData` are available.
   * Constructs a payload with the current lesson and enrollment IDs.
   * Determines if the user has already completed this lesson by checking `courseProgress`.
   * If the lesson is not MP4 and not yet completed, records the progress via `addProgress`.
   * Updates `courseProgress` and determines if this is the last lesson of the course:
   *  - If it is the last lesson, marks the course as done and notifies the user.
   *  - If not, simply shows a success toast indicating the lesson is completed.
   *
   * @author Canh
   * @returns {Promise<void>}
   */ 
  const addProgressNoVideo = async () => {
    if (lession && enrollData) {
      const payload = {
        lessionId: lession?.id,
        enrollmentId: enrollData?.id
      }
      const queryParams = new URLSearchParams(location.search)
      const newLessonId = queryParams.get('id')
      // Kiểm tra xem bài học đã được xem chưa
      const isLessonCompleted = courseProgress.some(
        (progress) => Number(progress.lessionId) === Number(newLessonId)
      )
      if (lession.type !== 'MP4' && !isLessonCompleted) {
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
          // toast.success('Bạn đã học xong bài học này')
          toast.success(t('learning.toast_you_have_completed_this_document'))
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
              toast.success(t('learning.toast_you_have_completed_this_course'))
            }
          }
        } catch (error) {
          console.log('error hoc lai>>>', error)
        }
      }
    }
  }
  /**
   * Sets up the progress tracking for PDF-based lessons once their content is fully loaded.
   *
   * This effect runs whenever the current lesson (`lession`) changes (specifically `lession.id`).
   *
   * Behavior:
   * Periodically checks (`setInterval`) if the PDF content has a scrollable area.
   *    - If scrollable, attaches a `scroll` event listener to `pdfContainer` to monitor user progress.
   *    - If not scrollable, immediately records progress via `addProgressNoVideo()`.
   * Once the condition is met (either scrollable or not), clears the interval.
   * On component cleanup, clears the interval and removes the scroll event listener.
   *
   * @author Canh
   */ 

  useEffect(() => {  
    const pdfContainer = pdfContainerRef.current as HTMLElement | null

    const checkPDFLoaded = () => {
      if (pdfContainer) {
        if (pdfContainer.scrollHeight > pdfContainer.clientHeight) {
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
  }, [lession.id])
  /**
   * Handles successful loading of a PDF document by updating the number of pages.
   *
   * Once the document is successfully loaded, this function:
   * - Extracts the total page count (`numPages`) from the event parameters.
   * - Updates the component state to reflect the total number of pages available for viewing.
   *
   * @author Canh
   * @param {{ numPages: number | null }} param0 - The object containing the number of pages in the loaded document.
   * @returns {void}
   */









  function onDocumentLoadSuccess ({ numPages }: { numPages: number | null }) {
    setNumPages(numPages ?? 0)
  }
  /**
   * Closes the comment modal.
   *
   * This function simply sets the `isCommentModalOpen` state to false,
   * thereby hiding the comment modal when invoked.
   *
   * @author Canh
   * @returns {void}
   */
  const handleCloseCommentForm = () => {
    setIsCommentModalOpen(false)
  }
  /**
   * Handles the press action within the comment form.
   *
   * Currently, this function behaves similarly to `handleCloseCommentForm`
   * by setting `isCommentModalOpen` to false, effectively closing the comment modal.
   *
   * @author Canh
   * @returns {void}
   */

  const handlePress = () => {
    setIsCommentModalOpen(false)
  }
  const { t } = useTranslation()
  /**
   * Toggles the expansion state of the lesson categories.
   *
   * When invoked, this function flips the `isExpanded` state value, 
   * either expanding or collapsing all lesson categories as needed.
   *
   * @author Canh
   * @returns {void}
   */
  const handleExpandClick = () => {
    setIsExpanded(!isExpanded)
  }
  /**
   * Fetches the user's enrollment data for the current course when the course ID becomes available.
   *
   * Steps:
   * Checks if `courseData.id` is defined. If not, it returns immediately.
   * Logs the current course ID for debugging.
   * Retrieves all enrollments for the current user via `getEnrollmentByUserId()`.
   * Searches for an enrollment that matches the current course ID.
   *    - If found, updates the local state `enrollData` with that enrollment.
   *    - If not found, displays an error toast informing the user they are not enrolled and navigates back to the homepage.
   * Handles any errors by logging them and alerting the user.
   *
   * @author Canh
   */




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
        alert('An error occurred while fetching enrollment data.')
      }
    }

    fetchEnrollmentData()
  }, [courseData?.id])
  /**
   * Restricts body scrolling while the component is mounted, and restores it on unmount.
   *
   * When the component is mounted, it adds the `overflow-y-hidden` class to the document body,
   * preventing vertical scrolling. Upon unmount, it removes this class, restoring the default
   * scrolling behavior.
   *
   * @author Canh
   */

  useEffect(() => {
    document.body.classList.add('overflow-y-hidden')
    return () => {
      document.body.classList.remove('overflow-y-hidden')
    }
  }, [])
  /**
   * Scrolls the window to the top when the component mounts.
   *
   * This effect ensures the user starts viewing the page from the top
   * whenever they arrive at this component.
   *
   * @author Canh
   */
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const parsedDate = new Date(lession.updatedAt)
  const formattedDate = `${parsedDate.getMonth() + 1 < 10 ? '0' : ''}${parsedDate.getMonth() + 1}-${parsedDate.getDate() < 10 ? '0' : ''}${parsedDate.getDate()}-${parsedDate.getFullYear()}`

  const parts = lessionCategories.sort((a, b) => a.order - b.order).map(category => ({ id: category.id, name: category.name, order: category.order }))
  const drops = lessions.map(lessionArray => lessionArray.map((lession: { name: any, id: string, type: string, order: number, description: string, lessionCategoryId: number }) => ({ name: lession.name, id: lession.id, type: lession.type, order: lession.order, description: lession.description, lessionCategoryId: lession.lessionCategoryId })))
  const sortedDrops = drops.map(dropArray =>
    dropArray.sort((a: { order: number }, b: { order: number }) => a.order - b.order)
  )
  /**
   * Toggles the expansion state for a given category index.
   *
   * If the index is already active, it removes it from `activeIndexes`; otherwise, 
   * it adds the index to `activeIndexes`, expanding the corresponding category.
   *
   * @author Canh
   * @param {number} index - The index of the category to toggle.
   * @returns {void}
   */

  const handleClick = (index: number) => {
    setActiveIndexes(activeIndexes.includes(index)
      ? activeIndexes.filter(activeIndex => activeIndex !== index)
      : [...activeIndexes, index])
  }
  /**
   * Handles the selection of a lesson (drop) by navigating to its detail page and updating the UI state.
   *
   * Steps:
   * 1. Resets the PDF container's scroll position to the top.
   * 2. Determines if the user has completed all previous lessons in both the current category and previous categories.
   *    - Gathers all lessons before the selected lesson's order within the same category.
   *    - Gathers all lessons from previous categories.
   *    - Checks if each of these lessons has been completed based on `courseProgress`.
   * 3. If any previous lesson is incomplete, displays an error toast and stops execution.
   * 4. If all prerequisites are met:
   *    - Updates the currently active dropdown (`activeDrop`) to the selected lesson's name.
   *    - Navigates to the selected lesson's page by updating the URL query parameter (`id`).
   *
   * @author Canh
   * @param {object} drop - The selected lesson object containing name, id, order, and category order.
   * @param {string} drop.name - The name of the selected lesson.
   * @param {string} drop.id - The ID of the selected lesson.
   * @param {number} drop.order - The order of the selected lesson within its category.
   * @param {number} drop.categoryOrder - The order of the lesson's category.
   * @param {number} dropIndex - The index of the selected lesson in its category array.
   * @returns {void}
   */

  const handleDropClick = async (drop: { name: string, id: string, order: number, categoryOrder: number }, dropIndex: number) => {
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
    navigate(`?id=${drop.id}`, { state: { courseData }, replace: true })
  }
  /**
   * Navigates the user back to the course detail page.
   *
   * When triggered, this function uses `navigate` to redirect the user
   * to the `/courses/:courseID` route, where they can view the overall
   * course details and options.
   *
   * @author Canh
   * @returns {void}
   */
  const handleBackToCourse = () => {
    navigate(`/courses/${courseData?.id}`)
  }
  const totalCourses = lessions.reduce((total, currentCategoryCourses) => total + currentCategoryCourses.length, 0)
  const completedLessonsCount = courseProgress.length
  const percentage = parseFloat((completedLessonsCount / totalCourses * 100).toFixed(2))
  /**
   * Navigates to the previous lesson within the course.
   *
   * This function determines the user's current lesson based on `lession` and finds the previous lesson in sequence.
   * Steps:
   * 1. Identifies the current lesson's category and sorts that category's lessons by their order.
   * 2. If there is a previous lesson in the same category, navigates to it.
   * 3. If the current lesson is the first in its category, it moves to the previous category, selects the last lesson in that category, 
   *    expands the category if it isn't already, and navigates to that lesson.
   * 4. Updates `activeDrop` to reflect the currently active lesson.
   *
   * 
   * @author Canh
   * @returns {void}
   */

  const handlePreviousClick = () => {
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
      navigate(`?id=${previousLesson.id}`, { state: { courseData } })
    } else if (currentCategoryIndex > 0) {
      const previousCategoryIndex = currentCategoryIndex - 1

      // Sort lessons in the previous category by order
      const sortedPreviousCategoryLessions = [...lessions[previousCategoryIndex]].sort((a, b) => a.order - b.order)
      const previousLesson = sortedPreviousCategoryLessions[sortedPreviousCategoryLessions.length - 1]

      if (!activeIndexes.includes(previousCategoryIndex)) {
        setActiveIndexes(prevIndexes => [...prevIndexes, previousCategoryIndex])
      }
      navigate(`?id=${previousLesson.id}`, { state: { courseData }, replace: true })
    }
    setActiveDrop(lession.name)
  }
  /**
   * Navigates the user to the next lesson in the course sequence.
   *
   * Steps:
   * 1. Resets the PDF container scroll position to the top.
   * 2. Identifies the current lesson's category and sorts its lessons by order.
   * 3. Checks whether the next lesson exists within the same category:
   *    - If yes, verifies that the current lesson is completed (`courseProgress`).
   *      If not completed, displays a warning toast.
   *      If completed, navigates to the next lesson.
   * 4. If the current category is completed, attempts to move to the first lesson of the next category:
   *    - Checks if the current lesson is completed. If not, warns the user.
   *    - If completed, expands the next category if needed and navigates to its first lesson.
   * 5. If there are no more categories, it implies the user has reached the end of the course.
   *
   * @author Canh
   * @returns {void}
   */

  const handleNextClick = useCallback(async () => {
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

      navigate(`?id=${nextLesson.id}`, { state: { courseData }, replace: true })
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
        navigate(`?id=${nextLesson.id}`, { state: { courseData }, replace: true })
      } else {
        console.error('Next category does not contain any lessons')
      }
    } else {
      // toast.success('Congratulations! Course completed!')
      // toast.success(t('learning.toast_you_have_completed_this_course'))
    }
    setActiveDrop(lession.name)
  }, [lessions, lession, courseProgress, enrollData, activeIndexes])
  /**
   * Attaches a global keydown listener to handle keyboard shortcuts for progressing to the next lesson.
   *
   * Specifically, when the user presses `Ctrl + Enter`, it triggers the `handleNextClick()` function.
   * This provides a convenient keyboard shortcut for navigation.
   *
   * @author Canh
   * @returns {void}
   */

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
  /**
   * Overrides the browser's back button behavior when the component is mounted.
   *
   * When the user attempts to navigate back, it:
   * - Prevents the default back navigation.
   * - Redirects the user to the course detail page (`/courses/:courseID`) instead of the previous page.
   *
   * Uses a local `isMounted` flag to ensure the handler only applies while the component is mounted.
   * On cleanup, it restores the default `onpopstate` behavior.
   *
   * @author Canh
   * @returns {void}
   */

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
  /**
   * Generates memoized JSX content for the current lesson based on its type and state.
   *
   * This `useMemo` hook:
   * - Returns `null` if no `lession` is available.
   * - If the lesson is of type 'MP4', it renders a video player (Plyr) along with the lesson's metadata.
   * - If the lesson is not 'MP4' but has a `locationPath`, it displays the lesson details and loads a PDF document using `react-pdf`.
   * - Otherwise, it displays basic lesson information without media.
   *
   * This ensures that the content is efficiently re-rendered only when dependencies change, 
   * improving performance and maintaining a consistent user experience as lessons are navigated.
   *
   * @author Canh
   * @type {JSX.Element|null}
   */
  const memoizedContent = useMemo(() => {
    if (!lession) return null
    if (lession.type === 'MP4') {
      return (
        <div className='w-full object-cover sm:mb-36 mb-4'>
          <div className={`rounded-2xl overflow-hidden h-full ${isExpanded ? 'w-[calc(100vw-30px)]' : '2xl:h-[810px] xl:h-[620px] md:h-[600px] sm:h-[500px] h-[300px]'} `}>
            <div className="video-wrapper m-[10px]">
              {videoSrc && lession.locationPath && (
                <Plyr
                  ref={playerRef}
                  source={videoSrc}
                  options={videoOptions}
                  onError={(error) => console.error('Video Player Error:', error)}
                />
              )}
              {!videoSrc && (
                <div className="text-center text-red-500">Video không khả dụng.</div>
              )}
            </div>

          </div>
          <div className='h-full w-full'>
            <div className='md:pt-8 md:pl-20 sm:mt-7 sm:pl-10 pt-4 pl-4 w-11/12 lg:pr-16'>
              <div className='text-lg sm:text-2xl lg:text-3xl font-bold'>{lession?.name}</div>
              <div className='md:mt-3 mt-1 sm:mt-2 sm:text-balance text-sm'>{t('learning.updated_at')} {formattedDate}</div>
              <div className='font-bold md:mt-3 sm:mt-2 mt-1'>{lession?.description}</div>
              <div className='md:mt-3 sm:mt-2 mt-1'>{t('learning.description')}</div>
            </div>
          </div>
        </div>
      )
    }
  
    if (lession.type !== 'MP4' && lession.locationPath) {
      return (
        <div className='flex justify-center items-center flex-col lg:pt-14 pt-8 w-full'>
          <div className='text-3xl font-bold xl:w-3/5 lg:w-4/5 md:w-4/5'>{lession?.name}</div>
          <div className='mt-3 xl:w-3/5 lg:w-4/5 md:w-4/5'>{t('learning.updated_at')} {formattedDate}</div>
          <div className='font-bold mt-3 xl:w-3/5 lg:w-4/5 md:w-4/5'>{lession?.description}</div>
          <div className='mt-3 xl:w-3/5 lg:w-4/5 md:w-4/5'>{t('learning.description')}</div>
          <div className="flex items-center justify-center w-full h-auto lg:mb-36 mb-0 flex-col">
            <Document
              className={isCommentModalOpen ? 'pdf-opacity' : ''}
              file={getPdfFilePath(lession?.locationPath)}
              onLoadSuccess={onDocumentLoadSuccess}
            >
              {Array.from(new Array(numPages), (el, index) => (
                <React.Fragment key={`page_${index + 1}`}>
                  <Page
                    pageNumber={index + 1}
                    scale={1.5}
                    className="pdf-page"
                    renderMode="canvas"
                  />
                </React.Fragment>
              ))}
            </Document>
          </div>
        </div>
      )
    }













    return (
        <div className="lg:pt-14 pt-8 w-full justify-center items-center flex">
          <div className="xl:w-3/5 lg:w-4/5 md:w-4/5 w-full border-b border-gray-200 pb-5 px-2">
            <div className="text-3xl font-bold">{lession.name}</div>
            <div className="mt-3">{t('learning.updated_at')} {formattedDate}</div>
            <div className="font-bold mt-3">{lession.description}</div>
            <div className="mt-3">{t('learning.description')}</div>
          </div>
        </div>
    )
  }, [lession, videoSrc, videoOptions, formattedDate, t, isCommentModalOpen, onDocumentLoadSuccess, numPages, getPdfFilePath])

  return (
      <div className='flex h-screen overflow-hidden'>
      <div className="relative flex flex-col flex-1 lg:overflow-y-hidden overflow-y-auto custom-scrollbar overflow-x-hidden">
        {isCommentModalOpen && <div className="fixed inset-0 z-40  bg-black opacity-50" onClick={handlePress}></div>}
        <div className='lg:relative lg:flex'>
          <div className={`${isExpanded ? 'lg:w-full' : 'lg:w-9/12'} transition-all duration-700 ease-in-out`}>
            <div ref={pdfContainerRef} className='md:overflow-y-auto custom-scrollbar h-full lg:h-lvh' style={{ height: '100vh', overflowY: 'scroll' }}>
              {memoizedContent}

















































































              <div className={`z-50 right-0 w-[45%] bg-red-100 fixed flex justify-end inset-y-0 transition-transform ease-in-out duration-500 transform ${isCommentModalOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className='w-full h-full bg-white shadow-lg shadow-slate-950 overflow-y-auto custom-scrollbar'>
                  <div className='flex justify-end mr-4 pt-4'>
                    <button className='text-gray-400 hover:text-black' onClick={handleCloseCommentForm}>
                      <CloseRoundedIcon fontSize='large' />
                    </button>
                  </div>
                  <div className='pl-14'>
                    <div className='font-bold'>{comments.length} questions</div>
                    <div className='text-sm text-gray-500 italic mt-2'>(If you see any spam comments, please help by reporting them to the admin)</div>
                    <div className='flex mb-16 mt-10'>
                      <img src="https://picsum.photos/200/300" alt='avt' className='w-10 h-10 object-cover rounded-full'></img>
                      <input
                        className="w-4/5 bg-white-200 border-b border-gray-400 border-l-0 border-r-0 focus:outline-none ml-5 text-sm"
                        placeholder='Do you have any question?'
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        // onKeyDown={handleComment}
                      />
                    </div>
                    <div>
                      {[...comments].reverse().map((comment, index) => (
                        <Comment key={index} comment={comment} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={`${isExpanded ? 'lg:w-0' : 'lg:w-3/12'} transition-all duration-700 ease-in-out`}>
            <div className="lg:sticky lg:overflow-x-hidden xl:overflow-y-auto custom-scrollbar lg:shrink-0 border-t lg:border-t-0 lg:border-l border-slate-200 lg:w-full 2xl:h-[calc(100vh-120px)] xl:h-[calc(100vh-120px)] lg:h-[calc(100vh-120px)] xl:mb-0 lg:mb-56 mb-30">
              <div className='items-center pt-2'>
                <div className='ml-5 flex items-center border-b-2 p-1 font-bold text-lg cursor-pointer' onClick={handleBackToCourse}>
                  <ArrowBackIosNewTwoToneIcon className='font-bold' />
                  <img
                    src={courseData?.locationPath ? (`${process.env.REACT_APP_API}/uploads/courses/${courseData.locationPath}`) : ('/assets/images/user/delete.png')}
                    alt='course'
                    className='ml-3 w-8 h-8 rounded-lg'
                  />
                  <div className='ml-2'>{courseData?.name}</div>
                </div>
                <div className='ml-5 flex items-center border-b-2 p-1'>
                  <div className='font-bold w-1/4'>{completedLessonsCount}/{totalCourses} {t('learning.lession')}</div>
                  <div className='w-1/5 h-14 ml-5'>
                    <CircularProgressbar
                      className='w-14 h-14'
                      value={percentage}
                      text={`${percentage}%`}
                      styles={buildStyles({
                        strokeLinecap: 'round',
                        textSize: '22px',
                        pathTransitionDuration: 0.5,
                        pathColor: `rgba(82, 234, 99, ${percentage / 100})`,
                        textColor: theme === 'dark' ? '#FFFFFF' : '#000000',
                        trailColor: '#d6d6d6',
                        backgroundColor: '#3e98c7'
                      })}
                    />
                  </div>
                  <div className={`w-1/4 font-bold ml-5 cursor-pointer transition-colors duration-200 ${theme === 'dark' ? 'text-white hover:text-gray-300' : 'text-gray-600 hover:text-black'}`}>
                    <NoteAltIcon className={`mr-2 ${theme === 'dark' ? 'text-white' : 'text-gray-400'}`} />
                    {t('learning.note')}
                  </div>
                  <div className={`w-1/4 font-bold ml-5 cursor-pointer transition-colors duration-200 ${theme === 'dark' ? 'text-white hover:text-gray-300' : 'text-gray-600 hover:text-black'}`}>
                    <HelpIcon className={`mr-2 ${theme === 'dark' ? 'text-white' : 'text-gray-400'}`} />
                    {t('learning.help')}
                  </div>
                </div>
                <div className='font-bold ml-5 py-3'>{t('course_detail.course_content')}</div>
              </div>
              {parts.map((part, partOrder) => {
                const partIndex = lessionCategories.findIndex(category => category.name === part.name)
                const completedLessonsCount = lessions[partIndex]?.filter((lession: { id: string }) => courseProgress.some(progress => progress.lessionId === lession.id)).length

                return (
                  <div key={partOrder}>

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
                          .sort((a, b) => a.partOrder - b.partOrder || a.order - b.order)[courseProgress.length - 1]?.id

                        const lastLessonOfPreviousPartId = sortedDrops[partOrder - 1]?.[sortedDrops[partOrder - 1]?.length - 1]?.id

                        const lastLessonOfPreviousPartCompleted = isFirstLessonOfNextPart && lastCompletedLessonId === lastLessonOfPreviousPartId
                        // NGAY TRƯỚC HỌC RỒI THÌ AUTO UNLOKC
                        // const previousLessonCompleted = courseProgress.some(progress => progress.lessionId === sortedDrops[partOrder][dropIndexNumberValue - 1]?.id)

                        // TRONG TỪNG PART, TẤT CẢ BÀI HỌC TRƯỚC ĐÓ ĐÃ HỌC XONG THÌ MỚI MỞ KHÓA
                        // const allPreviousLessonsCompleted = sortedDrops[partOrder].slice(0, dropIndexNumberValue).every((drop: { id: string }) =>
                        //   courseProgress.some(progress => progress.lessionId === drop.id && progress.lessionId)
                        // )

                        // const completedLessonsBeforeCurrent = sortedDrops[partOrder].slice(0, dropIndexNumberValue).filter((drop: { id: string }) =>
                        //   courseProgress.some(progress => progress.lessionId === drop.id && progress.lessionId)
                        // ).map((drop: { id: any }) => drop.id)
                        // console.log(`Completed lessons before ${drop.name}`, completedLessonsBeforeCurrent, allPreviousLessonsCompleted)
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
                            className={`flex p-3 transition-colors duration-200 cursor-pointer pl-7 select-none ${isAllowedToView && allPreviousLessonsCompleted ? 'opacity-100' : 'opacity-50 pointer-events-none'} ${activeDrop === drop.name ? (theme === 'dark' ? 'bg-custom-bg-lesson text-slate-100 hover:bg-green-500' : 'bg-custom-bg-lesson hover:bg-green-500') : (theme === 'dark' ? 'bg-gray-900 text-gray-300 hover:bg-gray-800' : 'bg-white hover:bg-gray-200')}`}
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
            </div>
          </div>
        </div>
      </div>
      <div className={`w-full bottom-0 h-14 shadow-sm absolute z-50 ${theme === 'dark' ? 'bg-custom-control-learning' : 'bg-gray-200'}`}>
        <div className="overflow-auto h-full flex justify-center items-center px-4">
          <div className='flex justify-between'>
            <div
              className={`border border-transparent p-2 font-bold rounded-lg cursor-pointer hover:opacity-80 select-none lg:text-sm text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-black'
                }`}
              onClick={handlePreviousClick}
            >
              <ArrowBackIosIcon /> {t('learning.previous')}
            </div>
            <Tooltip title={<span className="lg:text-sm text-xs text-white">{t('learning.shortcut')}</span>} placement="top" arrow>
              <div
                className='border-2 border-green-500 text-green-500 p-2 font-bold rounded-lg cursor-pointer ml-4 hover:border-green-400 hover:bg-green-400 hover:text-white select-none lg:text-sm text-xs transition duration-500'
                onClick={handleNextClick}
              >
                {t('learning.next')} <ArrowForwardIosIcon />
              </div>
            </Tooltip>
          </div>
          <div className='flex items-center justify-center absolute right-2'>
            <div
              className='font-bold lg:text-xs lg:w-80 xl:text-sm xl:w-120 lg:block hidden overflow-hidden text-ellipsis whitespace-nowrap'
            >
              {lession.order}. {lession.name}
            </div>
            <div className='lg:flex hidden items-center rounded-full bg-white text-black w-9 h-9 ml-5 justify-center cursor-pointer' onClick={handleExpandClick}>
              {isExpanded ? <MenuIcon fontSize="medium" /> : <ArrowForwardIcon fontSize="medium" />}
            </div>
          </div>
        </div>
      </div>
      <ModalComponent
        isOpen={isOpenModal}
        title= {t('learning.continue_title') ?? 'Course updated'}
        description= {t('learning.continue_message') ?? 'Do you want to continue learning now?'}
        onClose={handleCancelModal}
        onOk={handleOkModal}
        onCancel={handleCancelModal}
      />
    </div>
  )
}
export default Learning