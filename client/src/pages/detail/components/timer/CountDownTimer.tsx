/* eslint-disable multiline-ternary */
/* eslint-disable react/prop-types */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import './datetime.css'
// import DateTimeDisplay from './DateTimeDisplay'
import useCountDown from '../../../../hooks/useCountDown'
import { t } from 'i18next'

const ExpiredNotice = () => {
  return (
    <div className="expired-notice">
          {t('detail.timeup')}
    </div>
  )
}

const ShowCounter = ({ days, hours, minutes, seconds }: { days: number, hours: number, minutes: number, seconds: number }) => {
  // Format numbers with leading zeros
  const formattedMinutes = minutes.toString().padStart(2, '0')
  const formattedSeconds = seconds.toString().padStart(2, '0')
  // Optionally, format hours if needed:
  const formattedHours = hours.toString().padStart(2, '0')

  return (
    <div className="flex flex-col ">
      <div className='font-bold'>{t('course_exam.timeleft')}</div>
      <div className='font-bold text-lg text-blue-500'>
        {hours > 0 ? (
          // If hours is greater than 0, show full display
          <span>{formattedHours}:{formattedMinutes}:{formattedSeconds}</span>
        ) : (
          // Otherwise, display as mm:ss format
          <span>{formattedMinutes}:{formattedSeconds}</span>
        )}
      </div>
    </div>
  )
}
const CountDownTimer = ({ targetDate, onTimeUp }: { targetDate: number, onTimeUp: () => void }) => {
  const [days, hours, minutes, seconds] = useCountDown(targetDate, onTimeUp)

  if (days + hours + minutes + seconds <= 0) {
    return <ExpiredNotice />
  } else {
    return <ShowCounter days={days} hours={hours} minutes={minutes} seconds={seconds} />
  }
}

export default CountDownTimer
