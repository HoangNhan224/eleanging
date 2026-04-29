/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* PAGE: LessionPage
   ========================================================================== */
import React from 'react'
import TableLession from './TableLession'

/**
 * LessionPage component renders the main layout for the lesson page.
 *
 * @author Hien
 * @component
 * @returns {JSX.Element} The rendered LessionPage component.
 */
const LessionPage = () => {
  return (
    <div className="bg-white shadow-lg rounded-sm border border-slate-200 relative w-full">
      <div className="border rounded w-full">
        <TableLession />
      </div>
    </div>
  )
}

export default LessionPage
