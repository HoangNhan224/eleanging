/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* PAGE: Profile
   ========================================================================== */
import React from 'react'
import AccountPanel from '../settings/components/AccountPanel'

/**
 * Profile component renders the user's profile page.
 *
 * @component
 * @returns {JSX.Element} The rendered Profile component.
 */
function Profile () {
  return (

    <main>
      <div className="px-4 sm:px-6 lg:px-8 w-full max-w-9xl mx-auto">
        {/* Content */}
        <div className="bg-white shadow-lg rounded-sm mb-8">
          <div className="flex flex-col md:flex-row md:-mr-px">
            <AccountPanel />
          </div>
        </div>

      </div>
    </main>
  )
}

export default Profile
