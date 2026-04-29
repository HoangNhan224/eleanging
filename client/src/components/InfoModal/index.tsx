/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable react/prop-types */
import React, { useRef, useEffect } from 'react'
interface Props {
  children?: React.ReactNode
  id?: string
  title: string
  modalOpen: boolean
}
const InfoModal = ({
  children,
  id,
  title,
  modalOpen
}: Props) => {
  const modalContent = useRef(null)
  return (
    <>
      <div className={`fixed inset-0 bg-slate-900 bg-opacity-30 z-50 transition-opacity ${modalOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center my-4 justify-center px-4 sm:px-6">
        <div ref={modalContent} className="bg-white rounded shadow-lg overflow-auto max-w-lg w-full max-h-full">
          <div className="p-5">
            <div className="mb-2">
              <div className="flex justify-between items-center">
                <div className="text-lg font-semibold text-slate-800">{title}</div>
              </div>
            </div>
            {children}
          </div>
        </div>
        </div>
      </div>
    </>
  )
}

export default InfoModal
