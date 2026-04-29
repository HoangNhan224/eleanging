/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* PAGE: UserPage
========================================================================== */
import React from 'react'
import UserDashboardPage from './components/UserDashboardPage'
import { useTranslation } from 'react-i18next'
function UserDashBoard () {
  const { t } = useTranslation()
  return (
    <main>
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">

        {/* Page header */}
        <div className="mb-8">
          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold">{t('dashboard.dashboard')} ✨</h1>
        </div>

        {/* Content */}
        <div className="bg-white shadow-lg rounded-sm mb-8">
          <div className="flex flex-col md:flex-row md:-mr-px">
            <UserDashboardPage />
          </div>
        </div>

      </div>
    </main>
  )
}

export default UserDashBoard
