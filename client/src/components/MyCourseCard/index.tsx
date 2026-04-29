/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable object-shorthand */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import React, { ReactElement, useMemo } from 'react'
import { t } from 'i18next'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import { useNavigate } from 'react-router-dom'
import ProgressBar from '@ramonak/react-progress-bar'
import { calculateTime } from 'utils/CalculateTime'
import { useTranslation } from 'react-i18next'
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
  status?: string
  progressPercentage?: number
  price?: number
  locationPath?: string
  category?: string
  lessonCount?: number
  doneCount?: number
  lastUpdate?: Date
  progress?: number
  theme?: string
}
// const statusText = useMemo(() => {
//   if (status === 'tested') {
//     return (
//       t('homepage.filter.tested') +
//       ` ${attempted} ${numberOfAttempt ? ' / ' + numberOfAttempt : ''}`
//     )
//   }
//   return t('homepage.filter.pending')
// }, [status, attempted, numberOfAttempt])
// const filterOptions = useMemo(() => {
//   return [
//     {
//       label: t('homepage.filter.all'),
//       value: StatusExam.ALL
//     },
//     {
//       label: t('homepage.filter.pending'),
//       value: StatusExam.NOT_DONE
//     },
//     {
//       label: t('homepage.filter.tested'),
//       value: StatusExam.DONE
//     }
//   ]
// }, [t])
const MyCourseCard = ({
  name,
  summary,
  id,
  assignedBy,
  creatorAVT,
  durationInMinute,
  startDate,
  endDate,
  description,
  status,
  price,
  locationPath,
  category,
  progressPercentage,
  lessonCount,
  doneCount,
  lastUpdate,
  progress,
  theme
}: Props): ReactElement => {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const courseDetailView = useMemo(() => {
    return `/courses/${id}`
  }, [id])
  // console.log(status)
  const handleCourseClick = () => {
    navigate(courseDetailView, {
      state: {
        assignedBy: assignedBy,
        creatorAVT: creatorAVT
      }
    })
  }
  const statusText = useMemo(() => {
    if (status === 'true') {
      return (
        t('homepage.course_done')
      )
    }
    return t('homepage.course_not_done')
  }, [status])
  const timeString = calculateTime((lastUpdate ?? '').toString(), {
    'hôm nay': t('mycourse.today'),
    '1 ngày trước': t('mycourse.1_day_ago'),
    'ngày trước': t('mycourse.days_ago'),
    '1 tháng trước': t('mycourse.one_month_ago'),
    'nửa tháng trước': t('mycourse.half_month_ago'),
    'tháng trước': t('mycourse.months_ago'),
    '1 năm trước': t('mycourse.one_year_ago'),
    'năm trước': t('mycourse.years_ago')
  })
  return (
    <div className="mt-4 cursor-pointer col-span-full sm:col-span-6 md:col-span-4 lg:col-span-3 bg-white shadow-lg rounded-lg border border-slate-200 overflow-hidden transition-all duration-200 ease-in-out" onClick={handleCourseClick}>
      <div className="flex flex-col h-full">
        {/* Image */}
        <div className='w-full rounded-t-md h-40 overflow-hidden'>
        <img className="w-full h-full object-cover rounded-t-md transition-transform duration-700 hover:scale-110" src={locationPath ? (`${process.env.REACT_APP_API}/uploads/courses/${locationPath}`) : 'https://picsum.photos/200/300'} width="286" height="160" alt="CourseImage" />
          {/* <img className="w-full h-full object-cover rounded-t-md transition-transform duration-700 hover:scale-110" src={locationPath ? `assets/image/${locationPath}` : 'https://picsum.photos/200/300'} width="286" height="160" alt="CourseImage" /> */}
        </div>
        {/* Card Content */}
        <div className="grow flex flex-col p-3 px-5">
          {/* Card body */}
          <div className="grow">
            {/* Header */}
            <header className="mb-4">
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
              </h3>            </header>
            {/* Features list */}
            <ul className="text-sm space-y-2 mb-5">
            <div className='text-gray-500 italic'>{lastUpdate ? `${t('mycourse.studied_at')} ${timeString}` : t('mycourse.haventStudyYet')}</div>
              <div className='font-bold text-black'>{t('mycourse.progress')}: </div>
              <ProgressBar
                className="pb-4"
                maxCompleted={100}
                completed={Number(((progress ?? 0) * 100).toFixed(0))}
                bgColor="#8BBF8B"
                baseBgColor="#e9ecef"
                isLabelVisible={true}
                labelColor={Number(((progress ?? 0) * 100).toFixed(0)) < 20 ? '#000' : '#fff'}
                transitionDuration="0.5s"
                animateOnRender
                customLabelStyles={{
                  fontSize: '12px',
                  fontWeight: 'bold',
                  position: 'relative',
                  whiteSpace: 'nowrap',
                  left: Number(((progress ?? 0) * 100).toFixed(0)) < 20 ? 'calc(100% + 5px)' : 'auto'
                }}
              />
              <li className="flex items-center">
                <svg className="w-4 h-4 fill-current text-slate-400 shrink-0 mr-3" viewBox="0 0 16 16">
                  <path d="M15.686 5.695L10.291.3c-.4-.4-.999-.4-1.399 0s-.4.999 0 1.399l.6.599-6.794 3.697-1-1c-.4-.399-.999-.399-1.398 0-.4.4-.4 1 0 1.4l1.498 1.498 2.398 2.398L.6 13.988 2 15.387l3.696-3.697 3.997 3.996c.5.5 1.199.2 1.398 0 .4-.4.4-.999 0-1.398l-.999-1 3.697-6.694.6.6c.599.6 1.199.2 1.398 0 .3-.4.3-1.1-.1-1.499zM8.493 11.79L4.196 7.494l6.695-3.697 1.298 1.299-3.696 6.694z" />
                </svg>

                <div className='text-black'>{durationInMinute} {t('course.minutes')}</div>
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 shrink-0 fill-current mr-3 text-slate-400" viewBox="0 0 16 16">
                  <path d="M11 0c1.3 0 2.6.5 3.5 1.5 1 .9 1.5 2.2 1.5 3.5 0 1.3-.5 2.6-1.4 3.5l-1.2 1.2c-.2.2-.5.3-.7.3-.2 0-.5-.1-.7-.3-.4-.4-.4-1 0-1.4l1.1-1.2c.6-.5.9-1.3.9-2.1s-.3-1.6-.9-2.2C12 1.7 10 1.7 8.9 2.8L7.7 4c-.4.4-1 .4-1.4 0-.4-.4-.4-1 0-1.4l1.2-1.1C8.4.5 9.7 0 11 0zM8.3 12c.4-.4 1-.5 1.4-.1.4.4.4 1 0 1.4l-1.2 1.2C7.6 15.5 6.3 16 5 16c-1.3 0-2.6-.5-3.5-1.5C.5 13.6 0 12.3 0 11c0-1.3.5-2.6 1.5-3.5l1.1-1.2c.4-.4 1-.4 1.4 0 .4.4.4 1 0 1.4L2.9 8.9c-.6.5-.9 1.3-.9 2.1s.3 1.6.9 2.2c1.1 1.1 3.1 1.1 4.2 0L8.3 12zm1.1-6.8c.4-.4 1-.4 1.4 0 .4.4.4 1 0 1.4l-4.2 4.2c-.2.2-.5.3-.7.3-.2 0-.5-.1-.7-.3-.4-.4-.4-1 0-1.4l4.2-4.2z" />
                </svg>
                <div className='text-black'>{category}</div>
              </li>
            </ul>
          </div>
          <div className='bg-red-100 items-center flex'>
            <button
              className={`font-bold py-1 rounded-md items-center text-center px-5 w-full  hover:bg-custom-button-enroll-hover ${theme === 'light' ? 'text-white bg-custom-button-enroll' : 'text-black bg-custom-button-enroll-dark'}`}
              onClick={handleCourseClick}
            >
              {status === 'true' ? t('mycourse.learnAgain') : t('mycourse.continueLearning')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MyCourseCard
