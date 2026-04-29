/* eslint-disable @typescript-eslint/explicit-function-return-type */
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { selectIsAuthenticated } from '../../redux/auth/authSlice'
import { useSelector } from 'react-redux'
const NotFound = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const handleHomeClick = () => {
    if (isAuthenticated === null) {
      navigate('/login', {
        replace: true
      })
    }
    navigate('/', {
      replace: true
    })
  }
  const [textStyle1, setTextStyle1] = useState<React.CSSProperties>({
    opacity: 0,
    transform: 'translateY(20px)',
    transition: 'opacity 0.6s ease-out, transform 0.6s ease-out'
  })
  const [textStyle2, setTextStyle2] = useState<React.CSSProperties>({
    opacity: 0,
    transform: 'translateY(20px)',
    transition: 'opacity 0.6s ease-out, transform 0.6s ease-out'
  })
  const [textStyle3, setTextStyle3] = useState<React.CSSProperties>({
    opacity: 0,
    transform: 'translateY(20px)',
    transition: 'opacity 0.6s ease-out, transform 0.6s ease-out'
  })
  const [textStyle4, setTextStyle4] = useState<React.CSSProperties>({
    opacity: 0,
    transform: 'translateY(20px)',
    transition: 'opacity 0.6s ease-out, transform 0.6s ease-out'
  })
  const [robotStyle, setRobotStyle] = useState<React.CSSProperties>({
    opacity: 0,
    transform: 'translateY(20px) rotate(-3deg)',
    transition: 'opacity 0.8s ease-in-out, transform 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
  })

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setTextStyle1((prev) => ({ ...prev, opacity: 1, transform: 'translateY(0px)' }))
    }, 100)

    const timer2 = setTimeout(() => {
      setTextStyle2((prev) => ({ ...prev, opacity: 1, transform: 'translateY(0px)' }))
    }, 300)

    const timer3 = setTimeout(() => {
      setTextStyle3((prev) => ({ ...prev, opacity: 1, transform: 'translateY(0px)' }))
    }, 500)

    const timer4 = setTimeout(() => {
      setTextStyle4((prev) => ({ ...prev, opacity: 1, transform: 'translateY(0px)' }))
    }, 700)

    const robotTimer = setTimeout(() => {
      setRobotStyle((prev) => ({ ...prev, opacity: 1, transform: 'translateY(0px) rotate(0deg)' }))
    }, 250)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearTimeout(timer4)
      clearTimeout(robotTimer)
    }
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-6 sm:p-10">
      <div className="flex w-full max-w-7xl flex-col items-center justify-between lg:flex-row">
        {/* Left Section: Text and Buttons */}
        <div className="mb-10 text-left lg:mb-0 lg:w-1/2 lg:pr-10">
          <p
            className="mb-1 text-xs text-gray-600"
            style={textStyle1}
          >
            {t('notFound.errorCode')}
          </p>
          <h1
            className="mb-4 text-5xl font-bold text-black sm:text-5xl"
            style={textStyle2}
          >
            {t('notFound.errorMessage')}
          </h1>
          <p className="mb-4 text-base text-gray-600 animate-fade-in-down animate-delay-400 animate-duration-5000"
            style={textStyle3}>
            {t('notFound.errorDescription')}
          </p>
          <div className="flex space-x-3" style={textStyle4}>
            <button
              type="button"
              className='py-1 px-2 bg-custom-button-showmore rounded-md sm:flex items-center justify-center hidden text-white shadow-lg shadow-gray-500'
              onClick={handleHomeClick}
            >
              {t('notFound.goHome')}
            </button>
            {/* <button
              type="button"
              className="rounded border border-black px-5 py-2 text-xs font-semibold text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-50"
            >
              Contact Support
            </button> */}
          </div>
        </div>

        {/* Right Section: Image */}
        <div className="flex justify-center lg:w-1/2 lg:justify-end">
          <img
            src="/assets/images/homePage/frame404.png"
            alt="Page Not Found Robot"
            className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl"
            style={robotStyle}
          />
        </div>
      </div>
    </div>
  )
}

export default NotFound
