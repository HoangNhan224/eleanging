/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'

const useCountDown = (targetDate: string | number | Date, onTimeUp: () => void) => {
  const countDownDate = new Date(targetDate).getTime()
  const [countDown, setCountDown] = useState(countDownDate - new Date().getTime())
  const toastShown = useRef(false)
  const { t } = useTranslation()
  useEffect(() => {
    if (countDown <= 0) return // Dừng nếu hết thời gian

    const interval = setInterval(() => {
      const newTime = countDownDate - new Date().getTime()

      // Hiển thị toast khi chỉ còn 5 phút và toast chưa được hiện trước đó
      if (!toastShown.current && newTime <= 5 * 60 * 1000) {
        // toast.info(t('course_exam.time_is_almost_up'), {
        //   autoClose: 10000
        // })
        toastShown.current = true
      }

      if (newTime <= 0) {
        clearInterval(interval) // Dừng interval khi hết thời gian
        setCountDown(0) // Đặt countDown về 0 để tránh số âm
        onTimeUp() // Gọi hàm onTimeUp từ component sử dụng hook
      } else {
        setCountDown(newTime)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [countDown, countDownDate, onTimeUp])

  return getReturnValues(countDown)
}
// const useCountDown = (targetDate: string | number | Date) => {
//   const countDownDate = new Date(targetDate).getTime()
//   const [countDown, setCountDown] = useState(countDownDate - new Date().getTime())

//   useEffect(() => {
//     if (countDown <= 0) return // Dừng nếu hết thời gian

//     const interval = setInterval(() => {
//       const newTime = countDownDate - new Date().getTime()
//       if (newTime <= 0) {
//         alert('Time up!') // Thông báo khi hết thời gian
//         clearInterval(interval) // Dừng interval khi hết thời gian
//         setCountDown(0) // Đặt countDown về 0 để tránh số âm
//       } else {
//         setCountDown(newTime)
//       }
//     }, 1000)

//     return () => clearInterval(interval)
//   }, [countDown, countDownDate])

//   return getReturnValues(countDown)
// }
const getReturnValues = (countDown: number) => {
  // calculate time left
  const days = Math.floor(countDown / (1000 * 60 * 60 * 24))
  const hours = Math.floor((countDown % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((countDown % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((countDown % (1000 * 60)) / 1000)

  return [days, hours, minutes, seconds]
}
export default useCountDown
