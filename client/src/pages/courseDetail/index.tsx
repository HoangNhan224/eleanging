/* eslint-disable multiline-ternary */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/prefer-optional-chain */
/* eslint-disable @typescript-eslint/no-base-to-string */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/consistent-type-assertions */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-redeclare */
import React, { useCallback, useEffect, useState, useMemo, useRef } from 'react'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import PlayCircleIcon from '@mui/icons-material/PlayCircle'
import DoneIcon from '@mui/icons-material/Done'
import TextSnippetIcon from '@mui/icons-material/TextSnippet'
import TheatersIcon from '@mui/icons-material/Theaters'
import BatteryChargingFullTwoToneIcon from '@mui/icons-material/BatteryChargingFullTwoTone'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { getFromLocalStorage } from 'utils/functions'
import { getCourseDetail, getCategoryLessionsByCourse, getLessionByCategory, addEnrollments, getEnrollmentByUserId, getExamByCourseId } from 'api/post/post.api'
import TimerIcon from '@mui/icons-material/Timer'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import ShareIcon from '@mui/icons-material/Share'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import KeyIcon from '@mui/icons-material/Key'
import AssignmentReturnedIcon from '@mui/icons-material/AssignmentReturned'
import SchoolIcon from '@mui/icons-material/School'
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt'
import StyleIcon from '@mui/icons-material/Style'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import YouTube from 'react-youtube'
import { useTheme } from 'services/styled-themes'
import Plyr, { APITypes } from 'plyr-react'
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks'
import ModalComponent from 'components/Modal'
import { toast } from 'react-toastify'

export interface IDetail {
  description?: string
  id?: string
  name?: string
  durationInMinute?: number | 0
  summary?: string
  assignedBy?: string
  startDate?: Date
  endDate?: Date
  locationPath?: string
  prepare?: string
  price?: number
  categoryCourseId?: string
  categoryCourseName?: string
  exam?: {
    name: string
    numberOfAttempt: number
    description: string
  }
}
export enum ModalType {
  SUBMIT = 'submit',
  FAIL = 'fail',
  ALREADY_ENROLLED = 'already_enrolled'
}
export interface Lesson {
  locationPath: string
}
/**
 * CourseDetail component displays detailed information about a specific course.
 *
 * This component fetches and displays course details, including the course overview, content, requirements,
 * and related lessons. It supports enrollment functionality, video playback, and handles various states such as
 * loading, modal visibility, and user interactions.
 *
 * @author Canh
 * @component
 * @returns {JSX.Element} The rendered CourseDetail component.
 *
 * @property {object} theme - The current theme of the application.
 * @property {object} location - The location object from react-router-dom.
 * @property {string} assignedBy - The user who assigned the course.
 * @property {object} params - The route parameters from react-router-dom.
 * @property {IDetail} data - The state for storing course details.
 * @property {boolean} isOpenModal - The state for modal visibility.
 * @property {ModalType} modalType - The type of modal to display.
 * @property {string | null} courseLession - The current course lesson.
 * @property {any} enrollDataa - The enrollment data.
 * @property {any[]} lessionCategories - The list of lesson categories.
 * @property {any[]} lessions - The list of lessons.
 * @property {number[]} activeIndexes - The indexes of active (expanded) items.
 * @property {boolean} isExpanded - Indicates if all items are expanded.
 * @property {object} dataRef - A ref to store the current course data.
 * @property {object} courseLessionRef - A ref to store the current course lesson.
 * @property {object} opts - The options for the YouTube player.
 * @property {Function} t - The translation function from react-i18next.
 * @property {Function} navigate - The navigation function from react-router-dom.
 * @property {Lesson | null} firstLessonMP4 - The first lesson with MP4 type.
 */
const CourseDetail = () => {
  const { theme } = useTheme()
  const location = useLocation()
  const assignedBy = location.state?.assignedBy
  const creatorAVT = location.state?.creatorAVT
  const params = useParams()
  const [data, setData] = useState<IDetail>({} as IDetail)
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false)
  const [modalType, setModalType] = useState<ModalType>(ModalType.SUBMIT)
  const [courseLession, setCourseLession] = useState<string | null>(null)
  const [enrollDataa, setEnrollData] = useState<any>(null)
  const [lessionCategories, setLessionCategories] = useState<any[]>([])
  const [lessions, setLessions] = useState<any[]>([])
  const [activeIndexes, setActiveIndexes] = useState<number[]>([])
  const [isExpanded, setIsExpanded] = useState(false)
  const dataRef = useRef(data)
  const courseLessionRef = useRef(courseLession)
  const [videoSrc, setVideoSrc] = useState<any>(null)
  const playerRef = useRef<any>(null)
  const [isVideoError, setIsVideoError] = useState(false)
  const [loading, setLoading] = useState(false)
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
      origin: window.location.origin,
      noCookie: true,
      modestbranding: 1,
      rel: 0,
      showinfo: 0,
      iv_load_policy: 3,
      playsinline: 1,
      enablejsapi: 1
    }
  }), [data])
  // const [firstLessonMP4, setFirstLessonMP4] = useState<Lesson | null>(null)
  const [firstLessonMP4, setFirstLessonMP4] = useState<Lesson | null | undefined>(undefined)
  // const [exam, setExam] = useState<any>(null)
  /**
 * Fetches the exam data based on the course ID when the course ID parameter changes.
 * The exam data is fetched and stored in the `exam` state variable.
 *
 * @author Canh
 * @param {React.ChangeEvent<HTMLInputElement>} event - The change event from the start date input.
 */
  // useEffect(() => {
  //   const fetchExamData = async () => {
  //     const response = await getExamByCourseId({ courseId: params?.id })
  //     console.log(response.data)
  //     setExam(response.data)
  //   }
  //   fetchExamData()
  // }, [params?.id])
  useEffect(() => {
    if (firstLessonMP4) {
      const fetchVideoSrc = async () => {
        if (!data) {
          console.log('No data provided')
          return
        }

        try {
          console.log('Fetching video source:', firstLessonMP4.locationPath)
          setVideoSrc({
            type: 'video',
            sources: [
              {
                src: firstLessonMP4.locationPath,
                provider: 'youtube'
              }
            ]
          })
        } catch (error) {
          console.error('Error fetching video source:', error)
        }
      }

      fetchVideoSrc()
    }
  }, [firstLessonMP4])
  const opts = {
    height: '750',
    width: '100%',
    playerVars: {
      autoplay: 0,
      allowFullscreen: true,
      rel: 0
    },
    rel: 0
  }
  const { t } = useTranslation()
  /**
 * Updates the references with the latest data and course lesson.
 *
 * This useEffect hook assigns the current values of `data` and `courseLession`
 * to their respective refs whenever either of them changes.
 *
 * @author Canh
 */
  useEffect(() => {
    dataRef.current = data
    courseLessionRef.current = courseLession
  }, [data, courseLession])
  /**
 * Generates the price text for the item.
 *
 * Uses `useMemo` to return the formatted price string. If the price is not zero,
 * it returns the price followed by a dollar sign. If the price is zero, it returns
 * a localized string indicating that the item is free.
 *
 * @author Canh
 * @returns {string} The formatted price text.
 */
  const priceText = useMemo(() => {
    if (Number(data.price) !== 0) {
      return (
        `${data.price} $`
      )
    }
    return t('homepage.free')
  }, [data.price])

  const navigate = useNavigate()
  /**
   * Handles the confirmation action for the modal.
   *
   * This function checks the type of the modal. If the modal type is `FAIL`, it closes
   * the modal without further actions. Otherwise, it triggers the enrollment click
   * handler to proceed with the action.
   *
   * @author Canh
   */
  const handleOkModal = useCallback(() => {
    if (modalType === ModalType.FAIL) {
      setIsOpenModal(false)
      return
    }
    handleEnrollClick()
  }, [modalType])
  /**
   * Handles course enrollment.
   *
   * Checks if a course lesson reference exists. If the modal indicates the user is
   * already enrolled, it navigates to the lesson. Otherwise, it attempts to enroll
   * the user and navigates on success, logging errors if the process fails.
   *
   * @author Canh
   */
  const handleEnrollClick = async () => {
    if (courseLessionRef.current) {
      const payload = { courseId: dataRef.current.id }

      try {
        if (modalType === ModalType.ALREADY_ENROLLED) {
          navigate(courseLessionRef.current, {
            state: { courseData: dataRef.current }
          })
        } else {
          const response = await addEnrollments(payload.courseId)
          if (response.status === 200) {
            navigate(courseLessionRef.current, {
              state: { courseData: dataRef.current }
            })
          } else {
            console.error('Failed to enroll in course')
          }
        }
      } catch (error) {
        console.error('An error occurred while enrolling in the course:', error)
      }
    }
  }
  /**
 * Opens the modal.
 *
 * This function sets the modal state to open when called.
 *
 * @author Canh
 */
  const handleOpenModal = async () => {
    setIsOpenModal(true)
  }
  /**
 * Checks the user's enrollment status when the course ID changes.
 *
 * Fetches enrollments and updates the modal type based on whether
 * the user is already enrolled in the current course. Logs errors if any occur.
 *
 * @author Canh
 * @returns {void}
 */
  useEffect(() => {
    const checkEnrollment = async () => {
      try {
        const enrollments = await getEnrollmentByUserId()
        const enrollment = enrollments.data.find((enrollment: { courseId: string | undefined }) => enrollment.courseId === dataRef.current.id)
        if (enrollment) {
          setModalType(ModalType.ALREADY_ENROLLED)
          setEnrollData(enrollment)
        } else {
          setModalType(ModalType.SUBMIT)
        }
      } catch (error) {
        console.error('An error occurred while checking enrollment:', error)
      }
    }

    if (data.id) {
      checkEnrollment()
    }
  }, [data.id])

  /**
 * Generates the confirmation message based on the modal type.
 *
 * Returns an empty string if no modal type is set. If the user is already enrolled,
 * it prompts to continue the course; otherwise, it confirms enrollment.
 *
 * @author Canh
 * @returns {string} The confirmation message.
 */
  const confirmMessage: string = useMemo(() => {
    if (!modalType) return ''
    else if (modalType === ModalType.ALREADY_ENROLLED) {
      return t('course_detail.continued_course')
    } else return t('course_detail.enroll_confirm')
  }, [modalType])

  /**
 * Fetches course details based on the provided ID.
 *
 * This function retrieves course data and updates the state. If no data is found
 * or an error occurs, it navigates to an error page.
 *
 * @author Canh
 * @param {string} [id] - The ID of the course to fetch details for.
 * @returns {Promise<void>}
 */
  const getData = useCallback(
    async (id?: string) => {
      try {
        setLoading(true)
        const courseData = await getCourseDetail({ id })
        if (courseData) {
          setData(courseData.data)
        } else {
          navigate('/error', {
            replace: true
          })
        }
      } catch (e) {
        console.log(e)
        navigate('/error', {
          replace: true
        })
      } finally {
        setLoading(false)
      }
    },
    []
  )

  /**
 * Fetches course data and scrolls to the top when the component mounts or the ID changes.
 *
 * This effect triggers when the course ID is available, scrolling to the top of the page
 * and calling the `getData` function to fetch course details.
 *
 * @author Canh
 * @returns {void}
 */
  useEffect(() => {
    if (params?.id) {
      window.scrollTo(0, 0)
      getData(params?.id)
    }
  }, [getData, params?.id])
  /**
   * Saves course data to local storage when it changes.
   *
   * This effect updates the local storage with the current course data whenever
   * the `data` variable is updated.
   *
   * @author Canh
   * @returns {void}
   */
  useEffect(() => {
    if (data) {
      localStorage.setItem('courseData', JSON.stringify(data))
    }
  }, [data])

  /**
 * Fetches lesson categories and lessons for the current course.
 *
 * This effect triggers when the course ID changes. It retrieves lesson categories
 * and their corresponding lessons, sorts them by part order, and groups them
 * by category. It also sets the first lesson's ID for navigation and identifies
 * the first MP4 lesson if available.
 *
 * @author Canh
 * @returns {void}
 */
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const fetchedLessonCategories = await getCategoryLessionsByCourse({ id: data.id })
        setLessionCategories(fetchedLessonCategories.data)
        const promises = fetchedLessonCategories.data.map(async (category: { id: string }) => {
          const lessions = await getLessionByCategory({ id: category.id })
          return lessions.data
        })
        const lessonsDataArray = await Promise.all(promises)
        setLessions(lessonsDataArray)
        const flattenedLessons = lessonsDataArray.flat()
        // sortedLessons và group lessons code như cũ
        const sortedLessons = flattenedLessons
          .map(lesson => {
            const part = parts.find(p => p.id === lesson.lessonCategoryId)
            return {
              ...lesson,
              partOrder: part ? part.order : Infinity
            }
          })
          .sort((a, b) => a.partOrder - b.partOrder || a.order - b.order)

        let counter = 0
        const lessonsGroupedByCategory = sortedLessons.reduce((acc, lesson) => {
          const existingKey = Object.keys(acc).find(key => acc[key][0]?.lessonCategoryId === lesson.lessonCategoryId)
          if (existingKey !== undefined) {
            acc[existingKey].push(lesson)
          } else {
            acc[counter] = [lesson]
            counter++
          }
          return acc
        }, {})
        if (Object.keys(lessonsGroupedByCategory).length > 0) {
          const firstLessonId = lessonsGroupedByCategory[0][0].id
          setCourseLession(`/learning/${data.id ?? ''}?id=${firstLessonId}`)
        }
        // Fix logic: chỉ set null nếu đã fetch xong và không có video
        const firstMP4Lesson = flattenedLessons.find(lesson => lesson.type === 'MP4')
        if (firstMP4Lesson) {
          setFirstLessonMP4(firstMP4Lesson)
        } else {
          setFirstLessonMP4(null)
        }
      } catch (err) {
        setFirstLessonMP4(null)
      } finally {
        setLoading(false)
      }
    }
    if (data.id) {
      fetchData()
    }
    // eslint-disable-next-line
  }, [data.id])
  // useEffect(() => {
  //   const fetchData = async () => {
  //     const fetchedLessonCategories = await getCategoryLessionsByCourse({ id: data.id })
  //     setLessionCategories(fetchedLessonCategories.data)
  //     const promises = fetchedLessonCategories.data.map(async (category: { id: string }) => {
  //       const lessions = await getLessionByCategory({ id: category.id })
  //       return lessions.data
  //     })
  //     const lessonsDataArray = await Promise.all(promises)
  //     setLessions(lessonsDataArray)
  //     const flattenedLessons = lessonsDataArray.flat()
  //     const sortedLessons = flattenedLessons
  //       .map(lesson => {
  //         const part = parts.find(p => p.id === lesson.lessonCategoryId)
  //         return {
  //           ...lesson,
  //           partOrder: part ? part.order : Infinity
  //         }
  //       })
  //       .sort((a, b) => a.partOrder - b.partOrder || a.order - b.order)

  //     let counter = 0
  //     const lessonsGroupedByCategory = sortedLessons.reduce((acc, lesson) => {
  //       const existingKey = Object.keys(acc).find(key => acc[key][0]?.lessonCategoryId === lesson.lessonCategoryId)
  //       if (existingKey !== undefined) {
  //         acc[existingKey].push(lesson)
  //       } else {
  //         acc[counter] = [lesson]
  //         counter++
  //       }
  //       return acc
  //     }, {})
  //     if (Object.keys(lessonsGroupedByCategory).length > 0) {
  //       const firstLessonId = lessonsGroupedByCategory[0][0].id
  //       setCourseLession(`/learning/${data.id ?? ''}?id=${firstLessonId}`)
  //     }
  //     const firstMP4Lesson = flattenedLessons.find(lesson => lesson.type === 'MP4')
  //     if (firstMP4Lesson) {
  //       setFirstLessonMP4(firstMP4Lesson)
  //     }
  //   }
  //   if (data.id) {
  //     fetchData()
  //   }
  // }, [data.id])

  // Sort lesson categories by their order and create a new array with id, name, and order properties.
  const parts = lessionCategories.sort((a, b) => a.order - b.order).map(category => ({
    id: category.id,
    name: category.name,
    order: category.order
  }))

  // Flatten the lessons array for easier processing.
  const flattenedLessons = lessions.flat()

  // Map each lesson to include its category order, then sort lessons first by partOrder and then by order.
  const sortedLessons = flattenedLessons
    .map(lesson => {
      const part = parts.find(p => p.id === lesson.lessionCategoryId)
      return {
        ...lesson,
        partOrder: part ? part.order : Infinity // Assign Infinity if no category match is found.
      }
    })
    .sort((a, b) => a.partOrder - b.partOrder || a.order - b.order) // Sort lessons by partOrder and then by lesson order.

  // Group lessons by their category, creating an array of lessons for each category.
  let counter = 0
  const lessonsGroupedByCategory = sortedLessons.reduce((acc, lesson) => {
    const existingKey = Object.keys(acc).find(key => acc[key][0]?.lessionCategoryId === lesson.lessionCategoryId)
    if (existingKey !== undefined) {
      acc[existingKey].push(lesson) // Add lesson to existing category group.
    } else {
      acc[counter] = [lesson] // Create a new category group.
      counter++
    }
    return acc
  }, {})

  const items = lessionCategories
  /**
 * Updates the expansion state based on the active indexes.
 *
 * This effect checks if all items are open and sets the `isExpanded` state accordingly
 * whenever the `activeIndexes` or `items` length changes.
 *
 * @author Canh
 * @returns {void}
 */
  useEffect(() => {
    const allOpen = activeIndexes.length === items.length
    setIsExpanded(allOpen)
  }, [activeIndexes, items.length])

  /**
 * Toggles the active state of the clicked item.
 *
 * This function updates the `activeIndexes` state by either adding the clicked index
 * if it's not currently active or removing it if it is.
 *
 * @author Canh
 * @param {number} index - The index of the item to toggle.
 * @returns {void}
 */
  const handleClick = (index: number) => {
    setActiveIndexes(activeIndexes.includes(index)
      ? activeIndexes.filter(activeIndex => activeIndex !== index)
      : [...activeIndexes, index])
  }
  /**
 * Toggles the expansion state of all items.
 *
 * This function checks if all items are currently open. If they are, it collapses all
 * items by clearing the `activeIndexes` and setting `isExpanded` to false. If not,
 * it expands all items by setting `activeIndexes` to include all item indexes and
 * setting `isExpanded` to true.
 *
 * @author Canh
 * @returns {void}
 */
  const handleExpandCollapseAll = () => {
    const allOpen = activeIndexes.length === items.length
    setActiveIndexes(prevActiveIndexes => {
      if (allOpen) {
        setIsExpanded(false)
        return []
      } else {
        setIsExpanded(true)
        return items.map((item, index) => index)
      }
    })
  }
  const totalCourses = lessions.reduce((total, currentCategoryCourses) => total + currentCategoryCourses.length, 0)

  /**
 * Handles the click event for the home button.
 *
 * This function checks for authentication tokens in local storage. If no tokens are found,
 * it redirects the user to the login page. If tokens are present, it navigates to the home page.
 *
 * @author Canh
 * @returns {void}
 */
  const handleHomeClick = () => {
    const tokens = getFromLocalStorage<any>('tokens')
    if (tokens === null) {
      navigate('/login', {
        replace: true
      })
    }
    navigate('/', {
      replace: true
    })
  }
  /**
 * Handles the browser back button event.
 *
 * This effect listens for the popstate event to override the default behavior
 * of the back button. When the back button is pressed, it prevents the default
 * action and navigates the user to the home page. The effect cleans up by
 * removing the event listener on component unmount.
 *
 * @author Canh
 * @returns {void}
 */
  useEffect(() => {
    const handleBackButtonEvent = (e: { preventDefault: () => void }) => {
      e.preventDefault()
      navigate('/')
    }
    window.onpopstate = handleBackButtonEvent

    return () => {
      window.onpopstate = null
    }
  }, [])
  /**
 * Prevents horizontal scrolling by adding a CSS class to the body.
 *
 * This effect adds the 'overflow-x-hidden' class to the document body
 * when the component mounts, preventing horizontal overflow. It cleans up
 * by removing the class when the component unmounts.
 *
 * @author Canh
 * @returns {void}
 */
  useEffect(() => {
    document.body.classList.add('overflow-x-hidden')
    return () => {
      document.body.classList.remove('overflow-x-hidden')
    }
  }, [])
  let orderCounter = 0
  const bannerSrc = theme === 'light' ? '/assets/images/courseDetail/image-banner-light.png' : '/assets/images/courseDetail/image-banner-dark.png'
  const [showFullDescription, setShowFullDescription] = useState(false)
  return (
    <div className='pb-8'>
      <div className='h-14 flex items-center lg:mx-40 mx-8 w-11/12 py-2 text-lg'>
        <div className='font-bold cursor-pointer hover:text-red-400 transition-colors duration-300' onClick={handleHomeClick}>{t('course_detail.home')}</div>
        <ArrowForwardIosIcon fontSize='small' />
        <div className='font-bold ml-3'>{data.name}</div>
      </div>
      <div className="relative w-full">
        <img src={bannerSrc} alt="Banner" className="w-full h-auto object-cover min-h-[250px]" />
        <div className="absolute inset-0 flex items-center">
          <div className='lg:ml-40 sm:ml-20 ml-10'>
            <div className='flex items-center space-x-5'>
              <div className='flex items-center'>
                    <img
                      src={creatorAVT && creatorAVT.trim() !== ''
                        ? `${process.env.REACT_APP_API}/uploads/avatars/${creatorAVT}`
                        : `${process.env.REACT_APP_API}/uploads/avatars/avatardefault.png`
                      }
                    alt='avt'
                    className='w-14 h-14 object-cover rounded-full'
                />
                <div className={`ml-5 flex items-center font-bold ${theme === 'light' ? 'text-gray-800' : 'text-white'} hover:text-red-400 cursor-pointer transition-colors`}>
                  {assignedBy}
                </div>
              </div>
              <div className='bg-orange-500 p-2 rounded-xl text-white hover:bg-orange-600 cursor-text inline-flex items-center justify-center min-w-[100px] max-w-[90%] sm:max-w-[200px] md:max-w-[250px] lg:max-w-[300px] xl:max-w-[350px] px-4 truncate font-medium'>
                {data.categoryCourseName}
              </div>
              {/* <div className='bg-orange-500 p-2 rounded-xl text-white hover:bg-orange-600 cursor-text flex items-center justify-center w-1/3 sm:w-1/5 md:w-1/6 lg:w-72 xl:w-80 truncate font-medium'>{data.categoryCourseName}</div> */}
            </div>
            <div className={`sm:text-2xl lg:text-3xl text-xl font-bold mb-4 ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>
              {data.name}
            </div>
            <div className='flex'>
              <div className='flex items-center mr-5'>
                <MenuBookIcon className='text-red-400 mr-3' />
                {totalCourses}+ {t('course_detail.lessions')}
              </div>
              <div className='flex items-center mr-5'>
                <TimerIcon className='text-yellow-400 mr-3' />
                {data.durationInMinute} {t('course_detail.minute')}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='w-full mx-auto'>
        <div className='w-full justify-center flex '>
          <div className='flex w-10/12 mt-10 lg:space-x-8 xl:space-x-16 flex-col lg:flex-row '>
            <div className='items-center w-full lg:w-3/4 justify-center'>
              <div>
                <div className={`w-full rounded-2xl shadow-2xl sticky top-0 mt-4 ${theme === 'light' ? 'bg-white' : 'bg-custom-bg-courseDetail'}`}>
                  <div className='p-5'>
                    <div className='text-blue-700 font-bold text-xl'>{t('course_detail.overview')}</div>
                    <div className='font-bold text-pretty mt-3'>{t('course_detail.course_summary')}</div>
                    <div className='mt-3'>{data.summary}</div>
                    <div className='font-bold text-pretty mt-3'>{t('course_detail.what_u_will_learn')}</div>
                    {/* <div className="grid md:grid-cols-2 gap-4 mt-3">
                      {data.description?.split(';;').map((item, index) =>
                        item.trim() !== '' && <div key={index} className='text-sm'><DoneIcon className='text-green-300 mr-2' />{item.trim()}</div>
                      )}
                    </div> */}
                    <div className="grid md:grid-cols-2 gap-4 mt-3">
                      {data.description?.split(';;').map((item, index) =>
                        item.trim() !== '' && (
                          <div key={index} className='flex items-start text-sm'>
                            <DoneIcon className='text-green-300 mr-2 flex-shrink-0 mt-0.5' />
                            <span>{item.trim()}</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className='pt-5 pl-5'>
                <div className='font-bold text-lg p-1'>{t('course_detail.course_content')}</div>
                <div className='flex justify-between mr-2'>
                  <div className='flex sm:flex-row flex-col'>
                    <div className='p-1'><strong>{parts.length}</strong> {t('course_detail.chapter')} •</div>
                    <div className='p-1'><strong>{totalCourses}</strong> {t('course_detail.lessions')} •</div>
                    <div className='p-1'>{t('course_detail.duration')} <strong>{data.durationInMinute} {t('course_detail.minute')}</strong></div>
                  </div>
                  <div className='text-green-400 font-bold hover:text-green-300 cursor-pointer' onClick={handleExpandCollapseAll}>
                    {isExpanded ? t('course_detail.collapse_all') : t('course_detail.expand_all')}
                  </div>
                </div>
              </div>
              <div className={`w-full rounded-2xl p-5 mb-5 shadow-2xl ${theme === 'light' ? 'bg-white' : 'bg-custom-bg-courseDetail'}`}>
                {parts.map((part, index) => {
                  return (
                    <div key={index}>
                      <div className='bg-slate-100 font-bold flex items-center justify-between pl-6 select-none mt-2 rounded-lg p-2 sm:p-3 cursor-pointer space-x-4' onClick={() => handleClick(index)}>
                        <div className='flex items-center w-5/6 text-black'>
                          {activeIndexes.includes(index) ? <RemoveIcon className='mr-2 text-green-300' /> : <AddIcon className='mr-2 text-green-300' />}
                          <div className='ml-4'>
                            <div></div>{index + 1}. {part.name}
                          </div>
                        </div>
                        <div className='text-center text-sm font-thin w-1/6 text-black'>{lessonsGroupedByCategory[index]?.length} {t('course_detail.lessions')}</div>
                      </div>
                      {lessonsGroupedByCategory[index] && lessonsGroupedByCategory[index].map((drop: { name: string, id: string, type: string, order: number, description: string } | null | undefined, dropIndex: React.Key | null | undefined) => {
                        orderCounter += 1
                        return (
                          activeIndexes.includes(index) && (
                            <div
                              className='flex items-center justify-center p-2 cursor-text pl-10 select-none opacity-70'
                              key={dropIndex}
                            >
                              <div className='w-full sm:p-2 p-1 border-b-2 items-center flex'>
                                {drop?.type === 'PDF' && <PictureAsPdfIcon className="mr-2 text-orange-500" />}
                                {drop?.type === 'DOC' && <TextSnippetIcon className="mr-2 text-blue-500" />}
                                {drop?.type === 'MP4' && <PlayCircleIcon className="mr-2 text-red-400" />}
                                {orderCounter}. {drop?.name}
                              </div>
                            </div>
                          )
                        )
                      })}
                    </div>
                  )
                })}
  {data.exam && (
          <div className="mt-6 p-5 border border-gray-300 rounded-xl bg-gray-100 shadow-md">
            <div className="flex items-center space-x-3">
              <LibraryBooksIcon className="text-blue-500 w-6 h-6" />
              <h3 className="text-xl font-bold text-gray-800">{data.exam.name}</h3>
            </div>

            <div className="mt-2 space-y-1 text-gray-600 text-sm">
              <p>
                <span className="font-medium">📌 {t('course_detail.number_of_attempts')}:</span> {data.exam.numberOfAttempt}
              </p>
              <div className="p-6">
                {/* Container mô tả với hiệu ứng transition mượt mà */}
                <div
                  className={`relative rounded-lg bg-gray-50 p-4 border border-gray-100 shadow-inner ${!showFullDescription ? 'max-h-20 overflow-hidden' : 'max-h-[1000px]'
                    }`}
                  style={{ transition: 'max-height 0.5s ease' }}
                >
                  <div className="prose prose-sm max-w-none whitespace-pre-line">
                    {data.exam?.description}
                  </div>

                  {/* Gradient overlay khi đang thu gọn */}
                  {!showFullDescription && data.exam?.description?.length > 150 && (
                    <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-gray-50 to-transparent"></div>
                  )}
                </div>

                {/* Nút Show more/less đẹp hơn */}
                {data.exam?.description?.length > 150 && (
                  <div className="flex justify-center mt-4">
                    <button
                      onClick={() => setShowFullDescription(!showFullDescription)}
                      className={`
          px-5 py-2 rounded-full font-medium flex items-center justify-center
          transition-all duration-300 transform
          ${showFullDescription
                          ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        }
          hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50
        `}
                    >
                      {showFullDescription
                        ? (
                        <>
                          {t('course_detail.show_less')}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 ml-2 transition-transform duration-300 group-hover:-translate-y-1"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </>
                          )
                        : (
                        <>
                          {t('course_detail.show_more')}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 ml-2 transition-transform duration-300 group-hover:translate-y-1"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </>
                          )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
  )}
      </div>
              <div>
                <div className={`w-full rounded-2xl shadow-2xl sticky top-0 mt-4 ${theme === 'light' ? 'bg-white' : 'bg-custom-bg-courseDetail'}`}>
                  <div className='p-5'>
                    <div className='text-blue-700 font-bold text-xl'>{t('course_detail.requirements')}</div>
                    <div className="grid md:grid-cols-1 gap-4 mt-3">
                      {data.prepare?.split(';;').map((item, index) =>
                        item.trim() !== '' && (
                          <div key={index} className='flex items-start text-md'>
                            <DoneIcon className='text-green-300 mr-2 flex-shrink-0 mt-0.5' />
                            <span className='text-md'>{item.trim()}</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>

            </div>
            <div className="lg:ml-10 w-full lg:w-2/5 mt-10 block">
              <div className="w-full sticky top-12 lg:p-5 p-0 flex flex-col space-y-8">
                <div className={`lg:w-full w-full rounded-2xl p-3 shadow-2xl flex-grow ${theme === 'light' ? 'bg-white' : 'bg-custom-bg-courseDetail'}`}>
                  <div className='w-full rounded-lg lg:h-72 sm:h-96 overflow-hidden justify-center flex'>
                    <div className='w-full h-full flex justify-center items-center'>
                      <>
                        {loading || typeof firstLessonMP4 === 'undefined' ? (
                          <div className="flex justify-center items-center w-full h-full">
                            <div className="loader">{t('course_detail.loading')}</div>
                          </div>
                        ) : (
                          firstLessonMP4
                            ? (
                              <div className="w-full h-full">
                                {isVideoError ? (
                                  <div className="flex justify-center items-center rounded-2xl bg-red-100 border border-red-300 shadow-lg h-full w-full">
                                    <span className="text-red-600 font-semibold text-lg text-center px-4">
                                      {t('course_detail.please_log_in_provided_account')}
                                    </span>
                                  </div>
                                ) : (
                                  <YouTube
                                    videoId={firstLessonMP4.locationPath}
                                    opts={{ ...opts, width: '100%', height: '100%' }}
                                    className="top-0 left-0 w-full h-full"
                                    onError={(e: any) => {
                                      if (e.data === 150) {
                                        // toast.error(t('learning.video_is_not_available'))
                                        setIsVideoError(true)
                                      }
                                    }}
                                  />
                                )}
                              </div>
                              )
                            : (
                              <div className="flex items-center justify-center w-full h-full">
                                <div className="font-bold item">{t('course_detail.this_course_dont_have_any_videos')}</div>
                              </div>
                              )
                        )}
                      </>
                    </div>
                  </div>
                  {/* <div className='w-full justify-center flex mt-3'>
                    <div className='flex w-4/5 justify-center'>
                      <button className='text-red-400 flex-1 border border-red-400 rounded-3xl p-5 mr-5 text-sm hover:bg-red-400 hover:text-white transition-colors duration-200 font-bold'><FavoriteBorderIcon className='mr-2' />{t('course_detail.add')}</button>
                      <button className='text-red-400 flex-1 border border-red-400 rounded-3xl p-5 text-sm hover:bg-red-400 hover:text-white transition-colors duration-200 font-bold'><ShareIcon className='mr-2' />{t('course_detail.share')}</button>
                    </div>
                  </div> */}
                  <div className='flex justify-center mt-4'>
                    <button className='bg-custom-button-enroll hover:bg-custom-button-enroll-hover w-4/5 rounded-3xl p-3 font-bold text-lg' onClick={handleOpenModal}>
                      {modalType === ModalType.ALREADY_ENROLLED
                        ? t('course_detail.continueLearning')
                        : modalType === ModalType.SUBMIT
                          ? t('course_detail.enrollNow')
                          : t('course_detail.enrollNow')}
                    </button>
                  </div>
                </div>
                <div className={`lg:w-full w-full rounded-2xl p-3 shadow-2xl flex-grow ${theme === 'light' ? 'bg-white' : 'bg-custom-bg-courseDetail'}`}>
                  <div className='w-full'>
                    <div className='p-2 font-bold text-lg'>{t('course_detail.includes')}</div>
                    <div className='w-full border-b'>
                      <div className='p-2'><SignalCellularAltIcon className='mr-3 text-orange-400' />{t('course_detail.level')}: <strong>Beginner</strong> </div>
                      <div className='p-2'><StyleIcon className='mr-3 text-orange-400' />{t('course_detail.chapter2')}: <strong>{parts.length} {t('course_detail.chapter')}</strong></div>
                      <div className='p-2'><TheatersIcon className='mr-3 text-orange-400' />{t('course_detail.total')}: <strong>{totalCourses} {t('course_detail.lessions')}</strong></div>
                      <div className='p-2'><TimerIcon className='mr-3 text-orange-400' />{t('course_detail.duration')}: <strong>{data.durationInMinute} {t('course_detail.minute')}</strong></div>
                    </div>
                    <div className='p-2'><BatteryChargingFullTwoToneIcon className='mr-3 text-indigo-800' />{t('course_detail.study_anywhere_anytime')}</div>
                    <div className='p-2'><KeyIcon className='mr-3 text-indigo-800' />{t('course_detail.full_life_time_access')}</div>
                    <div className='p-2'><AssignmentReturnedIcon className='mr-3 text-indigo-800' />{t('course_detail.assignments')}</div>
                    <div className='p-2'><SchoolIcon className='mr-3 text-indigo-800' />{t('course_detail.certificate_of_completion')}</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
      <ModalComponent
        isOpen={isOpenModal}
        title={t('course_detail.confirm') as string}
        description={confirmMessage}
        onCancel={() => setIsOpenModal(false)}
        onOk={handleOkModal}
        onClose={() => setIsOpenModal(false)}
      />
      {/* <ModalEnrollComponent
        isOpen={isOpenModal}
        title={confirmMessage}
        description=''
        onCancel={() => setIsOpenModal(false)}
        onOk={handleOkModal}
        onClose={() => setIsOpenModal(false)}
      /> */}
    </div>
  )
}

export default CourseDetail
