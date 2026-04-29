/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* PAGE: LessionPagePage
========================================================================== */
import React from 'react'
import LessionPage from './components/LessionPage'
import { getFromLocalStorage } from 'utils/functions'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
/**
 * LessionPagePage component renders the main layout for the lesson page.
 *
 * @author Hien
 * @component
 * @returns {JSX.Element} The rendered LessionPagePage component.
 */
function LessionPagePage () {
  // const { theme } = useTheme()
  const { t } = useTranslation()
  const navigate = useNavigate()

  // Handles the click event for navigating to the home page.
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
  return (
    <main>
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">

        {/* Page header */}
        <div className="mb-8 flex justify-between items-center">
          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-center md:text-left w-full md:w-auto">{t('lesson.lesson_list')}</h1>
          <div className='hidden md:flex space-x-2'>
            <div className='font-bold cursor-pointer hover:text-red-400 transition-colors duration-300 text-teal-400' onClick={handleHomeClick}>{t('lesson.homepage')}</div>
            <div className='font-bold'>/</div>
            <div className='font-bold'>{t('lesson.lesson')}</div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white shadow-lg rounded-sm mb-8">
          <div className="flex flex-col md:flex-row md:-mr-px">
            <LessionPage />
          </div>
        </div>

      </div>
    </main>
  )
}

export default LessionPagePage
