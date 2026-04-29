/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable object-shorthand */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import React, { ReactElement, useEffect, useMemo, useState } from 'react'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import { t } from 'i18next'
import { useNavigate } from 'react-router-dom'
// import TimerIcon from '@mui/icons-material/Timer'
// import MenuBookIcon from '@mui/icons-material/MenuBook'
import { getEnrollmentByCourseId } from 'api/post/post.api'
import { getFromLocalStorage, setToLocalStorage } from 'utils/functions'
import { useTheme } from 'services/styled-themes'

interface Props {
  description?: string
  id?: string
  name?: string
  summary?: string
  assignedBy?: string
  creatorAVT?: string
  durationInMinute?: number
  startDate?: Date
  endDate?: Date
  price?: number
  category?: string
  locationPath?: string
  enrollmentCount?: number
  createdAt?: Date
  lessonCount?: number

}
const HomeCourseCard = ({
  name,
  id,
  assignedBy,
  creatorAVT,
  durationInMinute,
  description,
  price,
  startDate,
  endDate,
  category,
  locationPath,
  enrollmentCount,
  createdAt,
  lessonCount
}: Props): ReactElement => {
  const [isEnrolled, setIsEnrolled] = useState(false)
  const { theme } = useTheme()
  const navigate = useNavigate()
  const courseDetailView = useMemo(() => {
    return `/courses/${id}`
  }, [id])
  const createdAtDate = new Date(createdAt?.toString() ?? '')
  const handleCourseClick = () => {
    navigate(courseDetailView, {
      state: {
        assignedBy: assignedBy,
        creatorAVT: creatorAVT
      }
    })
  }
  const priceText = useMemo(() => {
    if (Number(price) !== 0) {
      return (
        `${price}`
      )
    }
    return t('homepage.free')
  }, [price])

  // useEffect(() => {
  //   const checkEnrollment = async () => {
  //     if (id) {
  //       const enrollments = getFromLocalStorage<string[]>('enrollments') ?? []
  //       console.log('all', enrollments)
  //       if (enrollments.includes(id)) {
  //         console.log('1', id)
  //         setIsEnrolled(true)
  //         // enrollments.push(id)
  //         // setToLocalStorage('enrollments', JSON.stringify(enrollments))
  //       } else {
  //         const enrollment = await getEnrollmentByCourseId({ courseId: id })
  //         if (enrollment.data) {
  //           enrollments.push(id)
  //           console.log('2', id)
  //           console.log('enrollments2', enrollments)
  //           setToLocalStorage('enrollments', JSON.stringify(enrollments))
  //           setIsEnrolled(true)
  //         } else {
  //           setIsEnrolled(false)
  //         }
  //       }
  //     }
  //   }
  //   checkEnrollment()
  // }, [id])
  // const [dataLoaded, setDataLoaded] = useState(false)
  useEffect(() => {
    const checkEnrollment = async () => {
      if (id) {
        let enrollments = getFromLocalStorage<string[]>('enrollments') ?? []
        if (enrollments.includes(id)) {
          setIsEnrolled(true)
        } else {
          const enrollment = await getEnrollmentByCourseId({ courseId: id })
          if (enrollment.data) {
            enrollments = getFromLocalStorage<string[]>('enrollments') ?? []
            if (!enrollments.includes(id)) {
              enrollments.push(id)
            }
            setToLocalStorage('enrollments', JSON.stringify(enrollments))
            setIsEnrolled(true)
          } else {
            setIsEnrolled(false)
          }
        }
      }
    }
    checkEnrollment()
  }, [id])
  // useEffect(() => {
  //   const checkEnrollment = async () => {
  //     if (id) {
  //       let enrollments = getFromLocalStorage<string[]>('enrollments') ?? []
  //       console.log('all', enrollments)
  //       if (enrollments.includes(id)) {
  //         console.log('1', id)
  //         setIsEnrolled(true)
  //       } else {
  //         if (!dataLoaded) {
  //           const enrollment = await getEnrollmentByCourseId({ courseId: id })
  //           console.log(id)
  //           console.log(enrollment)
  //           if (enrollment.data) {
  //             console.log('run')
  //             enrollments = getFromLocalStorage<string[]>('enrollments') ?? []
  //             if (!enrollments.includes(id)) {
  //               enrollments.push(id)
  //             }
  //             console.log('2', id)
  //             console.log('enrollments2', enrollments)
  //             setToLocalStorage('enrollments', JSON.stringify(enrollments))
  //             setIsEnrolled(true)
  //             setDataLoaded(true)
  //           } else {
  //             setIsEnrolled(false)
  //           }
  //         } else {
  //           setIsEnrolled(false)
  //         }
  //       }
  //     }
  //   }
  //   checkEnrollment()
  // }, [id, dataLoaded])
  return (
    // <div className="mt-4 cursor-pointer col-span-full sm:col-span-6 md:col-span-4 lg:col-span-3 bg-white shadow-lg rounded-lg border border-slate-200 overflow-hidden transition-all duration-200 ease-in-out" onClick={handleCourseClick}>
    <div
    className={`mt-4 cursor-pointer col-span-full sm:col-span-6 md:col-span-4 lg:col-span-3 bg-white shadow-lg rounded-lg border border-slate-200 overflow-hidden transition-all duration-200 ease-in-out ${theme === 'light' ? 'text-white' : 'text-black'}`}
    onClick={handleCourseClick}
  >
      <div className="flex flex-col h-full">
        {/* Image */}
        <div className='w-full rounded-t-md h-40 overflow-hidden'>
          {/* <img className="w-full h-full object-cover rounded-t-md transition-transform duration-700 hover:scale-110" src={locationPath ? `assets/image/${locationPath}` : 'https://picsum.photos/200/300'} width="286" height="160" alt="CourseImage" /> */}

          <img className="w-full h-full object-cover rounded-t-md transition-transform duration-700 hover:scale-110" src={locationPath ? (`${process.env.REACT_APP_API}/uploads/courses/${locationPath}`) : 'https://picsum.photos/200/300'} width="286" height="160" alt="CourseImage" />
        </div>
        {/* Card Content */}
        <div className="grow flex flex-col p-5">
          { }
          <div className="grow">
            {/* Header */}
            <header className="mb-4">
              {/* <h3 className="text-lg text-slate-800 font-semibold h-16">{name}</h3> */}
              <h3
                className="text-lg text-slate-800 font-semibold h-14 overflow-hidden"
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'normal',
                  wordBreak: 'break-word'
                }}
                title={name} // Hover để xem full tên
              >
                {name}
              </h3>
            </header>
            <ul className="text-sm space-y-2 mb-5 text-slate-600">
              <li className="flex items-center">
                <svg className="w-4 h-4 fill-current text-slate-400 shrink-0 mr-3" viewBox="0 0 16 16">
                  <path d="M15.686 5.695L10.291.3c-.4-.4-.999-.4-1.399 0s-.4.999 0 1.399l.6.599-6.794 3.697-1-1c-.4-.399-.999-.399-1.398 0-.4.4-.4 1 0 1.4l1.498 1.498 2.398 2.398L.6 13.988 2 15.387l3.696-3.697 3.997 3.996c.5.5 1.199.2 1.398 0 .4-.4.4-.999 0-1.398l-.999-1 3.697-6.694.6.6c.599.6 1.199.2 1.398 0 .3-.4.3-1.1-.1-1.499zM8.493 11.79L4.196 7.494l6.695-3.697 1.298 1.299-3.696 6.694z" />
                </svg>

                <div>{durationInMinute} {t('course.minutes')}</div>
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 shrink-0 fill-current mr-3 text-slate-400" viewBox="0 0 16 16">
                  <path d="M11 0c1.3 0 2.6.5 3.5 1.5 1 .9 1.5 2.2 1.5 3.5 0 1.3-.5 2.6-1.4 3.5l-1.2 1.2c-.2.2-.5.3-.7.3-.2 0-.5-.1-.7-.3-.4-.4-.4-1 0-1.4l1.1-1.2c.6-.5.9-1.3.9-2.1s-.3-1.6-.9-2.2C12 1.7 10 1.7 8.9 2.8L7.7 4c-.4.4-1 .4-1.4 0-.4-.4-.4-1 0-1.4l1.2-1.1C8.4.5 9.7 0 11 0zM8.3 12c.4-.4 1-.5 1.4-.1.4.4.4 1 0 1.4l-1.2 1.2C7.6 15.5 6.3 16 5 16c-1.3 0-2.6-.5-3.5-1.5C.5 13.6 0 12.3 0 11c0-1.3.5-2.6 1.5-3.5l1.1-1.2c.4-.4 1-.4 1.4 0 .4.4.4 1 0 1.4L2.9 8.9c-.6.5-.9 1.3-.9 2.1s.3 1.6.9 2.2c1.1 1.1 3.1 1.1 4.2 0L8.3 12zm1.1-6.8c.4-.4 1-.4 1.4 0 .4.4.4 1 0 1.4l-4.2 4.2c-.2.2-.5.3-.7.3-.2 0-.5-.1-.7-.3-.4-.4-.4-1 0-1.4l4.2-4.2z" />
                </svg>
                <div>{category}</div>
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 shrink-0 fill-current mr-3 text-slate-400" viewBox="0 0 16 16">
                  <path d="M6.974 14c-.3 0-.7-.2-.9-.5l-2.2-3.7-2.1 2.8c-.3.4-1 .5-1.4.2-.4-.3-.5-1-.2-1.4l3-4c.2-.3.5-.4.9-.4.3 0 .6.2.8.5l2 3.3 3.3-8.1c0-.4.4-.7.8-.7s.8.2.9.6l4 8c.2.5 0 1.1-.4 1.3-.5.2-1.1 0-1.3-.4l-3-6-3.2 7.9c-.2.4-.6.6-1 .6z" />
                </svg>
                <div>{enrollmentCount} {t('course.active_installations')}</div>
              </li>
              {/* <li className="flex items-center">
                <svg className="w-4 h-4 fill-current text-slate-400 shrink-0 mr-3" viewBox="0 0 16 16">
                  <path d="M15 15V5l-5-5H2c-.6 0-1 .4-1 1v14c0 .6.4 1 1 1h12c.6 0 1-.4 1-1zM3 2h6v4h4v8H3V2z" />
                </svg>
                <div>{lessonCount} {t('course.articles')}</div>
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 fill-current text-slate-400 shrink-0 mr-3" viewBox="0 0 16 16">
                  <path d="M13 7h2v6a1 1 0 01-1 1H4v2l-4-3 4-3v2h9V7zM3 9H1V3a1 1 0 011-1h10V0l4 3-4 3V4H3v5z" />
                </svg>
                <div>{t('course.access')}</div>
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 shrink-0 fill-current text-slate-400 mr-3" viewBox="0 0 16 16">
                  <path d="M12.311 9.527c-1.161-.393-1.85-.825-2.143-1.175A3.991 3.991 0 0012 5V4c0-2.206-1.794-4-4-4S4 1.794 4 4v1c0 1.406.732 2.639 1.832 3.352-.292.35-.981.782-2.142 1.175A3.942 3.942 0 001 13.26V16h14v-2.74c0-1.69-1.081-3.19-2.689-3.733zM6 4c0-1.103.897-2 2-2s2 .897 2 2v1c0 1.103-.897 2-2 2s-2-.897-2-2V4zm7 10H3v-.74c0-.831.534-1.569 1.33-1.838 1.845-.624 3-1.436 3.452-2.422h.436c.452.986 1.607 1.798 3.453 2.422A1.943 1.943 0 0113 13.26V14z" />
                </svg>
                <div>{assignedBy}</div>
              </li>

              <li className="flex items-center">
              <svg className="w-4 h-4 shrink-0 fill-current mr-3 text-slate-400" viewBox="0 0 16 16">
              <path d="M15 2h-2V0h-2v2H9V0H7v2H5V0H3v2H1a1 1 0 00-1 1v12a1 1 0 001 1h14a1 1 0 001-1V3a1 1 0 00-1-1zm-1 12H2V6h12v8z" />
            </svg>
                <div>{createdAtDate?.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })} ({t('course.createdAt')})</div>
              </li> */}
            </ul>
          </div>
          {/* Card footer */}
          {/* <div className='bg-red-100 items-center flex'>
            <a className="font-bold py-1 rounded-md items-center text-center px-5 w-full bg-indigo-500 hover:bg-indigo-600 text-white " href="#0">
              {Number(price) === 0 ? 'Free Now' : 'Buy Now'}
            </a>
          </div> */}
          <div className='bg-red-100 items-center flex'>
            <button
              className={`font-bold py-1 rounded-md items-center text-center px-5 w-full  hover:bg-custom-button-enroll-hover ${theme === 'light' ? 'text-white bg-custom-button-enroll' : 'text-black bg-custom-button-enroll-dark'}`}
              onClick={handleCourseClick}
            >
              {isEnrolled ? t('course.continue') : t('course.enrollNow')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
export default HomeCourseCard
