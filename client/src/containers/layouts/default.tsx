/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* LAYOUT DEFAULT COMPONENT
   ========================================================================== */
import { useSelector } from 'react-redux'
import { selectUserRole } from '../../redux/auth/authSlice'
import Footer from './footer/footer'
import Header from '../layouts/navbar/navbar'
import Sidebar from '../../components/Sidebar'
import { Outlet, useLocation, useParams } from 'react-router-dom'
import Styled from './default.style'
import { getFromLocalStorage } from 'utils/functions'
import CryptoJS from 'crypto-js'
import React, { useEffect, useRef, useState, createContext, RefObject } from 'react'
export const ShowButtonTopContext = createContext({
  showButtonTop: false,
  setShowButtonTop: (value: boolean) => {}
})
export const DivRefContext = createContext<RefObject<HTMLDivElement> | null>(null)

/**
    * Default component serves as the main layout for the application.
    *
    * @component
    * @returns {JSX.Element} The rendered Default component.
    *
    * @property {boolean} sidebarOpen - The state for managing the sidebar's open/close state.
    * @property {boolean} showButtonTop - The state for managing the visibility of the "Back to Top" button.
    * @property {RefObject<HTMLDivElement>} divRef - The reference to the main content div.
    * @property {object} tokens - The tokens retrieved from local storage.
    * @property {string} userRole - The role of the user.
    * @property {string} data - The decrypted user role.
    * @property {boolean} isPathMatch - The flag to check if the current path matches a specific pattern.
    * @property {boolean} isAdmin - The flag to check if the user is an admin.
    * @property {boolean} showSidebar - The flag to determine if the sidebar should be shown.
    * @property {boolean} showFooter - The flag to determine if the footer should be shown.
    */
const Default = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showButtonTop, setShowButtonTop] = useState(false)
  const divRef = useRef(null)
  const { id } = useParams<{ id: string }>()

  // Add overflow hidden class to body on mount and remove on unmount
  useEffect(() => {
    document.body.classList.add('overflow-y-hidden')
    return () => {
      document.body.classList.remove('overflow-y-hidden')
    }
  }, [])

  // Handle scroll event to show/hide "Back to Top" button
  useEffect(() => {
    const divElement = divRef.current as HTMLDivElement | null
    if (divElement) {
      const divElement = divRef.current as unknown as HTMLDivElement

      const scrollFunction = () => {
        if (divElement.scrollTop > 200) {
          setShowButtonTop(true)
        } else {
          setShowButtonTop(false)
        }
      }

      divElement.addEventListener('scroll', scrollFunction)

      return () => {
        divElement.removeEventListener('scroll', scrollFunction)
      }
    }
  }, [])
  const location = useLocation()
  const userRoleFromRedux = useSelector(selectUserRole)
  // eslint-disable-next-line prefer-regex-literals
  const pathRegEx = /^\/lesson\/edit\/[^/]+$/
  const isPathMatch = pathRegEx.test(location.pathname)
  const isAdmin = userRoleFromRedux?.toUpperCase() === 'ADMIN'
  const alwaysShowSidebarPaths = ['/permission', '/user', '/lesson', '/lesson/add', '/dashboard/enrollment_dashboard', '/categorycourse', '/course', '/categorylession', '/course/addcourse', `/course/editcourse/${id ?? ''}`, '/exam-management', '/question-bank', `/exam-management/edit/${id ?? ''}`, '/exam-management/add', '/banner', '/progress-dashboard']
  const showSidebar = (alwaysShowSidebarPaths.includes(location.pathname) && isAdmin) || (isPathMatch && isAdmin)
  const showFooter = !location.pathname.startsWith('/learning')

  // Scroll to top on location change
  useEffect(() => {
    const divElement = divRef.current as HTMLDivElement | null
    if (divElement) {
      const divElement = divRef.current as unknown as HTMLDivElement
      divElement.scrollTop = 0
    }
  }, [location.pathname])

  return (
       <DivRefContext.Provider value={divRef}>
         <ShowButtonTopContext.Provider value={{ showButtonTop, setShowButtonTop }}>
           <div className="flex h-screen overflow-hidden">
             {showSidebar && <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />}
             <div className={`relative flex flex-col flex-1 overflow-x-hidden ${showFooter ? 'overflow-y-auto' : 'overflow-y-hidden'}`} ref={divRef}>
               <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
               <Styled.Main>
                 <Outlet />
               </Styled.Main>
               <Footer />
             </div>
           </div>
         </ShowButtonTopContext.Provider>
       </DivRefContext.Provider>
  )
}

export default Default
