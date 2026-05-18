/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { useSelector, useDispatch } from 'react-redux'
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'

import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import KeyboardReturnOutlinedIcon from '@mui/icons-material/KeyboardReturnOutlined'

import { getFromLocalStorage, removeLocalStorage } from 'utils/functions'
import CryptoJS from 'crypto-js'

import ROUTES from 'routes/constant'

import { useTranslation } from 'react-i18next'
import { removeAllNotificationsSlice } from '../redux/notification/notifySlice'
import { selectUserRole, selectAuthTokens, clearAuthData } from '../redux/auth/authSlice'

interface SidebarProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

/**
 * Sidebar component displays the sidebar navigation menu.
 *
 * @author Hien
 * @component
 * @param {SidebarProps} props - The props for the component.
 * @returns {JSX.Element} The rendered Sidebar component.
 *
 * @property {boolean} sidebarOpen - The state for managing the sidebar's open/close state.
 * @property {function} setSidebarOpen - The function to set the sidebar's open/close state.
 */
const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const userRoleFromRedux = useSelector(selectUserRole)
  const tokensFromRedux = useSelector(selectAuthTokens)

  const userLastName = tokensFromRedux?.lastName
  const userFirstName = tokensFromRedux?.firstName
  const userEmail = tokensFromRedux?.email
  const userAvatar = tokensFromRedux?.avatar
  const data = userRoleFromRedux
  const location = useLocation()
  const { pathname } = location

  const sidebar = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)

  const storedSidebarExpanded = localStorage.getItem('sidebar-expanded')
  const [sidebarExpanded, setSidebarExpanded] = useState(storedSidebarExpanded === null ? false : storedSidebarExpanded === 'true')

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }: { target: EventTarget | null }) => {
      if (!sidebar.current || !trigger.current) return
      if (!sidebarOpen || sidebar.current.contains(target as Node) || trigger.current.contains(target as Node)) return
      setSidebarOpen(false)
    }
    document.addEventListener('click', clickHandler)
    return () => document.removeEventListener('click', clickHandler)
  })

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }: { keyCode: number }) => {
      if (!sidebarOpen || keyCode !== 27) return
      setSidebarOpen(false)
    }
    document.addEventListener('keydown', keyHandler)
    return () => document.removeEventListener('keydown', keyHandler)
  })

  // Update sidebar expanded state in local storage
  useEffect(() => {
    localStorage.setItem('sidebar-expanded', sidebarExpanded.toString())
    if (sidebarExpanded) {
      document.querySelector('body')?.classList.add('sidebar-expanded')
    } else {
      document.querySelector('body')?.classList.remove('sidebar-expanded')
    }
  }, [sidebarExpanded])

  /**
   * Handles user logout.
   *
   * @async
   * @returns {Promise<void>}
   */
  const handleLogout = useCallback(async () => {
    removeLocalStorage('tokens')
    navigate(ROUTES.login)
    dispatch(removeAllNotificationsSlice())
    dispatch(clearAuthData())
  }, [navigate])

  const getAvatarUrl = (avatarPath?: string) => {
    // Check if avatarPath starts with 'http'
    if (avatarPath?.startsWith('http')) {
      return avatarPath
    }
    // If not, replace '../../client/public' with an empty string or return a default URL
    return avatarPath
      ? `${process.env.REACT_APP_API}/uploads/avatars/${avatarPath}`
      : `${process.env.REACT_APP_API}/uploads/avatars/avatardefault.png`
  }

  return (
    <div>
      {/* Sidebar backdrop (mobile only) */}
      <div
        className={`fixed inset-0 bg-slate-900 bg-opacity-30 z-40 lg:hidden lg:z-auto transition-opacity duration-200 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        aria-hidden="true"
      ></div>

      {/* Sidebar */}
      <div
        id="sidebar"
        ref={sidebar}
        className={`flex flex-col absolute z-40 left-0 top-0 lg:static lg:left-auto lg:top-auto lg:translate-x-0 h-screen overflow-y-scroll lg:overflow-y-auto no-scrollbar w-64 lg:w-24 lg:sidebar-expanded:!w-64 2xl:!w-64 shrink-0 bg-white shadow-right p-4 transition-all duration-200 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-64'
          }`}
      >
        {/* Sidebar header */}
        {/* <div className="flex justify-between mb-10 pr-3 sm:px-2">
          <button
            ref={trigger}
            className="lg:hidden text-slate-500 hover:text-slate-400"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-controls="sidebar"
            aria-expanded={sidebarOpen}
          >
            <span className="sr-only">Close sidebar</span>
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.7 18.7l1.4-1.4L7.8 13H20v-2H7.8l4.3-4.3-1.4-1.4L4 12z" />
            </svg>
          </button>
          <NavLink end to="/" className="block">
            <svg width="32" height="32" viewBox="0 0 32 32">
              <defs>
                <linearGradient x1="28.538%" y1="20.229%" x2="100%" y2="108.156%" id="logo-a">
                  <stop stopColor="#A5B4FC" stopOpacity="0" offset="0%" />
                  <stop stopColor="#A5B4FC" offset="100%" />
                </linearGradient>
                <linearGradient x1="88.638%" y1="29.267%" x2="22.42%" y2="100%" id="logo-b">
                  <stop stopColor="#38BDF8" stopOpacity="0" offset="0%" />
                  <stop stopColor="#38BDF8" offset="100%" />
                </linearGradient>
              </defs>
              <rect fill="#6366F1" width="32" height="32" rx="16" />
              <path d="M18.277.16C26.035 1.267 32 7.938 32 16c0 8.837-7.163 16-16 16a15.937 15.937 0 01-10.426-3.863L18.277.161z" fill="#4F46E5" />
              <path
                d="M7.404 2.503l18.339 26.19A15.93 15.93 0 0116 32C7.163 32 0 24.837 0 16 0 10.327 2.952 5.344 7.404 2.503z"
                fill="url(#logo-a)"
              />
              <path
                d="M2.223 24.14L29.777 7.86A15.926 15.926 0 0132 16c0 8.837-7.163 16-16 16-5.864 0-10.991-3.154-13.777-7.86z"
                fill="url(#logo-b)"
              />
            </svg>
          </NavLink>
        </div> */}

        {/* Links */}
        <div className="space-y-8">
          {/* Pages group */}
          <div>
            <div className="mb-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <img className="rounded-full object-cover w-10 h-10" src={getAvatarUrl(userAvatar)} referrerPolicy="no-referrer" alt="User avatar" onError={(e) => {
                    e.currentTarget.src = `${process.env.REACT_APP_API}/uploads/avatars/avatardefault.png`
                  }} />
                </div>
                <div className="w-36 ml-4 flex flex-col justify-center lg:hidden lg:sidebar-expanded:block 2xl:block">
                  <p className='font-semibold text-base overflow-hidden overflow-ellipsis whitespace-nowrap'>
                    {`${userFirstName || ''} ${userLastName || ''}`}
                  </p>
                  <p className='text-gray-500 text-xs overflow-hidden overflow-ellipsis whitespace-nowrap'>{userEmail}</p>
                </div>
              </div>
              <div className="ml-1 text-gray-500 text-base font-mono">
                <p>{data}</p>
              </div>
            </div>
            <h3 className="text-xs uppercase text-slate-500 font-semibold pl-3 mt-3">
              <span className="hidden lg:block lg:sidebar-expanded:hidden 2xl:hidden text-center w-6" aria-hidden="true">
                •••
              </span>
              {/* <span className="lg:hidden lg:sidebar-expanded:block 2xl:block">{t('sidebar.pages')}</span> */}
            </h3>
            <ul className="mt-3">
              {/* categorycourse */}
              <li className={`px-3 py-2 rounded-sm mb-0.5 last:mb-0 ${pathname === '/categorycourse' && 'bg-teal-300 text-blue-500'}`}>
                <NavLink
                  end
                  to="/categorycourse"
                  className={`block ${pathname === '/categorycourse' ? 'text-white' : 'text-gray-500'} hover:text-neutral-400 truncate transition duration-150 ${pathname === '/categorycourse' && 'hover:text-slate-200'}`}
                >
                  <div className="flex items-center">
                    <img
                      className="shrink-0 h-6 w-6"
                      src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAuElEQVR4nO2YQQ7CMBAD/Q3KP6G8j/ConowiFcGBlCCQdhvNSL7b2XgPKwEAAMBbbpKcXEUfOCYw6U5NW0EuCQy6U3NrEjXEksCgO7WsYaY9dcI9nfEgUrQBgoiJKPz7mI7oZSsE4X9PZJggTi5FGyCImIjCv4/piAZcv1GYr6X44pqyK/5Fmci3Wyu7VBKY+FXXx66uR67zDg90p9bpdE5g0J2qD9/kkMCgO1W9blL21AkAAADQkztYAoleL0tBMgAAAABJRU5ErkJggg=="
                      alt="category Icon"
                    />
                    <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                      {t('sidebar.category_course')}
                    </span>
                  </div>
                </NavLink>
              </li>
             {/* group management */}
            <li className={`px-3 py-2 rounded-sm mb-0.5 last:mb-0 ${pathname === '/group-management' && 'bg-teal-300 text-blue-500'}`}>
              <NavLink
                end
                to="/group-management"
                className={`block ${pathname === '/group-management' ? 'text-white' : 'text-gray-500'} hover:text-neutral-400 truncate transition duration-150 ${pathname === '/group-management' && 'hover:text-slate-200'}`}
              >
                <div className="flex items-center">
                  <svg className="shrink-0 h-6 w-6" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
                      stroke="#6b7280"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle
                      cx="9"
                      cy="7"
                      r="4"
                      stroke="#6b7280"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M23 21v-2a4 4 0 0 0-3-3.87"
                      stroke="#6b7280"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M16 3.13a4 4 0 0 1 0 7.75"
                      stroke="#6b7280"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                    {t('sidebar.group_management')}
                  </span>
                </div>
              </NavLink>
            </li>
              {/* course */}
              <li className={`px-3 py-2 rounded-sm mb-0.5 last:mb-0 ${pathname.startsWith('/course') && 'bg-teal-300 text-blue-500'}`}>
                <NavLink
                  end
                  to="/course"
                  className={`block ${pathname.startsWith('/course') ? 'text-white' : 'text-gray-500'} hover:text-neutral-400 truncate transition duration-150 ${pathname.startsWith('/course') && 'hover:text-slate-200'}`}
                >
                  <div className="flex items-center">
                    <img
                      className="shrink-0 h-6 w-6"
                      src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAACX0lEQVR4nO3aOWgUcRTH8Q8aRRFvFNFCEdN5oWihFnY2YqOIrVbaaGshHnigaGFlk87CxKtIIUIQxKsSVLSwsEjhgWiMJ3gRVwZeYFkm2ZndWdeE+cIrdvb/3v//m3n7/m9mlpLxwQNUMtpnXMOyKv9OXMeXHHHut0JIpQEbqPIfaDBG4VSaXEiz/oVRCgnKK1I0ZWoFZWoVTZlaQZlaRVOmVlCmVtGUqRWUqVU04ya17rVByF1tYgpW4Qw+pghJjp3Gyhg7JpiLnqrPPXGspKTkP2M5DuMW+qPiDOIFurEPM1q8hpk4i/f4gHOYlMVxKnbjYcY6/xUXQnTR7MKblDmPj+a0NJQ3+lgzsdvYgY4mBXSib5R5XqY5bcQNDDUhoNZe4RAW5BQwBUfxo078VCF5nozntZ+4hPUZRGyJ316WuMfSAlT+kfViYcr8ybHLOeIkryomtFPIcEosjnkn4kC8R6lksCTdDoafdgtJ7GrMuyaHz+NoMkel2YVtwJI4W08zjP9WVebrjf2NE5hcT0RRQqpJ9pNTsYGmjU/2hYRZdeI+z1gkChPyJ25+9mJOTezVUYbv4BPeYXt8t22EeEM4H1csF0WX297YkUdrXabhWYp/PzbnFdAKIbWi+qIybQphiW3Fo5TxXZjeqIhWCslqbyPNmiYt+GB0veswG/PiTHZF1SlKRHfK76phaoNfqXNfnbTV+6OqNCogaUx3Nr7kdIaDf498zsNaXMSvHCJuYpEWPat6ghVNxEj6pSPR9Y4kIGlF9hgjdMQ+kfzf5HXcUSYV6iTmt3txJSWy8xduESW8/IhHygAAAABJRU5ErkJggg=="
                      alt="Course Icon"
                    />
                    <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                      {t('sidebar.course')}
                    </span>
                  </div>
                </NavLink>
              </li>

              {/* categorylession */}
              <li className={`px-3 py-2 rounded-sm mb-0.5 last:mb-0 ${pathname.includes('categorylession') && 'bg-teal-300 text-blue-500'}`}>
                <NavLink
                  end
                  to="/categorylession"
                  className={`block ${pathname.includes('categorylession') ? 'text-white' : 'text-gray-500'} hover:text-neutral-400 truncate transition duration-150 ${pathname.includes('course') && 'hover:text-slate-200'}`}
                >
                  <div className="flex items-center">
                    <img
                      className="shrink-0 h-6 w-6"
                      src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAAA8ElEQVR4nO2ZUQrCMBBE34egF7LtCQXR2lPaeov1J2IIlUbMRiszsNCWJMOQTCY0IAiCIHwJO2AAJsAK1QhcwtjVeIaCA6fVR0LceSZHglskxJ3HnOsBdx6TEDQjVmNp7Re26zZp284853ikOI8l1SwQdEnbbuY5R0hxHpPZkdlNZkdmR0cUdNaierKn/byS3XJ4PknctJ9XslsOj5IdJTt/lezmLaSpdIx3F2KlCSQEzQjvmj3dJFZrdnth/J8QYjI72rVMS4unRzx/99cy+5VwSbJ2ISfCtVUfrrHWJmQEzsAWR2yAQ/R+DN8EQRAE7rTi/Qk3ebHqAAAAAElFTkSuQmCC"
                      alt="categorylession Icon"
                    />
                    <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                      {t('sidebar.category_lesson')}
                    </span>
                  </div>
                </NavLink>
              </li>
              {/* lesson */}
              <li className={`px-3 py-2 rounded-sm mb-0.5 last:mb-0 ${pathname.includes('lesson') && 'bg-teal-300 text-blue-500'}`}>
                <NavLink
                  end
                  to="/lesson"
                  className={`block ${pathname.includes('lesson') ? 'text-white' : 'text-gray-500'} hover:text-neutral-400 truncate transition duration-150 ${pathname.includes('lesson') && 'hover:text-slate-200'}`}
                >
                  <div className="flex items-center">
                    <svg className="shrink-0 h-6 w-6" viewBox="0 0 24 24">
                      <path d="M4 19V6.2C4 5.0799 4 4.51984 4.21799 4.09202C4.40973 3.71569 4.71569 3.40973 5.09202 3.21799C5.51984 3 6.0799 3 7.2 3H16.8C17.9201 3 18.4802 3 18.908 3.21799C19.2843 3.40973 19.5903 3.71569 19.782 4.09202C20 4.51984 20 5.0799 20 6.2V17H6C4.89543 17 4 17.8954 4 19ZM4 19C4 20.1046 4.89543 21 6 21H20M9 7H15M9 11H15M19 17V21" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                      {t('lesson.lesson')}
                    </span>
                  </div>
                </NavLink>
              </li>
              {/* Permissions */}
              <li className={`px-3 py-2 rounded-sm mb-0.5 last:mb-0 ${pathname.includes('permission') && 'bg-teal-300 text-blue-500'}`}>
                <NavLink
                  end
                  to="/permission"
                  className={`block ${pathname.includes('permission') ? 'text-white' : 'text-gray-500'} hover:text-neutral-400 truncate transition duration-150 ${pathname.includes('permission') && 'hover:text-slate-200'}`}
                >
                  <div className="flex items-center">
                    <svg className="shrink-0 h-6 w-6" viewBox="0 0 24 24">
                      <path className={`fill-current text-slate-600 ${pathname.includes('permission') && 'text-white'}`} d="M1 3h22v20H1z" />
                      <path
                        className={`fill-current text-slate-400 ${pathname.includes('permission') && 'text-teal-500'}`}
                        d="M21 3h2v4H1V3h2V1h4v2h10V1h4v2Z"
                      />
                    </svg>
                    <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                      {t('sidebar.permissions')}
                    </span>
                  </div>
                </NavLink>
              </li>
              {/* users */}
              <li className={`px-3 py-2 rounded-sm mb-0.5 last:mb-0 ${pathname.includes('user') && 'bg-teal-300 text-blue-500'}`}>
                <NavLink
                  end
                  to="/user"
                  className={`block ${pathname.includes('user') ? 'text-white' : 'text-gray-500'} hover:text-neutral-400 truncate transition duration-150 ${pathname.includes('user') && 'hover:text-slate-200'}`}
                >
                  <div className="flex items-center">
                    <svg className="shrink-0 h-6 w-6" viewBox="0 0 24 24">
                      <path
                        className={`fill-current text-slate-600 ${pathname.includes('user') && 'text-indigo-500'}`}
                        d="M20 7a.75.75 0 01-.75-.75 1.5 1.5 0 00-1.5-1.5.75.75 0 110-1.5 1.5 1.5 0 001.5-1.5.75.75 0 111.5 0 1.5 1.5 0 001.5 1.5.75.75 0 110 1.5 1.5 1.5 0 00-1.5 1.5A.75.75 0 0120 7zM4 23a.75.75 0 01-.75-.75 1.5 1.5 0 00-1.5-1.5.75.75 0 110-1.5 1.5 1.5 0 001.5-1.5.75.75 0 111.5 0 1.5 1.5 0 001.5 1.5.75.75 0 110 1.5 1.5 1.5 0 00-1.5 1.5A.75.75 0 014 23z"
                      />
                      <path
                        className={`fill-current text-slate-400 ${pathname.includes('user') && 'text-white'}`}
                        d="M17 23a1 1 0 01-1-1 4 4 0 00-4-4 1 1 0 010-2 4 4 0 004-4 1 1 0 012 0 4 4 0 004 4 1 1 0 010 2 4 4 0 00-4 4 1 1 0 01-1 1zM7 13a1 1 0 01-1-1 4 4 0 00-4-4 1 1 0 110-2 4 4 0 004-4 1 1 0 112 0 4 4 0 004 4 1 1 0 010 2 4 4 0 00-4 4 1 1 0 01-1 1z"
                      />
                    </svg>
                    <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                      {t('sidebar.users')}
                    </span>
                  </div>
                </NavLink>
              </li>
              {/* dashboard */}
              <li className={`px-3 py-2 rounded-sm mb-0.5 last:mb-0 ${pathname.includes('enrollment_dashboard') && 'bg-teal-300 text-blue-500'}`}>
                <NavLink
                  end
                  to="/dashboard/enrollment_dashboard"
                  className={`block ${pathname.includes('enrollment_dashboard') ? 'text-white' : 'text-gray-500'} hover:text-neutral-400 truncate transition duration-150 ${pathname.includes('enrollment_dashboard') && 'hover:text-slate-200'}`}
                >
                  <div className="flex items-center">
                    <svg className="shrink-0 h-6 w-6" viewBox="0 0 24 24">
                      <path
                        className={`fill-current text-slate-400 ${pathname.includes('enrollment_dashboard') && 'text-indigo-300'}`}
                        d="M13 15l11-7L11.504.136a1 1 0 00-1.019.007L0 7l13 8z"
                      />
                      <path
                        className={`fill-current text-slate-700 ${pathname.includes('enrollment_dashboard') && '!text-white'}`}
                        d="M13 15L0 7v9c0 .355.189.685.496.864L13 24v-9z"
                      />
                      <path
                        className={`fill-current text-slate-600 ${pathname.includes('enrollment_dashboard') && 'text-white'}`}
                        d="M13 15.047V24l10.573-7.181A.999.999 0 0024 16V8l-11 7.047z"
                      />
                    </svg>
                    <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                      {t('sidebar.dashboard')}
                    </span>
                  </div>
                </NavLink>
              </li>
              {/* progress-dashboard */}
              <li className={`px-3 py-2 rounded-sm mb-0.5 last:mb-0 ${pathname.includes('progress-dashboard') && 'bg-teal-300 text-blue-500'}`}>
                <NavLink
                  end
                  to="/progress-dashboard"
                  className={`block ${pathname.includes('progress-dashboard') ? 'text-white' : 'text-gray-500'} hover:text-neutral-400 truncate transition duration-150 ${pathname.includes('progress-dashboard') && 'hover:text-slate-200'}`}
                >
                  <div className="flex items-center">
                    <svg className="shrink-0 h-6 w-6" viewBox="0 0 24 24" fill="none">
                      <path d="M3 3V21M21 21H3" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M18 17L13 12L9 16L3 10" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="18" cy="17" r="1" fill="#6b7280"/>
                      <circle cx="13" cy="12" r="1" fill="#6b7280"/>
                      <circle cx="9" cy="16" r="1" fill="#6b7280"/>
                      <circle cx="3" cy="10" r="1" fill="#6b7280"/>
                    </svg>
                    <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                      {t('sidebar.progressDashboard')}
                    </span>
                  </div>
                </NavLink>
              </li>
              {/* exam-management */}
              <li className={`px-3 py-2 rounded-sm mb-0.5 last:mb-0 ${pathname.includes('exam-management') && 'bg-teal-300 text-blue-500'}`}>
                <NavLink
                  end
                  to="/exam-management"
                  className={`block ${pathname.includes('exam-management') ? 'text-white' : 'text-gray-500'} hover:text-neutral-400 truncate transition duration-150 ${pathname.includes('exam-management') && 'hover:text-slate-200'}`}
                >
                  <div className="flex items-center">
                    <img src='/assets/images/sidebar/exam_icon.png' alt="icon_exam" className='w-6 h-6' />
                    <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                      {t('sidebar.examManagement')}
                    </span>
                  </div>
                </NavLink>
              </li>
              {/* question-bank */}
              <li className={`px-3 py-2 rounded-sm mb-0.5 last:mb-0 ${pathname.includes('question-bank') && 'bg-teal-300 text-blue-500'}`}>
                <NavLink
                  end
                  to="/question-bank"
                  className={`block ${pathname.includes('question-bank') ? 'text-white' : 'text-gray-500'} hover:text-neutral-400 truncate transition duration-150 ${pathname.includes('question-bank') && 'hover:text-slate-200'}`}
                >
                  <div className="flex items-center">
                    <img src='/assets/images/sidebar/question_icon.png' alt="icon_question" className='w-6 h-6' />
                    <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                      {t('sidebar.questionBank')}
                    </span>
                  </div>
                </NavLink>
              </li>
              {/* Banner */}
              <li className={`px-3 py-2 rounded-sm mb-0.5 last:mb-0 ${pathname.includes('banner') && 'bg-teal-300 text-blue-500'}`}>
                <NavLink
                  end
                  to="/banner"
                  className={`block ${pathname.includes('banner') ? 'text-white' : 'text-gray-500'} hover:text-neutral-400 truncate transition duration-150 ${pathname.includes('banner') && 'hover:text-slate-200'}`}
                >
                  <div className="flex items-center">
                    <svg className="shrink-0 h-6 w-6" viewBox="0 0 24 24">
                      <path
                        className={`fill-current text-slate-600 ${pathname.includes('banner') && 'text-white'}`}
                        d="M3 5h18a2 2 0 012 2v10a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2z"
                      />
                    </svg>
                    <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                      {t('sidebar.banner')}
                    </span>
                  </div>
                </NavLink>
              </li>
              <hr className="bg-slate-200 my-5" />
              {/* Return to User */}
              <li className={`px-3 py-2 rounded-sm mb-0.5 last:mb-0 ${pathname.includes('return') && 'bg-teal-300 text-blue-500'}`}>
                <NavLink
                  end
                  to="/"
                  className={`block ${pathname.includes('return') ? 'text-white' : 'text-gray-500'} hover:text-neutral-400 truncate transition duration-150 ${pathname.includes('return') && 'hover:text-slate-200'}`}
                >
                  <div className="flex items-center">
                    <KeyboardReturnOutlinedIcon />
                    <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                      {t('sidebar.returnToUser')}
                    </span>
                  </div>
                </NavLink>
              </li>
              {/* Log out */}
              <li className={`px-3 py-2 rounded-sm mb-0.5 last:mb-0 ${pathname.includes('logout') && 'bg-teal-300 text-blue-500'}`}>
                <NavLink
                  end
                  to="/login"
                  onClick={handleLogout}
                  className={`block ${pathname.includes('logout') ? 'text-white' : 'text-gray-500'} hover:text-neutral-400 truncate transition duration-150 ${pathname.includes('logout') && 'hover:text-slate-200'}`}
                >
                  <div className="flex items-center">
                    <LogoutOutlinedIcon />
                    <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                      {t('sidebar.logOut')}
                    </span>
                  </div>
                </NavLink>
              </li>
            </ul>
          </div>
        </div>

        {/* Expand / collapse button */}
        <div className="pt-3 hidden lg:inline-flex 2xl:hidden justify-end mt-auto">
          <div className="px-3 py-2">
            <button onClick={() => setSidebarExpanded(!sidebarExpanded)}>
              <span className="sr-only">Expand / collapse sidebar</span>
              <svg className="w-6 h-6 fill-current sidebar-expanded:rotate-180" viewBox="0 0 24 24">
                <path className="text-slate-400" d="M19.586 11l-5-5L16 4.586 23.414 12 16 19.414 14.586 18l5-5H7v-2z" />
                <path className="text-slate-600" d="M3 23H1V1h2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
